import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Scoring system configuration
const SCORING_RULES = {
  EXACT_SCORE: 10,        // Exact score prediction
  CORRECT_RESULT: 5,      // Correct winner (1, X, 2)
  CORRECT_GOAL_DIFFERENCE: 3, // Correct goal difference
  CORRECT_SCORER: 2,      // Correct goal scorer prediction
  PARTICIPATION: 1        // Participation bonus
};

/**
 * Calculate prediction score based on actual match result
 * @param {Object} prediction - User prediction
 * @param {Object} matchResult - Actual match result
 */
export const calculatePredictionScore = (prediction, matchResult) => {
  let score = 0;
  let details = {
    isExactScore: false,
    isCorrectResult: false,
    isCorrectGoalDifference: false,
    isCorrectScorer: false,
    hasParticipation: true,
    breakdown: []
  };

  // Participation bonus
  score += SCORING_RULES.PARTICIPATION;
  details.breakdown.push({
    type: 'participation',
    points: SCORING_RULES.PARTICIPATION,
    description: 'Participation bonus'
  });

  // Extract scores
  const predictedHome = parseInt(prediction.homeScore) || 0;
  const predictedAway = parseInt(prediction.awayScore) || 0;
  const actualHome = parseInt(matchResult.homeScore) || 0;
  const actualAway = parseInt(matchResult.awayScore) || 0;

  // Check for exact score
  if (predictedHome === actualHome && predictedAway === actualAway) {
    score += SCORING_RULES.EXACT_SCORE;
    details.isExactScore = true;
    details.breakdown.push({
      type: 'exact_score',
      points: SCORING_RULES.EXACT_SCORE,
      description: `Exact score: ${actualHome}-${actualAway}`
    });
  } else {
    // Check for correct result (1, X, 2)
    const predictedResult = getMatchResult(predictedHome, predictedAway);
    const actualResult = getMatchResult(actualHome, actualAway);

    if (predictedResult === actualResult) {
      score += SCORING_RULES.CORRECT_RESULT;
      details.isCorrectResult = true;
      details.breakdown.push({
        type: 'correct_result',
        points: SCORING_RULES.CORRECT_RESULT,
        description: `Correct result: ${getResultDescription(actualResult)}`
      });

      // Check for correct goal difference (only if result is correct but not exact)
      const predictedDiff = Math.abs(predictedHome - predictedAway);
      const actualDiff = Math.abs(actualHome - actualAway);

      if (predictedDiff === actualDiff) {
        score += SCORING_RULES.CORRECT_GOAL_DIFFERENCE;
        details.isCorrectGoalDifference = true;
        details.breakdown.push({
          type: 'correct_goal_difference',
          points: SCORING_RULES.CORRECT_GOAL_DIFFERENCE,
          description: `Correct goal difference: ${actualDiff}`
        });
      }
    }
  }

  // Check for correct goal scorer (if prediction includes scorer)
  if (prediction.goalScorer && matchResult.goalScorers) {
    const predictedScorer = prediction.goalScorer.toLowerCase();
    const actualScorers = matchResult.goalScorers.map(s => s.toLowerCase());

    if (actualScorers.includes(predictedScorer)) {
      score += SCORING_RULES.CORRECT_SCORER;
      details.isCorrectScorer = true;
      details.breakdown.push({
        type: 'correct_scorer',
        points: SCORING_RULES.CORRECT_SCORER,
        description: `Correct goal scorer: ${prediction.goalScorer}`
      });
    }
  }

  return {
    totalScore: score,
    details
  };
};

/**
 * Get match result type (1 = home win, X = draw, 2 = away win)
 * @param {number} homeScore - Home team score
 * @param {number} awayScore - Away team score
 */
export const getMatchResult = (homeScore, awayScore) => {
  if (homeScore > awayScore) return '1';
  if (homeScore < awayScore) return '2';
  return 'X';
};

/**
 * Get result description
 * @param {string} result - Match result type
 */
export const getResultDescription = (result) => {
  switch (result) {
    case '1': return 'Home Win';
    case 'X': return 'Draw';
    case '2': return 'Away Win';
    default: return 'Unknown';
  }
};

/**
 * Update prediction with calculated score
 * @param {string} predictionId - Prediction document ID
 * @param {Object} scoreData - Score calculation result
 * @param {Object} matchResult - Match result data
 */
export const updatePredictionScore = async (predictionId, scoreData, matchResult) => {
  try {
    const predictionRef = doc(db, 'predictions', predictionId);

    await updateDoc(predictionRef, {
      points: scoreData.totalScore,
      isScored: true,
      scoringDetails: scoreData.details,
      actualResult: {
        homeScore: matchResult.homeScore,
        awayScore: matchResult.awayScore,
        result: getMatchResult(matchResult.homeScore, matchResult.awayScore)
      },
      scoredAt: serverTimestamp()
    });

    console.log(`Prediction ${predictionId} scored: ${scoreData.totalScore} points`);
    return true;
  } catch (error) {
    console.error('Error updating prediction score:', error);
    throw error;
  }
};

/**
 * Get unscored predictions for a specific match
 * @param {string} matchId - Match document ID
 */
export const getUnscoredPredictions = async (matchId) => {
  try {
    const predictionsRef = collection(db, 'predictions');
    const q = query(
      predictionsRef,
      where('matchId', '==', matchId),
      where('isScored', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const predictions = [];

    querySnapshot.forEach((doc) => {
      predictions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return predictions;
  } catch (error) {
    console.error('Error fetching unscored predictions:', error);
    throw error;
  }
};

/**
 * Score all predictions for a completed match
 * @param {string} matchId - Match document ID
 * @param {Object} matchResult - Match result data
 */
export const scorePredictionsForMatch = async (matchId, matchResult) => {
  try {
    console.log(`Scoring predictions for match ${matchId}`);

    // Get all unscored predictions for this match
    const predictions = await getUnscoredPredictions(matchId);

    if (predictions.length === 0) {
      console.log('No unscored predictions found for this match');
      return { scored: 0, errors: 0 };
    }

    console.log(`Found ${predictions.length} predictions to score`);

    let scored = 0;
    let errors = 0;

    // Score each prediction
    for (const prediction of predictions) {
      try {
        const scoreData = calculatePredictionScore(prediction, matchResult);
        await updatePredictionScore(prediction.id, scoreData, matchResult);
        scored++;
      } catch (error) {
        console.error(`Error scoring prediction ${prediction.id}:`, error);
        errors++;
      }
    }

    console.log(`Scoring completed for match ${matchId}. Scored: ${scored}, Errors: ${errors}`);

    return { scored, errors, total: predictions.length };
  } catch (error) {
    console.error('Error scoring predictions for match:', error);
    throw error;
  }
};

/**
 * Get all completed matches that need prediction scoring
 */
export const getMatchesNeedingScoring = async () => {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('isCompleted', '==', true),
      where('isPredictionsScored', '!=', true)
    );

    const querySnapshot = await getDocs(q);
    const matches = [];

    querySnapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return matches;
  } catch (error) {
    console.error('Error fetching matches needing scoring:', error);
    throw error;
  }
};

/**
 * Mark match as predictions scored
 * @param {string} matchId - Match document ID
 */
export const markMatchPredictionsScored = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      isPredictionsScored: true,
      predictionsScoredAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking match predictions as scored:', error);
    throw error;
  }
};

/**
 * Main function to process all completed matches and score predictions
 */
export const processCompletedMatches = async () => {
  try {
    console.log('Starting prediction scoring process...');

    // Get matches that need prediction scoring
    const matches = await getMatchesNeedingScoring();

    if (matches.length === 0) {
      console.log('No matches need prediction scoring');
      return { processedMatches: 0, totalScored: 0, totalErrors: 0 };
    }

    console.log(`Found ${matches.length} matches needing prediction scoring`);

    let processedMatches = 0;
    let totalScored = 0;
    let totalErrors = 0;

    // Process each match
    for (const match of matches) {
      try {
        console.log(`Processing match: ${match.homeTeam} vs ${match.awayTeam}`);

        const result = await scorePredictionsForMatch(match.id, {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          goalScorers: match.goalScorers || []
        });

        totalScored += result.scored;
        totalErrors += result.errors;

        // Mark match as processed
        await markMatchPredictionsScored(match.id);
        processedMatches++;

        console.log(`Match processed: ${result.scored} predictions scored`);

      } catch (error) {
        console.error(`Error processing match ${match.id}:`, error);
        totalErrors++;
      }
    }

    console.log(`Prediction scoring completed. Processed: ${processedMatches} matches, Scored: ${totalScored} predictions, Errors: ${totalErrors}`);

    return { processedMatches, totalScored, totalErrors };
  } catch (error) {
    console.error('Error in processCompletedMatches:', error);
    throw error;
  }
};

/**
 * Calculate user statistics based on scored predictions
 * @param {string} userId - User ID
 */
export const calculateUserStats = async (userId) => {
  try {
    const predictionsRef = collection(db, 'predictions');
    const q = query(
      predictionsRef,
      where('userId', '==', userId),
      where('isScored', '==', true)
    );

    const querySnapshot = await getDocs(q);

    let totalPredictions = 0;
    let totalPoints = 0;
    let exactScores = 0;
    let correctResults = 0;
    let correctGoalDifferences = 0;
    let correctScorers = 0;

    querySnapshot.forEach((doc) => {
      const prediction = doc.data();
      totalPredictions++;
      totalPoints += prediction.points || 0;

      if (prediction.scoringDetails?.isExactScore) exactScores++;
      if (prediction.scoringDetails?.isCorrectResult) correctResults++;
      if (prediction.scoringDetails?.isCorrectGoalDifference) correctGoalDifferences++;
      if (prediction.scoringDetails?.isCorrectScorer) correctScorers++;
    });

    const accuracy = totalPredictions > 0
      ? Math.round((correctResults / totalPredictions) * 100)
      : 0;

    return {
      totalPredictions,
      totalPoints,
      accuracy,
      exactScores,
      correctResults,
      correctGoalDifferences,
      correctScorers,
      averagePointsPerPrediction: totalPredictions > 0
        ? Math.round((totalPoints / totalPredictions) * 100) / 100
        : 0
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
};