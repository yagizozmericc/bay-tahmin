import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getLeagueMembers } from './leagueService';
import { getUserPredictions } from './predictionService';

const LEAGUE_LEADERBOARD_COLLECTION = 'leagueLeaderboards';

/**
 * League Leaderboard Entry Schema:
 * {
 *   id: string, // leagueId_userId
 *   leagueId: string,
 *   userId: string,
 *   userName: string,
 *   userEmail: string,
 *   totalPoints: number,
 *   totalPredictions: number,
 *   correctPredictions: number,
 *   exactScores: number,
 *   correctOutcomes: number,
 *   correctScorers: number,
 *   accuracy: number, // percentage
 *   averagePointsPerMatch: number,
 *   lastMatchPoints: number,
 *   currentStreak: number,
 *   bestStreak: number,
 *   rank: number,
 *   lastUpdated: timestamp,
 *   createdAt: timestamp
 * }
 */

export const leagueLeaderboardService = {
  /**
   * Get league leaderboard
   */
  async getLeagueLeaderboard(leagueId) {
    try {
      if (!leagueId) {
        throw new Error('League ID is required');
      }

      const q = query(
        collection(db, LEAGUE_LEADERBOARD_COLLECTION),
        where('leagueId', '==', leagueId),
        orderBy('totalPoints', 'desc'),
        orderBy('accuracy', 'desc'),
        orderBy('totalPredictions', 'desc')
      );

      const snapshot = await getDocs(q);
      const leaderboard = [];

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          id: doc.id,
          ...data,
          rank: index + 1,
          lastUpdated: data.lastUpdated?.toDate(),
          createdAt: data.createdAt?.toDate()
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('Error fetching league leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get user's position in league leaderboard
   */
  async getUserLeaguePosition(leagueId, userId) {
    try {
      const leaderboard = await this.getLeagueLeaderboard(leagueId);
      const userEntry = leaderboard.find(entry => entry.userId === userId);

      if (!userEntry) {
        return null;
      }

      return {
        ...userEntry,
        totalMembers: leaderboard.length,
        percentile: Math.round(((leaderboard.length - userEntry.rank + 1) / leaderboard.length) * 100)
      };
    } catch (error) {
      console.error('Error getting user league position:', error);
      throw error;
    }
  },

  /**
   * Update user's league leaderboard entry
   */
  async updateUserLeagueStats(leagueId, userId, predictionStats) {
    try {
      if (!leagueId || !userId) {
        throw new Error('League ID and User ID are required');
      }

      const entryId = `${leagueId}_${userId}`;
      const entryRef = doc(db, LEAGUE_LEADERBOARD_COLLECTION, entryId);

      const updateData = {
        leagueId,
        userId,
        totalPoints: predictionStats.totalPoints || 0,
        totalPredictions: predictionStats.totalPredictions || 0,
        correctPredictions: predictionStats.correctPredictions || 0,
        exactScores: predictionStats.exactScores || 0,
        correctOutcomes: predictionStats.correctOutcomes || 0,
        correctScorers: predictionStats.correctScorers || 0,
        accuracy: predictionStats.totalPredictions > 0
          ? Math.round((predictionStats.correctPredictions / predictionStats.totalPredictions) * 100)
          : 0,
        averagePointsPerMatch: predictionStats.totalPredictions > 0
          ? Math.round((predictionStats.totalPoints / predictionStats.totalPredictions) * 100) / 100
          : 0,
        lastMatchPoints: predictionStats.lastMatchPoints || 0,
        currentStreak: predictionStats.currentStreak || 0,
        bestStreak: predictionStats.bestStreak || 0,
        lastUpdated: serverTimestamp()
      };

      await setDoc(entryRef, updateData, { merge: true });

      return updateData;
    } catch (error) {
      console.error('Error updating user league stats:', error);
      throw error;
    }
  },

  /**
   * Calculate user's prediction statistics
   */
  async calculateUserPredictionStats(userId, leagueId) {
    try {
      // Get user's predictions
      const predictions = await getUserPredictions(userId);

      let stats = {
        totalPoints: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        exactScores: 0,
        correctOutcomes: 0,
        correctScorers: 0,
        lastMatchPoints: 0,
        currentStreak: 0,
        bestStreak: 0
      };

      let currentStreak = 0;
      let bestStreak = 0;

      // Filter predictions for specific league competitions
      // This would need to be enhanced to map leagues to competitions
      const relevantPredictions = predictions.filter(pred => {
        return pred.status === 'scored' && pred.points !== undefined;
      });

      // Sort by match date to calculate streaks properly
      relevantPredictions.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return aDate - bDate;
      });

      for (const prediction of relevantPredictions) {
        stats.totalPredictions++;
        stats.totalPoints += prediction.points || 0;

        if (prediction.evaluation) {
          if (prediction.evaluation.correctOutcome) {
            stats.correctPredictions++;
            stats.correctOutcomes++;
            currentStreak++;
          } else {
            currentStreak = 0;
          }

          if (prediction.evaluation.exactScore) {
            stats.exactScores++;
          }

          if (prediction.evaluation.scorerHits && prediction.evaluation.scorerHits.length > 0) {
            stats.correctScorers += prediction.evaluation.scorerHits.length;
          }
        }

        bestStreak = Math.max(bestStreak, currentStreak);
      }

      stats.currentStreak = currentStreak;
      stats.bestStreak = bestStreak;

      // Get last match points
      if (relevantPredictions.length > 0) {
        stats.lastMatchPoints = relevantPredictions[relevantPredictions.length - 1].points || 0;
      }

      return stats;
    } catch (error) {
      console.error('Error calculating user prediction stats:', error);
      throw error;
    }
  },

  /**
   * Recalculate entire league leaderboard
   */
  async recalculateLeagueLeaderboard(leagueId) {
    try {
      console.log('Recalculating leaderboard for league:', leagueId);

      // Get all league members
      const members = await getLeagueMembers(leagueId);
      console.log('Found league members:', members.length);

      const updates = [];

      for (const member of members) {
        try {
          // Calculate stats for each member
          const stats = await this.calculateUserPredictionStats(member.userId, leagueId);

          // Update leaderboard entry
          await this.updateUserLeagueStats(leagueId, member.userId, stats);

          updates.push({
            userId: member.userId,
            userName: member.userName,
            ...stats
          });

          console.log(`Updated stats for ${member.userName}: ${stats.totalPoints} points`);
        } catch (error) {
          console.error(`Error updating stats for user ${member.userId}:`, error);
        }
      }

      console.log(`Recalculation complete. Updated ${updates.length} entries.`);
      return updates;
    } catch (error) {
      console.error('Error recalculating league leaderboard:', error);
      throw error;
    }
  },

  /**
   * Initialize user in league leaderboard
   */
  async initializeUserInLeague(leagueId, userId, userName, userEmail) {
    try {
      const entryId = `${leagueId}_${userId}`;
      const entryRef = doc(db, LEAGUE_LEADERBOARD_COLLECTION, entryId);

      const initialData = {
        leagueId,
        userId,
        userName,
        userEmail,
        totalPoints: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        exactScores: 0,
        correctOutcomes: 0,
        correctScorers: 0,
        accuracy: 0,
        averagePointsPerMatch: 0,
        lastMatchPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        rank: 1,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await setDoc(entryRef, initialData, { merge: true });

      return initialData;
    } catch (error) {
      console.error('Error initializing user in league:', error);
      throw error;
    }
  },

  /**
   * Get league leaderboard with enhanced stats
   */
  async getEnhancedLeagueLeaderboard(leagueId) {
    try {
      const leaderboard = await this.getLeagueLeaderboard(leagueId);

      // Add additional computed stats
      const enhancedLeaderboard = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        pointsFromFirst: index === 0 ? 0 : leaderboard[0].totalPoints - entry.totalPoints,
        trend: entry.lastMatchPoints > 0 ? 'up' : entry.lastMatchPoints < 0 ? 'down' : 'same',
        isTopPerformer: index < 3,
        recentForm: this.calculateRecentForm(entry)
      }));

      return enhancedLeaderboard;
    } catch (error) {
      console.error('Error getting enhanced league leaderboard:', error);
      throw error;
    }
  },

  /**
   * Calculate recent form indicator
   */
  calculateRecentForm(entry) {
    // This is a simplified calculation
    // In a real scenario, you'd look at last 5-10 matches
    if (entry.currentStreak >= 3) return 'excellent';
    if (entry.currentStreak >= 2) return 'good';
    if (entry.currentStreak >= 1) return 'average';
    return 'poor';
  }
};

export default leagueLeaderboardService;