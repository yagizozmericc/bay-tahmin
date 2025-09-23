import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTIONS = {
  LEADERBOARDS: 'leaderboards',
  USERS: 'users'
};

// Sample user data
const sampleUsers = [
  { id: 'user1', displayName: 'Ali Yılmaz', email: 'ali@example.com' },
  { id: 'user2', displayName: 'Ayşe Kaya', email: 'ayse@example.com' },
  { id: 'user3', displayName: 'Mehmet Demir', email: 'mehmet@example.com' },
  { id: 'user4', displayName: 'Fatma Şahin', email: 'fatma@example.com' },
  { id: 'user5', displayName: 'Murat Özkan', email: 'murat@example.com' },
  { id: 'user6', displayName: 'Zeynep Acar', email: 'zeynep@example.com' },
  { id: 'user7', displayName: 'Emre Güler', email: 'emre@example.com' },
  { id: 'user8', displayName: 'Selin Koç', email: 'selin@example.com' },
  { id: 'user9', displayName: 'Burak Arslan', email: 'burak@example.com' },
  { id: 'user10', displayName: 'Deniz Yıldız', email: 'deniz@example.com' }
];

// Generate leaderboard data
const generateLeaderboardData = (userId, leagueId, period) => {
  const basePoints = Math.floor(Math.random() * 500) + 100;
  const totalPredictions = Math.floor(Math.random() * 50) + 10;
  const correctPredictions = Math.floor(totalPredictions * (0.3 + Math.random() * 0.4));
  const accuracy = Math.round((correctPredictions / totalPredictions) * 100);

  return {
    userId,
    leagueId,
    period,
    totalPoints: basePoints,
    weeklyPoints: Math.floor(basePoints * 0.2),
    totalPredictions,
    correctPredictions,
    accuracy,
    exactScores: Math.floor(correctPredictions * 0.1),
    correctWinners: Math.floor(correctPredictions * 0.6),
    correctScorers: Math.floor(correctPredictions * 0.3),
    bestStreak: Math.floor(Math.random() * 8) + 2,
    currentStreak: Math.floor(Math.random() * 5),
    lastUpdated: serverTimestamp()
  };
};

export const createTestData = async () => {
  try {
    console.log('Creating test data...');

    // Create users
    for (const user of sampleUsers) {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // Create leaderboard entries for different leagues and periods
    const leagues = ['general', 'premier-league', 'champions-league', 'la-liga'];
    const periods = ['overall', 'weekly', 'monthly'];

    for (const user of sampleUsers) {
      for (const league of leagues) {
        for (const period of periods) {
          const leaderboardId = `${user.id}_${league}_${period}`;
          const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);

          const leaderboardData = generateLeaderboardData(user.id, league, period);
          await setDoc(leaderboardRef, leaderboardData, { merge: true });
        }
      }
    }

    console.log('Test data created successfully!');
    return { success: true, message: 'Test data created successfully!' };
  } catch (error) {
    console.error('Error creating test data:', error);
    return { success: false, error: error.message };
  }
};

export const clearTestData = async () => {
  try {
    console.log('This function would clear test data...');
    // Implementation for clearing test data would go here
    // We're not implementing this to avoid accidental data loss
    return { success: true, message: 'Clear function ready (not implemented for safety)' };
  } catch (error) {
    console.error('Error clearing test data:', error);
    return { success: false, error: error.message };
  }
};