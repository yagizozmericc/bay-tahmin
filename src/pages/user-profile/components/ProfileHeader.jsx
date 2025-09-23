import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ user, onShareProfile, onNavigateToSettings }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShareProfile = async () => {
    setIsSharing(true);

    try {
      const shareData = {
        title: `${user?.username || 'User'}'s Football Predictions Profile`,
        text: `Check out my prediction stats: ${user?.totalPredictions || 0} predictions with ${user?.accuracy || 0}% accuracy!`,
        url: window.location.href
      };

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );

        // Call parent callback for feedback
        if (onShareProfile) {
          onShareProfile('copied', 'Profile link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Error sharing profile:', error);

      // Try clipboard as final fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (onShareProfile) {
          onShareProfile('copied', 'Profile link copied to clipboard!');
        }
      } catch (clipboardError) {
        if (onShareProfile) {
          onShareProfile('error', 'Failed to share profile. Please try again.');
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar Section */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary border-4 border-primary/20 flex items-center justify-center">
          <Icon name="User" size={40} color="white" />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-foreground mb-1">{user?.username}</h1>
          <p className="text-muted-foreground mb-3">{user?.email}</p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
            <div className="flex items-center space-x-1">
              <Icon name="Target" size={16} className="text-primary" />
              <span className="text-muted-foreground">Predictions:</span>
              <span className="font-semibold text-foreground">{user?.totalPredictions}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="font-semibold text-foreground">{user?.accuracy}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Trophy" size={16} className="text-accent" />
              <span className="text-muted-foreground">Rank:</span>
              <span className="font-semibold text-foreground">#{user?.globalRank}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName={isSharing ? "Loader2" : "Share2"}
            iconPosition="left"
            onClick={handleShareProfile}
            loading={isSharing}
          >
            Share Profile
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Settings"
            iconPosition="left"
            onClick={() => onNavigateToSettings && onNavigateToSettings()}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;