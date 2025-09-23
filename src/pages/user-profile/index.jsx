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
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMessage, setShareMessage] = useState(null);

  const [statistics] = useState({
    totalPredictions: 247,
    accuracy: 73.2,
    bestStreak: 12,
    currentStreak: 5,
    totalPoints: 1847,
    exactScores: 28,
    correctWinners: 181,
    correctScorers: 94,
    avgPointsPerMatch: 7.5,
    leaguesJoined: 8,
    globalRank: 1247,
    daysActive: 127,
    achievementsUnlocked: 15
  });

  const [achievements] = useState({
    unlocked: 15,
    total: 24,
    points: 2350,
    rare: 4,
    recent: [
      {
        title: "Hot Streak",
        description: "Achieved a 10-match correct prediction streak",
        icon: "Flame",
        rarity: "epic",
        points: 250,
        timeAgo: "2 days ago"
      },
      {
        title: "Century Club",
        description: "Made 100 predictions",
        icon: "Trophy",
        rarity: "rare",
        points: 150,
        timeAgo: "1 week ago"
      }
    ]
  });

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
    document.title = 'User Profile - Bay Tahmin Pro';
    loadUserProfile();
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
        return <StatisticsPanel statistics={statistics} />;
      case 'achievements':
        return <AchievementsPanel achievements={achievements} />;
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