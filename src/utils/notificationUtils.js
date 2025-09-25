import { notificationService } from '../services/notificationService';

/**
 * Utility functions for creating common notifications
 */

/**
 * Create sample notifications for testing
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const createSampleNotifications = async (userId) => {
  try {
    // Achievement notification
    await notificationService.createNotification(
      userId,
      'ACHIEVEMENT_UNLOCKED',
      'Congratulations! You\'ve unlocked "First Prediction"',
      {
        achievementId: 'first_prediction',
        points: 10,
        rarity: 'common',
        actionUrl: '/user-profile?tab=achievements'
      }
    );

    // Match result notification
    await notificationService.createNotification(
      userId,
      'MATCH_RESULT',
      'Great prediction! You earned 7 points for Manchester United vs Arsenal',
      {
        matchId: 'match_123',
        points: 7,
        homeTeam: 'Manchester United',
        awayTeam: 'Arsenal',
        actionUrl: '/match-results'
      }
    );

    // League position notification
    await notificationService.createNotification(
      userId,
      'LEAGUE_POSITION',
      'You\'re now ranked #3 in "Friends League"! Keep it up!',
      {
        leagueId: 'league_456',
        position: 3,
        leagueName: 'Friends League',
        actionUrl: '/league-leaderboards'
      }
    );

    // System announcement
    await notificationService.createNotification(
      userId,
      'SYSTEM_ANNOUNCEMENT',
      'New features added! Check out the improved statistics dashboard.',
      {
        version: '2.0.1',
        actionUrl: '/user-profile?tab=statistics'
      }
    );

    // Prediction reminder
    await notificationService.createNotification(
      userId,
      'PREDICTION_REMINDER',
      'Don\'t forget to make your predictions for this weekend\'s matches!',
      {
        matchCount: 5,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/match-predictions'
      }
    );

    console.log('Sample notifications created successfully');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  }
};

/**
 * Create a welcome notification for new users
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @returns {Promise<void>}
 */
export const createWelcomeNotification = async (userId, userName) => {
  try {
    await notificationService.createNotification(
      userId,
      'SYSTEM_ANNOUNCEMENT',
      `Welcome to Bay Tahmin, ${userName}! Start making predictions to unlock achievements and compete with friends.`,
      {
        type: 'welcome',
        actionUrl: '/match-predictions'
      }
    );

    console.log('Welcome notification created for user:', userName);
  } catch (error) {
    console.error('Error creating welcome notification:', error);
  }
};

/**
 * Create notification when user joins a league
 * @param {string} userId - User ID
 * @param {Object} league - League object
 * @returns {Promise<void>}
 */
export const createLeagueJoinedNotification = async (userId, league) => {
  try {
    await notificationService.createNotification(
      userId,
      'LEAGUE_POSITION',
      `You've successfully joined "${league.name}"! Start making predictions to climb the leaderboard.`,
      {
        leagueId: league.id,
        leagueName: league.name,
        actionUrl: `/league-leaderboards?id=${league.id}`
      }
    );

    console.log('League joined notification created');
  } catch (error) {
    console.error('Error creating league joined notification:', error);
  }
};

/**
 * Create notification when new matches are available
 * @param {string} userId - User ID
 * @param {number} matchCount - Number of new matches
 * @returns {Promise<void>}
 */
export const createNewMatchesNotification = async (userId, matchCount) => {
  try {
    await notificationService.createNotification(
      userId,
      'NEW_MATCH',
      `${matchCount} new matches are available for prediction!`,
      {
        matchCount,
        actionUrl: '/match-predictions'
      }
    );

    console.log('New matches notification created');
  } catch (error) {
    console.error('Error creating new matches notification:', error);
  }
};

/**
 * Create notification for match prediction reminders
 * @param {string} userId - User ID
 * @param {Array} matches - Array of upcoming matches
 * @returns {Promise<void>}
 */
export const createPredictionReminderNotification = async (userId, matches) => {
  try {
    const matchCount = matches.length;
    const deadline = matches[0]?.matchDate; // Assuming first match is the earliest

    await notificationService.createNotification(
      userId,
      'PREDICTION_REMINDER',
      `Reminder: ${matchCount} match${matchCount > 1 ? 'es' : ''} starting soon! Make your predictions now.`,
      {
        matchCount,
        deadline,
        matches: matches.map(m => ({ id: m.id, teams: `${m.homeTeam} vs ${m.awayTeam}` })),
        actionUrl: '/match-predictions',
        expiresAt: new Date(deadline) // Expires when matches start
      }
    );

    console.log('Prediction reminder notification created');
  } catch (error) {
    console.error('Error creating prediction reminder notification:', error);
  }
};