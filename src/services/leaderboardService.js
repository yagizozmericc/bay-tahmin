import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection references
const COLLECTIONS = {
  USERS: 'users',
  LEAGUES: 'leagues',
  PREDICTIONS: 'predictions',
  LEADERBOARDS: 'leaderboards'
};

/**
 * Get leaderboard data for a specific league
 * @param {string} leagueId - The league identifier
 * @param {string} period - Time period (overall, weekly, monthly)
 * @param {string} sortBy - Sort criteria (points, accuracy, predictions)
 * @param {number} limitCount - Number of results to return
 */
export const getLeaderboard = async (leagueId = 'general', period = 'overall', sortBy = 'points', limitCount = 50) => {
  try {
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARDS);
    let q;

    switch (sortBy) {
      case 'accuracy':
        q = query(
          leaderboardRef,
          where('leagueId', '==', leagueId),
          where('period', '==', period),
          orderBy('accuracy', 'desc'),
          orderBy('totalPoints', 'desc'),
          limit(limitCount)
        );
        break;
      case 'predictions':
        q = query(
          leaderboardRef,
          where('leagueId', '==', leagueId),
          where('period', '==', period),
          orderBy('totalPredictions', 'desc'),
          orderBy('totalPoints', 'desc'),
          limit(limitCount)
        );
        break;
      default: // points
        q = query(
          leaderboardRef,
          where('leagueId', '==', leagueId),
          where('period', '==', period),
          orderBy('totalPoints', 'desc'),
          orderBy('accuracy', 'desc'),
          limit(limitCount)
        );
    }

    const querySnapshot = await getDocs(q);
    const leaderboardData = [];

    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboardData.push({
        id: doc.id,
        position: index + 1,
        ...data
      });
    });

    return leaderboardData;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Get user's rank in a specific leaderboard
 * @param {string} userId - User ID
 * @param {string} leagueId - League ID
 * @param {string} period - Time period
 */
export const getUserRank = async (userId, leagueId = 'general', period = 'overall') => {
  try {
    const userLeaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, `${userId}_${leagueId}_${period}`);
    const userDoc = await getDoc(userLeaderboardRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }

    return null;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    throw error;
  }
};

/**
 * Update user's leaderboard position
 * @param {string} userId - User ID
 * @param {Object} stats - User statistics
 * @param {string} leagueId - League ID
 * @param {string} period - Time period
 */
export const updateUserLeaderboard = async (userId, stats, leagueId = 'general', period = 'overall') => {
  try {
    const userLeaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, `${userId}_${leagueId}_${period}`);

    const leaderboardData = {
      userId,
      leagueId,
      period,
      totalPoints: stats.totalPoints || 0,
      weeklyPoints: stats.weeklyPoints || 0,
      totalPredictions: stats.totalPredictions || 0,
      correctPredictions: stats.correctPredictions || 0,
      accuracy: stats.totalPredictions > 0 ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100) : 0,
      exactScores: stats.exactScores || 0,
      correctWinners: stats.correctWinners || 0,
      correctScorers: stats.correctScorers || 0,
      bestStreak: stats.bestStreak || 0,
      currentStreak: stats.currentStreak || 0,
      lastUpdated: serverTimestamp()
    };

    await setDoc(userLeaderboardRef, leaderboardData, { merge: true });
    return leaderboardData;
  } catch (error) {
    console.error('Error updating user leaderboard:', error);
    throw error;
  }
};

/**
 * Get leaderboard statistics
 * @param {string} leagueId - League ID
 */
export const getLeaderboardStats = async (leagueId = 'general') => {
  try {
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARDS);
    const q = query(
      leaderboardRef,
      where('leagueId', '==', leagueId),
      where('period', '==', 'overall')
    );

    const querySnapshot = await getDocs(q);
    let totalPlayers = 0;
    let totalPredictions = 0;
    let totalAccuracy = 0;
    let activeLeagues = new Set();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalPlayers++;
      totalPredictions += data.totalPredictions || 0;
      totalAccuracy += data.accuracy || 0;
      activeLeagues.add(data.leagueId);
    });

    const averageAccuracy = totalPlayers > 0 ? Math.round(totalAccuracy / totalPlayers) : 0;

    return {
      totalPlayers,
      totalPredictions,
      averageAccuracy,
      activeLeagues: activeLeagues.size
    };
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    throw error;
  }
};

/**
 * Get top performers
 * @param {string} leagueId - League ID
 * @param {number} limitCount - Number of top performers to return
 */
export const getTopPerformers = async (leagueId = 'general', limitCount = 3) => {
  try {
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARDS);

    // Most accurate predictors
    const accuracyQuery = query(
      leaderboardRef,
      where('leagueId', '==', leagueId),
      where('period', '==', 'overall'),
      where('totalPredictions', '>=', 10), // Minimum predictions for accuracy ranking
      orderBy('accuracy', 'desc'),
      orderBy('totalPredictions', 'desc'),
      limit(limitCount)
    );

    // Highest scorers
    const pointsQuery = query(
      leaderboardRef,
      where('leagueId', '==', leagueId),
      where('period', '==', 'overall'),
      orderBy('totalPoints', 'desc'),
      limit(limitCount)
    );

    const [accuracySnapshot, pointsSnapshot] = await Promise.all([
      getDocs(accuracyQuery),
      getDocs(pointsQuery)
    ]);

    const mostAccurate = [];
    const highestScorers = [];

    accuracySnapshot.forEach((doc) => {
      mostAccurate.push({
        id: doc.id,
        ...doc.data()
      });
    });

    pointsSnapshot.forEach((doc) => {
      highestScorers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      mostAccurate,
      highestScorers
    };
  } catch (error) {
    console.error('Error fetching top performers:', error);
    throw error;
  }
};

/**
 * Subscribe to leaderboard updates
 * @param {string} leagueId - League ID
 * @param {string} period - Time period
 * @param {Function} callback - Callback function for updates
 */
export const subscribeToLeaderboard = (leagueId = 'general', period = 'overall', callback) => {
  const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARDS);
  const q = query(
    leaderboardRef,
    where('leagueId', '==', leagueId),
    where('period', '==', period),
    orderBy('totalPoints', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const leaderboardData = [];
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboardData.push({
        id: doc.id,
        position: index + 1,
        ...data
      });
    });
    callback(leaderboardData);
  });
};

/**
 * Calculate and update user statistics based on predictions
 * @param {string} userId - User ID
 */
export const calculateUserStats = async (userId) => {
  try {
    const predictionsRef = collection(db, COLLECTIONS.PREDICTIONS);
    const userPredictionsQuery = query(
      predictionsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(userPredictionsQuery);

    let totalPredictions = 0;
    let correctPredictions = 0;
    let exactScores = 0;
    let correctWinners = 0;
    let totalPoints = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    querySnapshot.forEach((doc) => {
      const prediction = doc.data();
      totalPredictions++;

      if (prediction.points > 0) {
        correctPredictions++;
        tempStreak++;

        if (prediction.isExactScore) {
          exactScores++;
        }
        if (prediction.isCorrectWinner) {
          correctWinners++;
        }
      } else {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
      }

      totalPoints += prediction.points || 0;
    });

    // Final streak check
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    currentStreak = tempStreak;

    return {
      totalPredictions,
      correctPredictions,
      exactScores,
      correctWinners,
      totalPoints,
      currentStreak,
      bestStreak
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
};