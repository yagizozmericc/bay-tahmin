import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { predictionService } from './predictionService';

/**
 * User Statistics Service - Calculate and manage user statistics
 */
export class UserStatisticsService {
  /**
   * Calculate comprehensive statistics for a user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} User statistics object
   */
  async calculateUserStatistics(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Calculating statistics for user:', userId);

      // Get all user predictions
      const predictions = await predictionService.getUserPredictions(userId);

      // Get user's league memberships
      const leagueStats = await this.getUserLeagueStats(userId);

      // Calculate basic statistics
      const basicStats = this.calculateBasicStats(predictions);

      // Calculate monthly performance data
      const monthlyData = this.calculateMonthlyData(predictions);

      // Calculate competition distribution
      const competitionData = await this.calculateCompetitionDistribution(predictions);

      // Calculate accuracy trend
      const accuracyTrend = this.calculateAccuracyTrend(predictions);

      // Calculate streaks
      const streakData = this.calculateStreaks(predictions);

      // Get additional user data
      const additionalStats = await this.calculateAdditionalStats(userId, predictions);

      const statistics = {
        // Basic overview stats
        totalPredictions: basicStats.totalPredictions,
        accuracy: basicStats.accuracy,
        bestStreak: streakData.bestStreak,
        currentStreak: streakData.currentStreak,
        totalPoints: basicStats.totalPoints,

        // Detailed stats
        exactScores: basicStats.exactScores,
        correctWinners: basicStats.correctWinners,
        correctScorers: basicStats.correctScorers,
        avgPointsPerMatch: basicStats.avgPointsPerMatch,

        // League and social stats
        leaguesJoined: leagueStats.totalLeagues,
        globalRank: additionalStats.globalRank,
        daysActive: additionalStats.daysActive,
        achievementsUnlocked: additionalStats.achievementsUnlocked,

        // Chart data
        monthlyData,
        competitionData,
        accuracyTrend,

        // Meta information
        lastCalculated: new Date(),
        dataVersion: '1.0'
      };

      // Cache the statistics
      await this.cacheStatistics(userId, statistics);

      console.log('Statistics calculated successfully:', statistics);
      return statistics;

    } catch (error) {
      console.error('Error calculating user statistics:', error);
      // Return default statistics to prevent UI crashes
      return this.getDefaultStatistics();
    }
  }

  /**
   * Calculate basic statistics from predictions
   * @param {Array} predictions - User predictions array
   * @returns {Object} Basic statistics
   */
  calculateBasicStats(predictions) {
    if (!Array.isArray(predictions) || predictions.length === 0) {
      return {
        totalPredictions: 0,
        accuracy: 0,
        totalPoints: 0,
        exactScores: 0,
        correctWinners: 0,
        correctScorers: 0,
        avgPointsPerMatch: 0
      };
    }

    const completedPredictions = predictions.filter(p => p.status === 'completed');
    const totalPredictions = completedPredictions.length;

    if (totalPredictions === 0) {
      return {
        totalPredictions: predictions.length,
        accuracy: 0,
        totalPoints: 0,
        exactScores: 0,
        correctWinners: 0,
        correctScorers: 0,
        avgPointsPerMatch: 0
      };
    }

    const totalPoints = completedPredictions.reduce((sum, p) => sum + (p.points || 0), 0);
    const exactScores = completedPredictions.filter(p => p.points >= 10).length; // Assuming 10+ points = exact score
    const correctWinners = completedPredictions.filter(p => p.points >= 3).length; // Assuming 3+ points = correct winner
    const correctScorers = completedPredictions.filter(p =>
      Array.isArray(p.scorers) && p.scorers.length > 0 && p.points > 0
    ).length;

    const accuracy = totalPredictions > 0 ? ((correctWinners / totalPredictions) * 100) : 0;
    const avgPointsPerMatch = totalPredictions > 0 ? (totalPoints / totalPredictions) : 0;

    return {
      totalPredictions,
      accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal
      totalPoints,
      exactScores,
      correctWinners,
      correctScorers,
      avgPointsPerMatch: Math.round(avgPointsPerMatch * 10) / 10
    };
  }

  /**
   * Calculate monthly performance data
   * @param {Array} predictions - User predictions array
   * @returns {Array} Monthly data for charts
   */
  calculateMonthlyData(predictions) {
    const monthlyStats = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyStats[monthKey] = { predictions: 0, correct: 0 };
    }

    // Process predictions
    predictions.forEach(prediction => {
      if (!prediction.createdAt) return;

      const predDate = new Date(prediction.createdAt);
      const monthKey = predDate.toLocaleDateString('en-US', { month: 'short' });

      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].predictions++;
        if (prediction.points >= 3) { // Assuming 3+ points = correct
          monthlyStats[monthKey].correct++;
        }
      }
    });

    return Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      predictions: data.predictions,
      correct: data.correct
    }));
  }

  /**
   * Calculate competition distribution
   * @param {Array} predictions - User predictions array
   * @returns {Array} Competition distribution data
   */
  async calculateCompetitionDistribution(predictions) {
    const competitionCount = {};

    // Count predictions by competition (this would need match data to be fully accurate)
    // For now, we'll simulate based on matchId patterns or use default distribution
    predictions.forEach(prediction => {
      // This is a simplified approach - in a real app you'd join with match data
      let competition = 'Other';

      // Try to infer competition from matchId if it follows a pattern
      if (prediction.matchId?.includes('CL')) competition = 'Champions League';
      else if (prediction.matchId?.includes('TSL')) competition = 'Turkish Super League';
      else if (prediction.matchId?.includes('PL')) competition = 'Premier League';

      competitionCount[competition] = (competitionCount[competition] || 0) + 1;
    });

    // Convert to chart format
    const colors = ['#1B5E20', '#2E7D32', '#388E3C', '#66BB6A'];
    let colorIndex = 0;

    return Object.entries(competitionCount).map(([name, value]) => ({
      name,
      value,
      color: colors[colorIndex++ % colors.length]
    }));
  }

  /**
   * Calculate accuracy trend over last 6 weeks
   * @param {Array} predictions - User predictions array
   * @returns {Array} Accuracy trend data
   */
  calculateAccuracyTrend(predictions) {
    const weeklyStats = {};
    const now = new Date();

    // Initialize last 6 weeks
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `W${6 - i}`;
      weeklyStats[weekKey] = { total: 0, correct: 0 };
    }

    // Process predictions
    predictions.forEach(prediction => {
      if (!prediction.createdAt || prediction.status !== 'completed') return;

      const predDate = new Date(prediction.createdAt);
      const weeksDiff = Math.floor((now - predDate) / (7 * 24 * 60 * 60 * 1000));

      if (weeksDiff >= 0 && weeksDiff < 6) {
        const weekKey = `W${6 - weeksDiff}`;
        if (weeklyStats[weekKey]) {
          weeklyStats[weekKey].total++;
          if (prediction.points >= 3) {
            weeklyStats[weekKey].correct++;
          }
        }
      }
    });

    return Object.entries(weeklyStats).map(([week, data]) => ({
      week,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
  }

  /**
   * Calculate streak information
   * @param {Array} predictions - User predictions array
   * @returns {Object} Streak data
   */
  calculateStreaks(predictions) {
    const completedPredictions = predictions
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from most recent)
    for (const prediction of completedPredictions) {
      if (prediction.points >= 3) {
        if (currentStreak === 0 || tempStreak > 0) {
          currentStreak++;
          tempStreak = currentStreak;
        }
      } else {
        if (tempStreak === 0) break; // Current streak is broken
        tempStreak = 0;
      }
    }

    // Calculate best streak
    tempStreak = 0;
    for (const prediction of completedPredictions) {
      if (prediction.points >= 3) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, bestStreak };
  }

  /**
   * Get user's league statistics
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} League statistics
   */
  async getUserLeagueStats(userId) {
    try {
      const q = query(
        collection(db, 'leagueMembers'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return {
        totalLeagues: snapshot.size
      };
    } catch (error) {
      console.error('Error getting league stats:', error);
      return { totalLeagues: 0 };
    }
  }

  /**
   * Calculate additional statistics
   * @param {string} userId - Firebase user ID
   * @param {Array} predictions - User predictions array
   * @returns {Promise<Object>} Additional statistics
   */
  async calculateAdditionalStats(userId, predictions) {
    try {
      // Calculate days active (days since first prediction)
      let daysActive = 0;
      if (predictions.length > 0) {
        const firstPrediction = predictions[predictions.length - 1];
        if (firstPrediction.createdAt) {
          const diffTime = Math.abs(new Date() - new Date(firstPrediction.createdAt));
          daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      // TODO: Calculate global rank by comparing with other users
      // For now, return a placeholder
      const globalRank = Math.floor(Math.random() * 10000) + 1;

      // TODO: Calculate achievements
      // For now, return a placeholder
      const achievementsUnlocked = Math.min(Math.floor(predictions.length / 10), 24);

      return {
        daysActive,
        globalRank,
        achievementsUnlocked
      };
    } catch (error) {
      console.error('Error calculating additional stats:', error);
      return {
        daysActive: 0,
        globalRank: 0,
        achievementsUnlocked: 0
      };
    }
  }

  /**
   * Cache user statistics in Firestore
   * @param {string} userId - Firebase user ID
   * @param {Object} statistics - Statistics object
   * @returns {Promise<void>}
   */
  async cacheStatistics(userId, statistics) {
    try {
      const statsRef = doc(db, 'userStatistics', userId);
      await setDoc(statsRef, {
        ...statistics,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      console.log('Statistics cached successfully for user:', userId);
    } catch (error) {
      console.error('Error caching statistics:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get cached statistics if recent enough
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object|null>} Cached statistics or null
   */
  async getCachedStatistics(userId) {
    try {
      const statsRef = doc(db, 'userStatistics', userId);
      const snapshot = await getDoc(statsRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const lastUpdated = data.lastUpdated?.toDate();

        // Return cached data if it's less than 1 hour old
        if (lastUpdated && (new Date() - lastUpdated) < 3600000) {
          console.log('Using cached statistics for user:', userId);
          return {
            ...data,
            lastCalculated: lastUpdated
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached statistics:', error);
      return null;
    }
  }

  /**
   * Get user statistics (cached or calculated)
   * @param {string} userId - Firebase user ID
   * @param {boolean} forceRefresh - Force recalculation
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics(userId, forceRefresh = false) {
    try {
      if (!forceRefresh) {
        const cached = await this.getCachedStatistics(userId);
        if (cached) return cached;
      }

      return await this.calculateUserStatistics(userId);
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return this.getDefaultStatistics();
    }
  }

  /**
   * Get default statistics object
   * @returns {Object} Default statistics
   */
  getDefaultStatistics() {
    return {
      totalPredictions: 0,
      accuracy: 0,
      bestStreak: 0,
      currentStreak: 0,
      totalPoints: 0,
      exactScores: 0,
      correctWinners: 0,
      correctScorers: 0,
      avgPointsPerMatch: 0,
      leaguesJoined: 0,
      globalRank: 0,
      daysActive: 0,
      achievementsUnlocked: 0,
      monthlyData: [
        { month: 'Sep', predictions: 0, correct: 0 },
        { month: 'Oct', predictions: 0, correct: 0 },
        { month: 'Nov', predictions: 0, correct: 0 },
        { month: 'Dec', predictions: 0, correct: 0 },
        { month: 'Jan', predictions: 0, correct: 0 },
        { month: 'Feb', predictions: 0, correct: 0 }
      ],
      competitionData: [
        { name: 'No Data', value: 1, color: '#66BB6A' }
      ],
      accuracyTrend: [
        { week: 'W1', accuracy: 0 },
        { week: 'W2', accuracy: 0 },
        { week: 'W3', accuracy: 0 },
        { week: 'W4', accuracy: 0 },
        { week: 'W5', accuracy: 0 },
        { week: 'W6', accuracy: 0 }
      ],
      lastCalculated: new Date(),
      dataVersion: '1.0'
    };
  }
}

// Create singleton instance
const userStatisticsService = new UserStatisticsService();

export { userStatisticsService };
export default userStatisticsService;