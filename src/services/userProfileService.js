import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection reference
const COLLECTIONS = {
  USER_PROFILES: 'userProfiles'
};

/**
 * User Profile Schema:
 * {
 *   userId: string,
 *   username: string,
 *   email: string,
 *   firstName: string,
 *   lastName: string,
 *   bio: string,
 *   location: string,
 *   favoriteTeam: string,
 *   preferredCompetitions: string[],
 *   notifications: {
 *     matchReminders: boolean,
 *     leagueUpdates: boolean,
 *     achievements: boolean,
 *     weeklySummary: boolean
 *   },
 *   privacy: {
 *     publicProfile: boolean,
 *     showInLeaderboards: boolean,
 *     allowFriendRequests: boolean
 *   },
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

/**
 * Get user profile by user ID
 * @param {string} userId - User ID
 */
export const getUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      return {
        id: profileDoc.id,
        ...profileDoc.data()
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 */
export const createOrUpdateUserProfile = async (userId, profileData) => {
  try {
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const existingProfile = await getDoc(profileRef);

    const baseData = {
      userId,
      updatedAt: serverTimestamp()
    };

    if (existingProfile.exists()) {
      // Update existing profile
      await updateDoc(profileRef, {
        ...profileData,
        ...baseData
      });
    } else {
      // Create new profile with defaults
      const defaultProfile = {
        username: profileData.username || '',
        email: profileData.email || '',
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        favoriteTeam: profileData.favoriteTeam || '',
        preferredCompetitions: profileData.preferredCompetitions || [],
        notifications: {
          matchReminders: true,
          leagueUpdates: true,
          achievements: true,
          weeklySummary: false,
          ...profileData.notifications
        },
        privacy: {
          publicProfile: true,
          showInLeaderboards: true,
          allowFriendRequests: true,
          ...profileData.privacy
        },
        createdAt: serverTimestamp(),
        ...baseData
      };

      await setDoc(profileRef, defaultProfile);
    }

    // Return the updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);

    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @param {string} currentUserId - Current user ID (to exclude from check)
 */
export const isUsernameAvailable = async (username, currentUserId = null) => {
  try {
    const profilesRef = collection(db, COLLECTIONS.USER_PROFILES);
    const querySnapshot = await getDocs(
      query(profilesRef, where('username', '==', username))
    );

    if (querySnapshot.empty) {
      return true;
    }

    // If username exists, check if it belongs to current user
    if (currentUserId) {
      const existingProfile = querySnapshot.docs[0];
      return existingProfile.id === currentUserId;
    }

    return false;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

/**
 * Get public user profile (for viewing other users)
 * @param {string} userId - User ID
 */
export const getPublicUserProfile = async (userId) => {
  try {
    const profile = await getUserProfile(userId);

    if (!profile || !profile.privacy?.publicProfile) {
      return null;
    }

    // Return only public fields
    return {
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      location: profile.location,
      favoriteTeam: profile.favoriteTeam,
      preferredCompetitions: profile.preferredCompetitions,
      createdAt: profile.createdAt
    };
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    throw error;
  }
};

/**
 * Delete user profile
 * @param {string} userId - User ID
 */
export const deleteUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    await deleteDoc(profileRef);
    return true;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};