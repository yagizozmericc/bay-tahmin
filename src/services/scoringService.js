import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';

const USER_STATS_COLLECTION = 'userStats';
const PREDICTIONS_COLLECTION = 'predictions';

const outcome = (home, away) => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
};

const normalizeScorers = (scorers = []) => {
  if (!Array.isArray(scorers)) {
    return [];
  }

  return scorers
    .map((scorer) => (typeof scorer === 'string' ? scorer.trim().toLowerCase() : ''))
    .filter(Boolean);
};

export const calculatePredictionPoints = (prediction, matchResult) => {
  if (!prediction || !matchResult || !matchResult.finalScore) {
    return {
      points: 0,
      exactScore: false,
      correctOutcome: false,
      scorerHits: []
    };
  }

  const predictedHome = Number(prediction.homeScore);
  const predictedAway = Number(prediction.awayScore);

  const actualHome = Number(matchResult.finalScore.home);
  const actualAway = Number(matchResult.finalScore.away);

  const exactScore = Number.isFinite(predictedHome)
    && Number.isFinite(predictedAway)
    && predictedHome === actualHome
    && predictedAway === actualAway;

  const predictedOutcome = Number.isFinite(predictedHome) && Number.isFinite(predictedAway)
    ? outcome(predictedHome, predictedAway)
    : null;
  const actualOutcome = outcome(actualHome, actualAway);
  const correctOutcome = exactScore || (predictedOutcome !== null && predictedOutcome === actualOutcome);

  const predictedScorers = normalizeScorers(prediction.scorers);
  const actualScorers = normalizeScorers(matchResult.scorers);
  const actualSet = new Set(actualScorers);
  const scorerHits = predictedScorers.filter((scorer) => actualSet.has(scorer));

  let points = 0;
  if (exactScore) {
    points += 3;
  } else if (correctOutcome) {
    points += 1;
  }

  points += scorerHits.length;

  return {
    points,
    exactScore,
    correctOutcome,
    scorerHits
  };
};

const getUserStats = async (userId) => {
  const ref = doc(db, USER_STATS_COLLECTION, userId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateUserStatsWithResult = async (userId, evaluation) => {
  if (!userId) {
    return;
  }

  const statsRef = doc(db, USER_STATS_COLLECTION, userId);
  const existing = await getUserStats(userId);

  const base = existing || {
    totalPoints: 0,
    totalPredictions: 0,
    correctOutcomes: 0,
    exactScores: 0,
    currentStreak: 0,
    bestStreak: 0
  };

  const pointsEarned = evaluation.points || 0;
  const correctOutcome = Boolean(evaluation.correctOutcome);
  const exactScore = Boolean(evaluation.exactScore);

  const updated = {
    totalPoints: (base.totalPoints || 0) + pointsEarned,
    totalPredictions: (base.totalPredictions || 0) + 1,
    correctOutcomes: (base.correctOutcomes || 0) + (correctOutcome ? 1 : 0),
    exactScores: (base.exactScores || 0) + (exactScore ? 1 : 0)
  };

  const previousStreak = base.currentStreak || 0;
  const newStreak = pointsEarned > 0 ? previousStreak + 1 : 0;
  const bestStreak = Math.max(base.bestStreak || 0, newStreak);

  const accuracy = updated.totalPredictions > 0
    ? Number(((updated.correctOutcomes / updated.totalPredictions) * 100).toFixed(2))
    : 0;

  await setDoc(statsRef, {
    ...base,
    ...updated,
    currentStreak: newStreak,
    bestStreak,
    accuracy,
    lastUpdated: serverTimestamp()
  });
};

export const processMatchResult = async (matchId, matchResult) => {
  if (!matchId || !matchResult) {
    return { processed: 0 };
  }

  const predictionsRef = collection(db, PREDICTIONS_COLLECTION);
  const q = query(predictionsRef, where('matchId', '==', matchId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { processed: 0 };
  }

  const batch = writeBatch(db);
  const evaluations = [];

  snapshot.docs.forEach((docSnapshot) => {
    const prediction = docSnapshot.data();
    if (!prediction || prediction.status === 'scored') {
      return;
    }

    const evaluation = calculatePredictionPoints(prediction, matchResult);

    const predictionRef = doc(db, PREDICTIONS_COLLECTION, docSnapshot.id);
    batch.update(predictionRef, {
      points: evaluation.points,
      status: 'scored',
      evaluation,
      result: matchResult,
      evaluatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (prediction.userId) {
      evaluations.push({ userId: prediction.userId, evaluation });
    }
  });

  await batch.commit();

  await Promise.all(
    evaluations.map(({ userId, evaluation }) => updateUserStatsWithResult(userId, evaluation))
  );

  return { processed: evaluations.length };
};