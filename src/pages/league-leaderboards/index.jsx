import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LeaderboardTable from './components/LeaderboardTable';
import LeaderboardFilters from './components/LeaderboardFilters';
import LeaderboardStats from './components/LeaderboardStats';
import ShareModal from './components/ShareModal';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAuth } from '../../context/AuthContext';

const LeaderboardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState('general');
  const [selectedPeriod, setSelectedPeriod] = useState('overall');
  const [selectedSort, setSelectedSort] = useState('points');
  const [showStats, setShowStats] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Use real leaderboard data
  const {
    leaderboardData,
    userRank,
    statsData,
    topPerformers,
    loading,
    error,
    refreshing,
    refresh
  } = useLeaderboard(selectedLeague, selectedPeriod, selectedSort);

  // Add error state display
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Leaderboard</h3>
              <p className="text-muted-foreground mb-6">
                Unable to fetch leaderboard data. Please try again.
              </p>
              <Button onClick={refresh} loading={refreshing}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleRefresh = () => {
    refresh();
  };

  const handleUserClick = (userId) => {
    navigate('/user-profile', { state: { userId } });
  };

  const handleShareAchievement = () => {
    if (userRank) {
      setShareModalOpen(true);
    }
  };

  // League options
  const leagueOptions = [
    { value: 'general', label: 'General League' },
    { value: 'champions-league', label: 'Champions League' },
    { value: 'premier-league', label: 'Premier League' },
    { value: 'la-liga', label: 'La Liga' },
    { value: 'bundesliga', label: 'Bundesliga' },
    { value: 'serie-a', label: 'Serie A' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">League Leaderboards</h1>
              <p className="text-muted-foreground mt-2">
                Track your performance and compete with other football prediction experts
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                iconName="BarChart3"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
              
              {userRank && (
                <Button
                  variant="default"
                  iconName="Share"
                  onClick={handleShareAchievement}
                >
                  Share Achievement
                </Button>
              )}
            </div>
          </div>

          {/* Current User Highlight */}
          {userRank && user && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
                    <Icon name="Trophy" size={32} color="white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Your Current Rank</h2>
                    <p className="text-muted-foreground">{leagueOptions.find(l => l.value === selectedLeague)?.label || 'General League'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">#{userRank?.position || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Position</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{userRank?.totalPoints || 0}</div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{userRank?.accuracy || 0}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <LeaderboardFilters
            selectedLeague={selectedLeague}
            onLeagueChange={setSelectedLeague}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            onRefresh={handleRefresh}
            isLoading={loading || refreshing}
          />

          {/* Stats Panel */}
          {showStats && (
            <div className="mb-6">
              <LeaderboardStats
                statsData={statsData}
                topPerformers={topPerformers}
              />
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Icon name="Loader2" size={24} className="animate-spin" />
                <span>Loading leaderboard data...</span>
              </div>
            </div>
          ) : (
            /* Leaderboard Table */
            (<LeaderboardTable
              leaderboardData={leaderboardData}
              currentUserId={user?.uid}
              onUserClick={handleUserClick}
            />)
          )}

          {/* Empty State */}
          {!loading && leaderboardData?.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Rankings Available</h3>
              <p className="text-muted-foreground mb-6">
                No players found for the selected league and time period.
              </p>
              <Button
                variant="default"
                iconName="Plus"
                onClick={() => navigate('/league-management')}
              >
                Join a League
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Share Modal */}
      {userRank && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          userRank={userRank}
          leagueName={leagueOptions.find(l => l.value === selectedLeague)?.label || 'General League'}
        />
      )}
    </div>
  );
};

export default LeaderboardsPage;