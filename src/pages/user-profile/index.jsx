import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import ProfileForm from './components/ProfileForm';
import StatisticsPanel from './components/StatisticsPanel';
import AchievementsPanel from './components/AchievementsPanel';
import SettingsPanel from './components/SettingsPanel';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    id: 1,
    username: "footballfan2024",
    email: "john.doe@email.com",
    firstName: "John",
    lastName: "Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    totalPredictions: 247,
    accuracy: 73.2,
    globalRank: 1247,
    preferredCompetitions: ['champions-league', 'turkish-super-league'],
    notifications: {
      matchReminders: true,
      leagueUpdates: true,
      achievements: true,
      weeklySummary: false
    }
  });

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
  }, []);

  const handleAvatarUpdate = (newAvatar) => {
    setUser(prev => ({ ...prev, avatar: newAvatar }));
  };

  const handleProfileSave = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const handleSettingsUpdate = (updatedSettings) => {
    setSettings(updatedSettings);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <ProfileHeader 
            user={user} 
            onAvatarUpdate={handleAvatarUpdate}
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