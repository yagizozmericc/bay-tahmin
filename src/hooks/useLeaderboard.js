import { useState, useEffect, useCallback } from 'react';
import {
  getLeaderboard,
  getUserRank,
  getLeaderboardStats,
  getTopPerformers,
  subscribeToLeaderboard
} from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';

export const useLeaderboard = (leagueId = 'general', period = 'overall', sortBy = 'points') => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [topPerformers, setTopPerformers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const [leaderboard, stats, performers] = await Promise.all([
        getLeaderboard(leagueId, period, sortBy),
        getLeaderboardStats(leagueId),
        getTopPerformers(leagueId)
      ]);

      setLeaderboardData(leaderboard);
      setStatsData(stats);
      setTopPerformers(performers);

      // Get user's rank if authenticated
      if (user?.uid) {
        const rank = await getUserRank(user.uid, leagueId, period);
        setUserRank(rank);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leagueId, period, sortBy, user?.uid]);

  // Refresh leaderboard
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe = null;

    const setupSubscription = () => {
      unsubscribe = subscribeToLeaderboard(leagueId, period, (data) => {
        setLeaderboardData(data);
      });
    };

    // Initial data fetch
    fetchLeaderboard().then(() => {
      // Set up real-time subscription after initial load
      setupSubscription();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [leagueId, period, sortBy, fetchLeaderboard]);

  // Get current user from leaderboard data
  const currentUser = leaderboardData.find(player => player.userId === user?.uid);

  return {
    leaderboardData,
    userRank: currentUser || userRank,
    statsData,
    topPerformers,
    loading,
    error,
    refreshing,
    refresh
  };
};

export default useLeaderboard;