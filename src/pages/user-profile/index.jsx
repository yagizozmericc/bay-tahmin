import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import ProfileForm from './components/ProfileForm';
import StatisticsPanel from './components/StatisticsPanel';
import AchievementsPanel from './components/AchievementsPanel';
import SettingsPanel from './components/SettingsPanel';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, createOrUpdateUserProfile } from '../../services/userProfileService';
import { userStatisticsService } from '../../services/userStatisticsService';
import { achievementService } from '../../services/achievementService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMessage, setShareMessage] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsRefreshing, setStatisticsRefreshing] = useState(false);
  const [achievements, setAchievements] = useState(null);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsRefreshing, setAchievementsRefreshing] = useState(false);


  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'Europe/Istanbul',
    privacy: {
      publicProfile: true,
      showInLeaderboards: true,
      allowFriendRequests: true,
      analytics: true,
      marketing: false
    }
  });

  useEffect(() => {
    document.title = 'User Profile - Scorism';
    loadUserProfile();
    loadUserStatistics();
    loadUserAchievements();
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let profile = await getUserProfile(authUser.uid);

      if (!profile) {
        // Create profile with initial data from auth
        profile = await createOrUpdateUserProfile(authUser.uid, {
          username: authUser.displayName || authUser.email?.split('@')[0] || '',
          email: authUser.email || '',
          firstName: '',
          lastName: '',
          bio: '',
          location: '',
          favoriteTeam: '',
          preferredCompetitions: [],
          notifications: {
            matchReminders: true,
            leagueUpdates: true,
            achievements: true,
            weeklySummary: false
          }
        });
      }

      // Add auth user data
      setUser({
        ...profile,
        uid: authUser.uid,
        totalPredictions: 0,
        accuracy: 0,
        globalRank: 0
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStatistics = async () => {
    if (!authUser?.uid) {
      setStatisticsLoading(false);
      return;
    }

    try {
      setStatisticsLoading(true);
      const userStats = await userStatisticsService.getUserStatistics(authUser.uid);
      setStatistics(userStats);

      // Also trigger achievement calculation when statistics are loaded
      if (userStats && !achievementsLoading) {
        try {
          const userAchievements = await achievementService.getUserAchievementData(authUser.uid, userStats);
          setAchievements(userAchievements);
        } catch (achievementError) {
          console.error('Error loading achievements after stats:', achievementError);
        }
      }
    } catch (err) {
      console.error('Error loading user statistics:', err);
      // Set default statistics on error
      setStatistics(userStatisticsService.getDefaultStatistics());
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleRefreshStatistics = async () => {
    if (!authUser?.uid || statisticsRefreshing) return;

    try {
      setStatisticsRefreshing(true);
      // Force refresh by passing true
      const userStats = await userStatisticsService.getUserStatistics(authUser.uid, true);
      setStatistics(userStats);
    } catch (err) {
      console.error('Error refreshing user statistics:', err);
      // Keep current statistics on error
    } finally {
      setStatisticsRefreshing(false);
    }
  };

  const loadUserAchievements = async () => {
    if (!authUser?.uid) {
      setAchievementsLoading(false);
      return;
    }

    try {
      setAchievementsLoading(true);
      // Wait for statistics to be available if possible
      const currentStats = statistics || await userStatisticsService.getUserStatistics(authUser.uid);
      const userAchievements = await achievementService.getUserAchievementData(authUser.uid, currentStats);
      setAchievements(userAchievements);
    } catch (err) {
      console.error('Error loading user achievements:', err);
      // Set default achievements on error
      setAchievements(achievementService.getDefaultAchievements());
    } finally {
      setAchievementsLoading(false);
    }
  };

  const handleRefreshAchievements = async () => {
    if (!authUser?.uid || achievementsRefreshing) return;

    try {
      setAchievementsRefreshing(true);
      // Get current statistics for achievement calculation
      const currentStats = await userStatisticsService.getUserStatistics(authUser.uid, true);
      // Force refresh achievements
      const userAchievements = await achievementService.getUserAchievementData(authUser.uid, currentStats, true);
      setAchievements(userAchievements);
      // Also update statistics if we refreshed them
      setStatistics(currentStats);
    } catch (err) {
      console.error('Error refreshing user achievements:', err);
      // Keep current achievements on error
    } finally {
      setAchievementsRefreshing(false);
    }
  };

  const handleProfileSave = async (updatedData) => {
    try {
      const updatedProfile = await createOrUpdateUserProfile(authUser.uid, updatedData);
      setUser(prev => ({ ...prev, ...updatedProfile }));
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  const handleSettingsUpdate = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  const handleShareProfile = (type, message) => {
    setShareMessage({ type, message });
    // Auto-hide message after 3 seconds
    setTimeout(() => setShareMessage(null), 3000);
  };

  const handleNavigateToSettings = () => {
    setActiveTab('settings');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm user={user} onSave={handleProfileSave} />;
      case 'statistics':
        return (
          <div>
            {statisticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="text-primary animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading statistics...</span>
              </div>
            ) : (
              <StatisticsPanel
                statistics={statistics}
                onRefresh={handleRefreshStatistics}
                isRefreshing={statisticsRefreshing}
              />
            )}
          </div>
        );
      case 'achievements':
        return (
          <div>
            {achievementsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="text-primary animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading achievements...</span>
              </div>
            ) : (
              <AchievementsPanel
                achievements={achievements}
                onRefresh={handleRefreshAchievements}
                isRefreshing={achievementsRefreshing}
              />
            )}
          </div>
        );
      case 'settings':
        return <SettingsPanel settings={settings} onSettingsUpdate={handleSettingsUpdate} />;
      default:
        return <ProfileForm user={user} onSave={handleProfileSave} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Loading Profile</h3>
              <p className="text-muted-foreground">Please wait while we load your profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Profile</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={loadUserProfile}>Try Again</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!authUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Icon name="UserX" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Please Sign In</h3>
              <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Share Message */}
          {shareMessage && (
            <div
              className={`mb-4 p-4 text-sm rounded-lg border ${
                shareMessage.type === 'copied'
                  ? 'border-success/40 bg-success/10 text-success'
                  : shareMessage.type === 'error'
                  ? 'border-error/40 bg-error/10 text-error'
                  : 'border-primary/40 bg-primary/10 text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon
                  name={shareMessage.type === 'copied' ? 'CheckCircle' : shareMessage.type === 'error' ? 'AlertCircle' : 'Info'}
                  size={16}
                />
                <span>{shareMessage.message}</span>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <ProfileHeader
            user={user}
            onShareProfile={handleShareProfile}
            onNavigateToSettings={handleNavigateToSettings}
          />

          {/* Navigation Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;