import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { predictionService } from './predictionService';

// Import notification service dynamically to avoid circular dependency
let notificationService = null;
const getNotificationService = async () => {
  if (!notificationService) {
    const module = await import('./notificationService');
    notificationService = module.notificationService;
  }
  return notificationService;
};

/**
 * Achievement Service - Manage user achievements and progress tracking
 */
export class AchievementService {
  constructor() {
    // Define all available achievements
    this.achievementDefinitions = [
      // Prediction-based achievements
      {
        id: 'first_prediction',
        title: 'First Prediction',
        description: 'Made your first match prediction',
        category: 'predictions',
        icon: 'Target',
        rarity: 'common',
        points: 10,
        condition: (stats) => stats.totalPredictions >= 1
      },
      {
        id: 'prediction_rookie',
        title: 'Prediction Rookie',
        description: 'Made 10 predictions',
        category: 'predictions',
        icon: 'Trophy',
        rarity: 'common',
        points: 25,
        condition: (stats) => stats.totalPredictions >= 10
      },
      {
        id: 'prediction_veteran',
        title: 'Prediction Veteran',
        description: 'Made 50 predictions',
        category: 'predictions',
        icon: 'Trophy',
        rarity: 'rare',
        points: 75,
        condition: (stats) => stats.totalPredictions >= 50
      },
      {
        id: 'century_club',
        title: 'Century Club',
        description: 'Made 100 predictions',
        category: 'predictions',
        icon: 'Trophy',
        rarity: 'rare',
        points: 150,
        condition: (stats) => stats.totalPredictions >= 100
      },
      {
        id: 'prediction_master',
        title: 'Prediction Master',
        description: 'Made 500 predictions',
        category: 'predictions',
        icon: 'Crown',
        rarity: 'epic',
        points: 400,
        condition: (stats) => stats.totalPredictions >= 500
      },

      // Accuracy-based achievements
      {
        id: 'first_correct',
        title: 'First Success',
        description: 'Got your first prediction correct',
        category: 'accuracy',
        icon: 'CheckCircle',
        rarity: 'common',
        points: 15,
        condition: (stats) => stats.correctWinners >= 1
      },
      {
        id: 'accurate_predictor',
        title: 'Accurate Predictor',
        description: 'Achieve 60% accuracy over 20 predictions',
        category: 'accuracy',
        icon: 'TrendingUp',
        rarity: 'rare',
        points: 100,
        condition: (stats) => stats.totalPredictions >= 20 && stats.accuracy >= 60
      },
      {
        id: 'sharp_shooter',
        title: 'Sharp Shooter',
        description: 'Achieve 75% accuracy over 30 predictions',
        category: 'accuracy',
        icon: 'Zap',
        rarity: 'epic',
        points: 250,
        condition: (stats) => stats.totalPredictions >= 30 && stats.accuracy >= 75
      },
      {
        id: 'prediction_prodigy',
        title: 'Prediction Prodigy',
        description: 'Achieve 90% accuracy over 50 predictions',
        category: 'accuracy',
        icon: 'Star',
        rarity: 'legendary',
        points: 500,
        condition: (stats) => stats.totalPredictions >= 50 && stats.accuracy >= 90
      },
      {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Got all predictions correct in a single week',
        category: 'accuracy',
        icon: 'Star',
        rarity: 'rare',
        points: 100,
        condition: (stats, weeklyData) => weeklyData && weeklyData.some(week => week.accuracy === 100 && week.total >= 5)
      },

      // Streak-based achievements
      {
        id: 'winning_streak',
        title: 'Winning Streak',
        description: 'Achieved a 3-match correct prediction streak',
        category: 'streaks',
        icon: 'Flame',
        rarity: 'common',
        points: 30,
        condition: (stats) => stats.bestStreak >= 3
      },
      {
        id: 'hot_streak',
        title: 'Hot Streak',
        description: 'Achieved a 10-match correct prediction streak',
        category: 'streaks',
        icon: 'Flame',
        rarity: 'epic',
        points: 250,
        condition: (stats) => stats.bestStreak >= 10
      },
      {
        id: 'legendary_streak',
        title: 'Legendary Streak',
        description: 'Achieved a 20-match correct prediction streak',
        category: 'streaks',
        icon: 'Flame',
        rarity: 'legendary',
        points: 600,
        condition: (stats) => stats.bestStreak >= 20
      },

      // Scoring achievements
      {
        id: 'first_exact_score',
        title: 'Exact Match',
        description: 'Predicted an exact score correctly',
        category: 'accuracy',
        icon: 'Target',
        rarity: 'rare',
        points: 75,
        condition: (stats) => stats.exactScores >= 1
      },
      {
        id: 'score_wizard',
        title: 'Score Wizard',
        description: 'Predicted 10 exact scores correctly',
        category: 'accuracy',
        icon: 'Zap',
        rarity: 'epic',
        points: 300,
        condition: (stats) => stats.exactScores >= 10
      },

      // Social achievements
      {
        id: 'social_starter',
        title: 'Social Starter',
        description: 'Joined your first league',
        category: 'social',
        icon: 'Users',
        rarity: 'common',
        points: 20,
        condition: (stats) => stats.leaguesJoined >= 1
      },
      {
        id: 'league_enthusiast',
        title: 'League Enthusiast',
        description: 'Joined 5 different leagues',
        category: 'social',
        icon: 'Users',
        rarity: 'rare',
        points: 100,
        condition: (stats) => stats.leaguesJoined >= 5
      },
      {
        id: 'league_master',
        title: 'League Master',
        description: 'Won first place in a league',
        category: 'social',
        icon: 'Crown',
        rarity: 'legendary',
        points: 500,
        condition: (stats) => stats.leagueWins >= 1 // This will need to be implemented
      },

      // Time-based achievements
      {
        id: 'dedicated_week',
        title: 'Dedicated Week',
        description: 'Made predictions for 7 consecutive days',
        category: 'predictions',
        icon: 'Calendar',
        rarity: 'common',
        points: 40,
        condition: (stats) => stats.consecutiveDays >= 7
      },
      {
        id: 'loyal_fan',
        title: 'Loyal Fan',
        description: 'Active for 30 days',
        category: 'predictions',
        icon: 'Heart',
        rarity: 'rare',
        points: 120,
        condition: (stats) => stats.daysActive >= 30
      },
      {
        id: 'veteran_predictor',
        title: 'Veteran Predictor',
        description: 'Active for 100 days',
        category: 'predictions',
        icon: 'Shield',
        rarity: 'epic',
        points: 350,
        condition: (stats) => stats.daysActive >= 100
      }
    ];
  }

  /**
   * Calculate and update user achievements
   * @param {string} userId - Firebase user ID
   * @param {Object} userStats - User statistics from statisticsService
   * @returns {Promise<Object>} Achievement data
   */
  async calculateUserAchievements(userId, userStats) {
    try {
      console.log('Calculating achievements for user:', userId);

      // Get current achievements from database
      const currentAchievements = await this.getUserAchievements(userId);

      // Get additional data needed for some achievements
      const weeklyData = await this.getWeeklyAccuracyData(userId);
      const consecutiveDays = await this.calculateConsecutiveDays(userId);

      // Enhanced stats for achievement checking
      const enhancedStats = {
        ...userStats,
        consecutiveDays,
        leagueWins: 0 // TODO: Implement league wins tracking
      };

      // Check each achievement
      const updatedAchievements = [];
      const newlyUnlocked = [];

      for (const achievementDef of this.achievementDefinitions) {
        const isUnlocked = achievementDef.condition(enhancedStats, weeklyData);
        const existingAchievement = currentAchievements.find(a => a.id === achievementDef.id);

        if (isUnlocked && !existingAchievement?.unlocked) {
          // New achievement unlocked
          const newAchievement = {
            ...achievementDef,
            unlocked: true,
            unlockedDate: new Date().toISOString(),
            progress: 100
          };

          updatedAchievements.push(newAchievement);
          newlyUnlocked.push(newAchievement);

          console.log('New achievement unlocked:', achievementDef.title);

          // Create notification for new achievement
          try {
            const notifService = await getNotificationService();
            await notifService.createAchievementNotification(userId, newAchievement);
          } catch (error) {
            console.error('Error creating achievement notification:', error);
          }
        } else if (existingAchievement?.unlocked) {
          // Already unlocked
          updatedAchievements.push(existingAchievement);
        } else {
          // Calculate progress for locked achievements
          const progress = this.calculateAchievementProgress(achievementDef, enhancedStats, weeklyData);
          updatedAchievements.push({
            ...achievementDef,
            unlocked: false,
            progress,
            requirement: this.getRequirementText(achievementDef, enhancedStats)
          });
        }
      }

      // Save updated achievements
      await this.saveUserAchievements(userId, updatedAchievements);

      // Calculate summary stats
      const unlockedCount = updatedAchievements.filter(a => a.unlocked).length;
      const totalPoints = updatedAchievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0);
      const rareCount = updatedAchievements
        .filter(a => a.unlocked && (a.rarity === 'epic' || a.rarity === 'legendary'))
        .length;

      // Get recent achievements (last 5)
      const recentAchievements = updatedAchievements
        .filter(a => a.unlocked && a.unlockedDate)
        .sort((a, b) => new Date(b.unlockedDate) - new Date(a.unlockedDate))
        .slice(0, 5)
        .map(a => ({
          ...a,
          timeAgo: this.getTimeAgo(new Date(a.unlockedDate))
        }));

      const achievementData = {
        achievements: updatedAchievements,
        unlocked: unlockedCount,
        total: this.achievementDefinitions.length,
        points: totalPoints,
        rare: rareCount,
        recent: recentAchievements,
        newlyUnlocked, // For notifications
        lastCalculated: new Date()
      };

      console.log('Achievements calculated successfully:', achievementData);
      return achievementData;

    } catch (error) {
      console.error('Error calculating achievements:', error);
      return this.getDefaultAchievements();
    }
  }

  /**
   * Calculate progress percentage for locked achievement
   * @param {Object} achievementDef - Achievement definition
   * @param {Object} stats - User statistics
   * @param {Array} weeklyData - Weekly accuracy data
   * @returns {number} Progress percentage (0-100)
   */
  calculateAchievementProgress(achievementDef, stats, weeklyData) {
    switch (achievementDef.id) {
      case 'prediction_rookie':
        return Math.min(100, (stats.totalPredictions / 10) * 100);
      case 'prediction_veteran':
        return Math.min(100, (stats.totalPredictions / 50) * 100);
      case 'century_club':
        return Math.min(100, (stats.totalPredictions / 100) * 100);
      case 'prediction_master':
        return Math.min(100, (stats.totalPredictions / 500) * 100);

      case 'accurate_predictor':
        if (stats.totalPredictions >= 20) {
          return Math.min(100, (stats.accuracy / 60) * 100);
        }
        return (stats.totalPredictions / 20) * 50;

      case 'sharp_shooter':
        if (stats.totalPredictions >= 30) {
          return Math.min(100, (stats.accuracy / 75) * 100);
        }
        return (stats.totalPredictions / 30) * 50;

      case 'prediction_prodigy':
        if (stats.totalPredictions >= 50) {
          return Math.min(100, (stats.accuracy / 90) * 100);
        }
        return (stats.totalPredictions / 50) * 50;

      case 'winning_streak':
        return Math.min(100, (stats.bestStreak / 3) * 100);
      case 'hot_streak':
        return Math.min(100, (stats.bestStreak / 10) * 100);
      case 'legendary_streak':
        return Math.min(100, (stats.bestStreak / 20) * 100);

      case 'score_wizard':
        return Math.min(100, (stats.exactScores / 10) * 100);

      case 'league_enthusiast':
        return Math.min(100, (stats.leaguesJoined / 5) * 100);

      case 'dedicated_week':
        return Math.min(100, (stats.consecutiveDays / 7) * 100);
      case 'loyal_fan':
        return Math.min(100, (stats.daysActive / 30) * 100);
      case 'veteran_predictor':
        return Math.min(100, (stats.daysActive / 100) * 100);

      default:
        return 0;
    }
  }

  /**
   * Get requirement text for locked achievements
   * @param {Object} achievementDef - Achievement definition
   * @param {Object} stats - User statistics
   * @returns {string} Requirement text
   */
  getRequirementText(achievementDef, stats) {
    switch (achievementDef.id) {
      case 'prediction_rookie':
        return `Make ${10 - stats.totalPredictions} more predictions`;
      case 'prediction_veteran':
        return `Make ${50 - stats.totalPredictions} more predictions`;
      case 'century_club':
        return `Make ${100 - stats.totalPredictions} more predictions`;
      case 'prediction_master':
        return `Make ${500 - stats.totalPredictions} more predictions`;

      case 'accurate_predictor':
        if (stats.totalPredictions < 20) {
          return `Make ${20 - stats.totalPredictions} more predictions`;
        }
        return `Current accuracy: ${stats.accuracy.toFixed(1)}% (need 60%)`;

      case 'sharp_shooter':
        if (stats.totalPredictions < 30) {
          return `Make ${30 - stats.totalPredictions} more predictions`;
        }
        return `Current accuracy: ${stats.accuracy.toFixed(1)}% (need 75%)`;

      case 'prediction_prodigy':
        if (stats.totalPredictions < 50) {
          return `Make ${50 - stats.totalPredictions} more predictions`;
        }
        return `Current accuracy: ${stats.accuracy.toFixed(1)}% (need 90%)`;

      case 'winning_streak':
        return `Current best streak: ${stats.bestStreak} (need 3)`;
      case 'hot_streak':
        return `Current best streak: ${stats.bestStreak} (need 10)`;
      case 'legendary_streak':
        return `Current best streak: ${stats.bestStreak} (need 20)`;

      case 'score_wizard':
        return `${10 - stats.exactScores} more exact scores needed`;

      case 'league_enthusiast':
        return `Join ${5 - stats.leaguesJoined} more leagues`;

      case 'dedicated_week':
        return `${7 - stats.consecutiveDays} more consecutive days needed`;
      case 'loyal_fan':
        return `${30 - stats.daysActive} more days of activity needed`;
      case 'veteran_predictor':
        return `${100 - stats.daysActive} more days of activity needed`;

      default:
        return 'Complete the required action';
    }
  }

  /**
   * Get weekly accuracy data for achievement calculations
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Array>} Weekly accuracy data
   */
  async getWeeklyAccuracyData(userId) {
    try {
      // This would be implemented by analyzing user predictions by week
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting weekly accuracy data:', error);
      return [];
    }
  }

  /**
   * Calculate consecutive days of predictions
   * @param {string} userId - Firebase user ID
   * @returns {Promise<number>} Consecutive days count
   */
  async calculateConsecutiveDays(userId) {
    try {
      const predictions = await predictionService.getUserPredictions(userId);
      if (predictions.length === 0) return 0;

      // Group predictions by date
      const predictionDates = [...new Set(predictions.map(p =>
        new Date(p.createdAt).toDateString()
      ))].sort((a, b) => new Date(b) - new Date(a));

      let consecutiveDays = 0;
      const today = new Date();

      for (let i = 0; i < predictionDates.length; i++) {
        const predDate = new Date(predictionDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (predDate.toDateString() === expectedDate.toDateString()) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      return consecutiveDays;
    } catch (error) {
      console.error('Error calculating consecutive days:', error);
      return 0;
    }
  }

  /**
   * Get user achievements from database
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Array>} User achievements
   */
  async getUserAchievements(userId) {
    try {
      const achievementRef = doc(db, 'userAchievements', userId);
      const snapshot = await getDoc(achievementRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return data.achievements || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Save user achievements to database
   * @param {string} userId - Firebase user ID
   * @param {Array} achievements - User achievements array
   * @returns {Promise<void>}
   */
  async saveUserAchievements(userId, achievements) {
    try {
      const achievementRef = doc(db, 'userAchievements', userId);
      await setDoc(achievementRef, {
        achievements,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      console.log('User achievements saved successfully');
    } catch (error) {
      console.error('Error saving user achievements:', error);
    }
  }

  /**
   * Get cached achievements if recent
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object|null>} Cached achievement data or null
   */
  async getCachedAchievements(userId) {
    try {
      const achievementRef = doc(db, 'userAchievements', userId);
      const snapshot = await getDoc(achievementRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const lastUpdated = data.lastUpdated?.toDate();

        // Return cached data if less than 30 minutes old
        if (lastUpdated && (new Date() - lastUpdated) < 1800000) {
          return this.formatAchievementData(data.achievements || []);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached achievements:', error);
      return null;
    }
  }

  /**
   * Format achievement data for UI consumption
   * @param {Array} achievements - Raw achievements array
   * @returns {Object} Formatted achievement data
   */
  formatAchievementData(achievements) {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    const rareCount = achievements
      .filter(a => a.unlocked && (a.rarity === 'epic' || a.rarity === 'legendary'))
      .length;

    const recentAchievements = achievements
      .filter(a => a.unlocked && a.unlockedDate)
      .sort((a, b) => new Date(b.unlockedDate) - new Date(a.unlockedDate))
      .slice(0, 5)
      .map(a => ({
        ...a,
        timeAgo: this.getTimeAgo(new Date(a.unlockedDate))
      }));

    return {
      achievements,
      unlocked: unlockedCount,
      total: this.achievementDefinitions.length,
      points: totalPoints,
      rare: rareCount,
      recent: recentAchievements,
      lastCalculated: new Date()
    };
  }

  /**
   * Get achievements (cached or calculated)
   * @param {string} userId - Firebase user ID
   * @param {Object} userStats - User statistics
   * @param {boolean} forceRefresh - Force recalculation
   * @returns {Promise<Object>} Achievement data
   */
  async getUserAchievementData(userId, userStats = null, forceRefresh = false) {
    try {
      if (!forceRefresh) {
        const cached = await this.getCachedAchievements(userId);
        if (cached) return cached;
      }

      // Need user stats to calculate achievements
      if (!userStats) {
        console.warn('User stats required for achievement calculation');
        return this.getDefaultAchievements();
      }

      return await this.calculateUserAchievements(userId, userStats);
    } catch (error) {
      console.error('Error getting user achievement data:', error);
      return this.getDefaultAchievements();
    }
  }

  /**
   * Get default achievements object
   * @returns {Object} Default achievements
   */
  getDefaultAchievements() {
    return {
      achievements: this.achievementDefinitions.map(def => ({
        ...def,
        unlocked: false,
        progress: 0,
        requirement: 'Start making predictions to unlock'
      })),
      unlocked: 0,
      total: this.achievementDefinitions.length,
      points: 0,
      rare: 0,
      recent: [],
      lastCalculated: new Date()
    };
  }

  /**
   * Get human-readable time ago string
   * @param {Date} date - Date to compare
   * @returns {string} Time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  }
}

// Create singleton instance
const achievementService = new AchievementService();

export { achievementService };
export default achievementService;