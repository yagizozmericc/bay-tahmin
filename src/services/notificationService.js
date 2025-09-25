import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Notification Service - Manage user notifications
 */
export class NotificationService {
  constructor() {
    this.listeners = new Map(); // Store unsubscribe functions for real-time listeners
  }

  /**
   * Notification types and their configurations
   */
  static TYPES = {
    ACHIEVEMENT_UNLOCKED: {
      id: 'achievement_unlocked',
      title: 'Achievement Unlocked!',
      icon: 'Trophy',
      priority: 'high',
      autoMarkRead: false
    },
    MATCH_RESULT: {
      id: 'match_result',
      title: 'Match Result Available',
      icon: 'Calendar',
      priority: 'medium',
      autoMarkRead: true
    },
    LEAGUE_POSITION: {
      id: 'league_position',
      title: 'League Position Update',
      icon: 'TrendingUp',
      priority: 'medium',
      autoMarkRead: true
    },
    NEW_MATCH: {
      id: 'new_match',
      title: 'New Matches Available',
      icon: 'Target',
      priority: 'low',
      autoMarkRead: true
    },
    LEAGUE_INVITATION: {
      id: 'league_invitation',
      title: 'League Invitation',
      icon: 'Users',
      priority: 'high',
      autoMarkRead: false
    },
    SYSTEM_ANNOUNCEMENT: {
      id: 'system_announcement',
      title: 'System Announcement',
      icon: 'Info',
      priority: 'medium',
      autoMarkRead: false
    },
    PREDICTION_REMINDER: {
      id: 'prediction_reminder',
      title: 'Prediction Reminder',
      icon: 'Clock',
      priority: 'low',
      autoMarkRead: true
    }
  };

  /**
   * Create a new notification
   * @param {string} userId - Target user ID
   * @param {string} type - Notification type key
   * @param {string} message - Notification message
   * @param {Object} data - Additional notification data
   * @returns {Promise<string>} Notification ID
   */
  async createNotification(userId, type, message, data = {}) {
    try {
      if (!userId || !type || !message) {
        throw new Error('userId, type, and message are required');
      }

      const notificationType = NotificationService.TYPES[type];
      if (!notificationType) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      const notification = {
        userId,
        type: notificationType.id,
        title: notificationType.title,
        message,
        icon: notificationType.icon,
        priority: notificationType.priority,
        read: false,
        createdAt: serverTimestamp(),
        data: data || {},
        actionUrl: data.actionUrl || null,
        expiresAt: data.expiresAt || null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification created:', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of notifications to fetch
   * @param {boolean} unreadOnly - Fetch only unread notifications
   * @returns {Promise<Array>} Array of notifications
   */
  async getUserNotifications(userId, limitCount = 50, unreadOnly = false) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (unreadOnly) {
        q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      }));

      // Filter out expired notifications
      const activeNotifications = notifications.filter(notification => {
        if (!notification.expiresAt) return true;
        return notification.expiresAt > new Date();
      });

      console.log(`Loaded ${activeNotifications.length} notifications for user:`, userId);
      return activeNotifications;
    } catch (error) {
      console.error('Error loading user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });

      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async markAllAsRead(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      );

      await Promise.all(updatePromises);
      console.log(`Marked ${snapshot.size} notifications as read for user:`, userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);

      console.log('Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      if (!userId) {
        return 0;
      }

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Listen to real-time notification updates
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  listenToNotifications(userId, callback) {
    if (!userId || !callback) {
      console.error('userId and callback are required for listening to notifications');
      return () => {};
    }

    // Unsubscribe from existing listener for this user
    const existingUnsubscribe = this.listeners.get(userId);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate()
        }));

        // Filter out expired notifications
        const activeNotifications = notifications.filter(notification => {
          if (!notification.expiresAt) return true;
          return notification.expiresAt > new Date();
        });

        callback(activeNotifications);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        callback([]);
      }
    );

    // Store the unsubscribe function
    this.listeners.set(userId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Stop listening to notifications for a user
   * @param {string} userId - User ID
   */
  stopListening(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
      console.log('Stopped listening to notifications for user:', userId);
    }
  }

  /**
   * Helper method to create achievement notification
   * @param {string} userId - User ID
   * @param {Object} achievement - Achievement object
   * @returns {Promise<string>} Notification ID
   */
  async createAchievementNotification(userId, achievement) {
    return await this.createNotification(
      userId,
      'ACHIEVEMENT_UNLOCKED',
      `Congratulations! You've unlocked "${achievement.title}"`,
      {
        achievementId: achievement.id,
        points: achievement.points,
        rarity: achievement.rarity,
        actionUrl: '/user-profile?tab=achievements'
      }
    );
  }

  /**
   * Helper method to create match result notification
   * @param {string} userId - User ID
   * @param {Object} match - Match object
   * @param {number} points - Points earned
   * @returns {Promise<string>} Notification ID
   */
  async createMatchResultNotification(userId, match, points) {
    const message = points > 0
      ? `Great prediction! You earned ${points} points for ${match.homeTeam} vs ${match.awayTeam}`
      : `Results are in for ${match.homeTeam} vs ${match.awayTeam}. Better luck next time!`;

    return await this.createNotification(
      userId,
      'MATCH_RESULT',
      message,
      {
        matchId: match.id,
        points,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        actionUrl: '/match-results',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      }
    );
  }

  /**
   * Helper method to create league invitation notification
   * @param {string} userId - User ID
   * @param {Object} league - League object
   * @param {string} inviterName - Name of person who invited
   * @returns {Promise<string>} Notification ID
   */
  async createLeagueInvitationNotification(userId, league, inviterName) {
    return await this.createNotification(
      userId,
      'LEAGUE_INVITATION',
      `${inviterName} invited you to join "${league.name}" league`,
      {
        leagueId: league.id,
        inviterName,
        leagueName: league.name,
        actionUrl: '/league-management',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      }
    );
  }

  /**
   * Cleanup expired notifications (utility method)
   * @param {string} userId - User ID (optional, if not provided cleans all)
   * @returns {Promise<number>} Number of deleted notifications
   */
  async cleanupExpiredNotifications(userId = null) {
    try {
      let q = query(
        collection(db, 'notifications'),
        where('expiresAt', '<', new Date())
      );

      if (userId) {
        q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          where('expiresAt', '<', new Date())
        );
      }

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);

      console.log(`Cleaned up ${snapshot.size} expired notifications`);
      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  /**
   * Get formatted time ago string
   * @param {Date} date - Date to format
   * @returns {string} Formatted time string
   */
  getTimeAgo(date) {
    if (!date) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export { notificationService };
export default notificationService;