import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
// Dynamic import to avoid circular dependency

// Collection references
const COLLECTIONS = {
  LEAGUES: 'leagues',
  LEAGUE_MEMBERS: 'leagueMembers',
  LEAGUE_INVITES: 'leagueInvites'
};

/**
 * League Data Schema:
 * {
 *   id: string,
 *   name: string,
 *   description: string,
 *   competition: string, // 'champions-league', 'premier-league', etc.
 *   maxMembers: number,
 *   isPrivate: boolean,
 *   inviteCode: string, // 6-digit code for joining
 *   ownerId: string,
 *   ownerName: string,
 *   scoringRules: {
 *     correctResult: number, // Points for correct 1X2
 *     exactScore: number,    // Points for exact score
 *     correctScorer: number  // Points for correct goal scorer
 *   },
 *   memberCount: number,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   isActive: boolean
 * }
 */

/**
 * League Member Schema:
 * {
 *   leagueId: string,
 *   userId: string,
 *   userName: string,
 *   userEmail: string,
 *   role: 'owner' | 'admin' | 'member',
 *   joinedAt: timestamp,
 *   totalPoints: number,
 *   totalPredictions: number,
 *   accuracy: number,
 *   currentRank: number
 * }
 */

/**
 * Generate a unique 6-digit invite code
 */
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Create a new league
 * @param {Object} leagueData - League creation data
 * @param {string} userId - Owner user ID
 * @param {string} userName - Owner user name
 * @param {string} userEmail - Owner user email
 */
export const createLeague = async (leagueData, userId, userName, userEmail) => {
  try {
    const inviteCode = generateInviteCode();

    // Create league document
    const leagueDoc = {
      name: leagueData.name,
      description: leagueData.description || '',
      competition: leagueData.competition,
      maxMembers: leagueData.maxMembers || 50,
      isPrivate: leagueData.isPrivate || false,
      inviteCode,
      ownerId: userId,
      ownerName: userName,
      scoringRules: {
        correctResult: leagueData.scoringRules?.correctResult || 3,
        exactScore: leagueData.scoringRules?.exactScore || 10,
        correctScorer: leagueData.scoringRules?.correctScorer || 2
      },
      memberCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    // Add league to Firestore
    const leagueRef = await addDoc(collection(db, COLLECTIONS.LEAGUES), leagueDoc);

    // Add owner as first member
    const memberDoc = {
      leagueId: leagueRef.id,
      userId,
      userName,
      userEmail,
      role: 'owner',
      joinedAt: serverTimestamp(),
      totalPoints: 0,
      totalPredictions: 0,
      accuracy: 0,
      currentRank: 1
    };

    await addDoc(collection(db, COLLECTIONS.LEAGUE_MEMBERS), memberDoc);

    // Initialize user in league leaderboard
    try {
      const { leagueLeaderboardService } = await import('./leagueLeaderboardService');
      await leagueLeaderboardService.initializeUserInLeague(
        leagueRef.id,
        userId,
        userName,
        userEmail
      );
    } catch (error) {
      console.error('Error initializing user in league leaderboard:', error);
    }

    return {
      id: leagueRef.id,
      ...leagueDoc,
      inviteCode
    };
  } catch (error) {
    console.error('Error creating league:', error);
    throw error;
  }
};

/**
 * Get user's leagues
 * @param {string} userId - User ID
 */
export const getUserLeagues = async (userId) => {
  try {
    // Get leagues where user is a member
    const membersQuery = query(
      collection(db, COLLECTIONS.LEAGUE_MEMBERS),
      where('userId', '==', userId)
    );

    const membersSnapshot = await getDocs(membersQuery);
    const leagueIds = [];
    const membershipData = {};

    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      leagueIds.push(data.leagueId);
      membershipData[data.leagueId] = data;
    });

    if (leagueIds.length === 0) {
      return [];
    }

    // Get league details
    const leagues = [];
    for (const leagueId of leagueIds) {
      const leagueDoc = await getDoc(doc(db, COLLECTIONS.LEAGUES, leagueId));
      if (leagueDoc.exists()) {
        const leagueData = leagueDoc.data();
        const membership = membershipData[leagueId];

        leagues.push({
          id: leagueDoc.id,
          ...leagueData,
          userRole: membership.role,
          isOwner: membership.role === 'owner',
          userRank: membership.currentRank,
          userPoints: membership.totalPoints
        });
      }
    }

    return leagues.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    throw error;
  }
};

/**
 * Get league by ID
 * @param {string} leagueId - League ID
 */
export const getLeagueById = async (leagueId) => {
  try {
    const leagueDoc = await getDoc(doc(db, COLLECTIONS.LEAGUES, leagueId));

    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    return {
      id: leagueDoc.id,
      ...leagueDoc.data()
    };
  } catch (error) {
    console.error('Error fetching league:', error);
    throw error;
  }
};

/**
 * Join a league by invite code
 * @param {string} inviteCode - 6-digit invite code
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 */
export const joinLeagueByCode = async (inviteCode, userId, userName, userEmail) => {
  try {
    // Find league by invite code
    const leaguesQuery = query(
      collection(db, COLLECTIONS.LEAGUES),
      where('inviteCode', '==', inviteCode.toUpperCase()),
      where('isActive', '==', true)
    );

    const leaguesSnapshot = await getDocs(leaguesQuery);

    if (leaguesSnapshot.empty) {
      throw new Error('Invalid invite code');
    }

    const leagueDoc = leaguesSnapshot.docs[0];
    const leagueData = leagueDoc.data();

    // Check if user is already a member
    const memberQuery = query(
      collection(db, COLLECTIONS.LEAGUE_MEMBERS),
      where('leagueId', '==', leagueDoc.id),
      where('userId', '==', userId)
    );

    const memberSnapshot = await getDocs(memberQuery);

    if (!memberSnapshot.empty) {
      throw new Error('You are already a member of this league');
    }

    // Check if league is full
    if (leagueData.memberCount >= leagueData.maxMembers) {
      throw new Error('League is full');
    }

    // Add user as member
    const memberDoc = {
      leagueId: leagueDoc.id,
      userId,
      userName,
      userEmail,
      role: 'member',
      joinedAt: serverTimestamp(),
      totalPoints: 0,
      totalPredictions: 0,
      accuracy: 0,
      currentRank: leagueData.memberCount + 1
    };

    await addDoc(collection(db, COLLECTIONS.LEAGUE_MEMBERS), memberDoc);

    // Update league member count
    await updateDoc(doc(db, COLLECTIONS.LEAGUES, leagueDoc.id), {
      memberCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Initialize user in league leaderboard
    try {
      const { leagueLeaderboardService } = await import('./leagueLeaderboardService');
      await leagueLeaderboardService.initializeUserInLeague(
        leagueDoc.id,
        userId,
        userName,
        userEmail
      );
    } catch (error) {
      console.error('Error initializing user in league leaderboard:', error);
    }

    return {
      id: leagueDoc.id,
      ...leagueData,
      memberCount: leagueData.memberCount + 1
    };
  } catch (error) {
    console.error('Error joining league:', error);
    throw error;
  }
};

/**
 * Get league members
 * @param {string} leagueId - League ID
 */
export const getLeagueMembers = async (leagueId) => {
  try {
    const membersQuery = query(
      collection(db, COLLECTIONS.LEAGUE_MEMBERS),
      where('leagueId', '==', leagueId),
      orderBy('totalPoints', 'desc')
    );

    const membersSnapshot = await getDocs(membersQuery);
    const members = [];

    membersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        ...data,
        currentRank: index + 1
      });
    });

    return members;
  } catch (error) {
    console.error('Error fetching league members:', error);
    throw error;
  }
};

/**
 * Update league details
 * @param {string} leagueId - League ID
 * @param {Object} updates - Updates to apply
 * @param {string} userId - User ID (must be owner)
 */
export const updateLeague = async (leagueId, updates, userId) => {
  try {
    // Verify user is the owner
    const leagueDoc = await getDoc(doc(db, COLLECTIONS.LEAGUES, leagueId));

    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    const leagueData = leagueDoc.data();

    if (leagueData.ownerId !== userId) {
      throw new Error('Only the league owner can update league settings');
    }

    // Update league
    await updateDoc(doc(db, COLLECTIONS.LEAGUES, leagueId), {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      id: leagueDoc.id,
      ...leagueData,
      ...updates
    };
  } catch (error) {
    console.error('Error updating league:', error);
    throw error;
  }
};

/**
 * Delete a league
 * @param {string} leagueId - League ID
 * @param {string} userId - User ID (must be owner)
 */
export const deleteLeague = async (leagueId, userId) => {
  try {
    // Verify user is the owner
    const leagueDoc = await getDoc(doc(db, COLLECTIONS.LEAGUES, leagueId));

    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    const leagueData = leagueDoc.data();

    if (leagueData.ownerId !== userId) {
      throw new Error('Only the league owner can delete the league');
    }

    // Delete all members
    const membersQuery = query(
      collection(db, COLLECTIONS.LEAGUE_MEMBERS),
      where('leagueId', '==', leagueId)
    );

    const membersSnapshot = await getDocs(membersQuery);
    const deletePromises = [];

    membersSnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    // Delete league
    await deleteDoc(doc(db, COLLECTIONS.LEAGUES, leagueId));

    return true;
  } catch (error) {
    console.error('Error deleting league:', error);
    throw error;
  }
};

/**
 * Leave a league
 * @param {string} leagueId - League ID
 * @param {string} userId - User ID
 */
export const leaveLeague = async (leagueId, userId) => {
  try {
    // Find user's membership
    const memberQuery = query(
      collection(db, COLLECTIONS.LEAGUE_MEMBERS),
      where('leagueId', '==', leagueId),
      where('userId', '==', userId)
    );

    const memberSnapshot = await getDocs(memberQuery);

    if (memberSnapshot.empty) {
      throw new Error('You are not a member of this league');
    }

    const memberDoc = memberSnapshot.docs[0];
    const memberData = memberDoc.data();

    if (memberData.role === 'owner') {
      throw new Error('League owner cannot leave. Transfer ownership or delete the league.');
    }

    // Remove member
    await deleteDoc(memberDoc.ref);

    // Update league member count
    await updateDoc(doc(db, COLLECTIONS.LEAGUES, leagueId), {
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error leaving league:', error);
    throw error;
  }
};

/**
 * Get public leagues (for discovery)
 * @param {number} limit - Number of leagues to return
 */
export const getPublicLeagues = async (limit = 20) => {
  try {
    const leaguesQuery = query(
      collection(db, COLLECTIONS.LEAGUES),
      where('isPrivate', '==', false),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const leaguesSnapshot = await getDocs(leaguesQuery);
    const leagues = [];

    leaguesSnapshot.forEach((doc) => {
      const data = doc.data();

      // Only show leagues that aren't full (or unlimited capacity)
      if (data.memberCount < data.maxMembers || data.maxMembers === 0) {
        leagues.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by member count locally since we can't use multiple orderBy without composite index
    leagues.sort((a, b) => {
      // First by member count (descending)
      if (b.memberCount !== a.memberCount) {
        return b.memberCount - a.memberCount;
      }
      // Then by creation date (newest first)
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return bDate - aDate;
    });

    return leagues.slice(0, limit);
  } catch (error) {
    console.error('Error fetching public leagues:', error);
    throw error;
  }
};