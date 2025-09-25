import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { leagueLeaderboardService } from '../../services/leagueLeaderboardService';
import { getLeagueById } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';

const LeagueLeaderboardPage = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [league, setLeague] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load league and leaderboard data
  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load league details and leaderboard in parallel
      const [leagueData, leaderboardData] = await Promise.all([
        getLeagueById(leagueId),
        leagueLeaderboardService.getEnhancedLeagueLeaderboard(leagueId)
      ]);

      setLeague(leagueData);
      setLeaderboard(leaderboardData);

      // Get user's position if authenticated
      if (user?.uid) {
        const userPos = await leagueLeaderboardService.getUserLeaguePosition(leagueId, user.uid);
        setUserPosition(userPos);
      }

    } catch (err) {
      console.error('Error loading league data:', err);
      setError(err.message || 'Failed to load league leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      // Recalculate the entire leaderboard
      await leagueLeaderboardService.recalculateLeagueLeaderboard(leagueId);

      // Reload data
      await loadLeagueData();
    } catch (err) {
      console.error('Error refreshing leaderboard:', err);
      setError('Failed to refresh leaderboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackToLeagues = () => {
    navigate('/league-management');
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'Crown', color: 'text-yellow-500' };
      case 2: return { icon: 'Medal', color: 'text-gray-400' };
      case 3: return { icon: 'Award', color: 'text-yellow-600' };
      default: return { icon: 'User', color: 'text-muted-foreground' };
    }
  };

  const getFormColor = (form) => {
    switch (form) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading league leaderboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Leaderboard</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="space-x-3">
                <Button onClick={loadLeagueData}>Try Again</Button>
                <Button variant="outline" onClick={handleBackToLeagues}>Back to Leagues</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToLeagues}
                className="shrink-0"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{league?.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {league?.description} • {league?.memberCount} members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                onClick={handleRefresh}
                loading={refreshing}
              >
                {refreshing ? 'Updating...' : 'Update Rankings'}
              </Button>
            </div>
          </div>

          {/* User Position Highlight */}
          {userPosition && user && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
                    <Icon name="Trophy" size={32} color="white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Your Position</h2>
                    <p className="text-muted-foreground">{league?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">#{userPosition?.rank || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Rank</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{userPosition?.totalPoints || 0}</div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{userPosition?.accuracy || 0}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{userPosition?.currentStreak || 0}</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          {leaderboard.length > 0 ? (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">League Rankings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Updated {new Date().toLocaleString()}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Predictions
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Form
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {leaderboard.map((entry, index) => {
                      const rankInfo = getRankIcon(entry.rank);
                      const isCurrentUser = entry.userId === user?.uid;

                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Icon name={rankInfo.icon} size={20} className={rankInfo.color} />
                              <span className="font-medium text-foreground">{entry.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-secondary-foreground">
                                  {entry.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {entry.userName} {isCurrentUser && <span className="text-primary">(You)</span>}
                                </div>
                                {entry.pointsFromFirst > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    -{entry.pointsFromFirst} from 1st
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="font-bold text-foreground">{entry.totalPoints}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.averagePointsPerMatch} avg
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="font-medium text-foreground">{entry.accuracy}%</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.correctPredictions}/{entry.totalPredictions}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="font-medium text-foreground">{entry.totalPredictions}</div>
                            <div className="text-xs text-success">{entry.exactScores} exact</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="font-medium text-foreground">{entry.currentStreak}</div>
                            <div className="text-xs text-muted-foreground">
                              best: {entry.bestStreak}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFormColor(entry.recentForm)}`}>
                              {entry.recentForm}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Members need to make predictions to appear on the leaderboard.
              </p>
              <Button
                variant="default"
                iconName="Target"
                onClick={() => navigate('/match-predictions')}
              >
                Make Predictions
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeagueLeaderboardPage;