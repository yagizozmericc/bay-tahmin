import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ user, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setIsUploading(true);
      // Mock upload delay
      setTimeout(() => {
        onAvatarUpdate(URL.createObjectURL(file));
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar Section */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
            {user?.avatar ? (
              <Image 
                src={user?.avatar} 
                alt={`${user?.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary">
                <Icon name="User" size={32} color="white" />
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <label className="absolute -bottom-2 -right-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="w-8 h-8 bg-accent hover:bg-accent/90 rounded-full flex items-center justify-center border-2 border-card transition-micro">
              {isUploading ? (
                <Icon name="Loader2" size={16} color="white" className="animate-spin" />
              ) : (
                <Icon name="Camera" size={16} color="white" />
              )}
            </div>
          </label>
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
          <Button variant="outline" size="sm" iconName="Share2" iconPosition="left">
            Share Profile
          </Button>
          <Button variant="default" size="sm" iconName="Settings" iconPosition="left">
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;