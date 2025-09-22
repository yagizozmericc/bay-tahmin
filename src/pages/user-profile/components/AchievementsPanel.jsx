import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AchievementsPanel = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Achievements', icon: 'Trophy' },
    { id: 'predictions', label: 'Predictions', icon: 'Target' },
    { id: 'accuracy', label: 'Accuracy', icon: 'TrendingUp' },
    { id: 'streaks', label: 'Streaks', icon: 'Flame' },
    { id: 'social', label: 'Social', icon: 'Users' }
  ];

  const achievementsList = [
    {
      id: 1,
      title: 'First Prediction',
      description: 'Made your first match prediction',
      category: 'predictions',
      icon: 'Target',
      unlocked: true,
      unlockedDate: '2024-01-15',
      rarity: 'common',
      points: 10
    },
    {
      id: 2,
      title: 'Perfect Week',
      description: 'Got all predictions correct in a single week',
      category: 'accuracy',
      icon: 'Star',
      unlocked: true,
      unlockedDate: '2024-02-03',
      rarity: 'rare',
      points: 100
    },
    {
      id: 3,
      title: 'Hot Streak',
      description: 'Achieved a 10-match correct prediction streak',
      category: 'streaks',
      icon: 'Flame',
      unlocked: true,
      unlockedDate: '2024-02-20',
      rarity: 'epic',
      points: 250
    },
    {
      id: 4,
      title: 'Century Club',
      description: 'Made 100 predictions',
      category: 'predictions',
      icon: 'Trophy',
      unlocked: true,
      unlockedDate: '2024-03-10',
      rarity: 'rare',
      points: 150
    },
    {
      id: 5,
      title: 'League Master',
      description: 'Won first place in a league',
      category: 'social',
      icon: 'Crown',
      unlocked: false,
      rarity: 'legendary',
      points: 500,
      progress: 75,
      requirement: 'Win a league competition'
    },
    {
      id: 6,
      title: 'Prediction Prodigy',
      description: 'Achieve 90% accuracy over 50 predictions',
      category: 'accuracy',
      icon: 'Zap',
      unlocked: false,
      rarity: 'epic',
      points: 300,
      progress: 45,
      requirement: 'Current accuracy: 73.2%'
    }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievementsList 
    : achievementsList?.filter(achievement => achievement?.category === selectedCategory);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground border-muted';
      case 'rare': return 'text-primary border-primary';
      case 'epic': return 'text-accent border-accent';
      case 'legendary': return 'text-warning border-warning';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-muted/10';
      case 'rare': return 'bg-primary/10';
      case 'epic': return 'bg-accent/10';
      case 'legendary': return 'bg-warning/10';
      default: return 'bg-muted/10';
    }
  };

  const handleShare = (achievement) => {
    // Mock share functionality
    console.log('Sharing achievement:', achievement?.title);
  };

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Trophy" size={20} className="text-primary" />
            <span>Achievement Progress</span>
          </h3>
          <div className="text-sm text-muted-foreground">
            {achievements?.unlocked} of {achievements?.total} unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{achievements?.unlocked}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{achievements?.points}</div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{achievements?.rare}</div>
            <div className="text-sm text-muted-foreground">Rare Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{Math.round((achievements?.unlocked / achievements?.total) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Overall Progress</span>
            <span>{achievements?.unlocked}/{achievements?.total}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(achievements?.unlocked / achievements?.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Category Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                selectedCategory === category?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={category?.icon} size={16} />
              <span>{category?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements?.map((achievement) => (
          <div
            key={achievement?.id}
            className={`bg-card border-2 rounded-lg p-6 transition-micro ${
              achievement?.unlocked 
                ? `${getRarityColor(achievement?.rarity)} ${getRarityBg(achievement?.rarity)}` 
                : 'border-muted bg-muted/5 opacity-75'
            }`}
          >
            {/* Achievement Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                achievement?.unlocked 
                  ? getRarityBg(achievement?.rarity)
                  : 'bg-muted'
              }`}>
                <Icon 
                  name={achievement?.icon} 
                  size={24} 
                  className={achievement?.unlocked ? getRarityColor(achievement?.rarity)?.split(' ')?.[0] : 'text-muted-foreground'}
                />
              </div>
              
              {achievement?.unlocked && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare(achievement)}
                  className="h-8 w-8"
                >
                  <Icon name="Share2" size={16} />
                </Button>
              )}
            </div>

            {/* Achievement Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{achievement?.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityBg(achievement?.rarity)} ${getRarityColor(achievement?.rarity)?.split(' ')?.[0]} capitalize`}>
                  {achievement?.rarity}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">{achievement?.description}</p>
              
              {achievement?.unlocked ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-success flex items-center space-x-1">
                    <Icon name="CheckCircle" size={14} />
                    <span>Unlocked</span>
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(achievement.unlockedDate)?.toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {achievement?.progress && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{achievement?.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${achievement?.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {achievement?.requirement && (
                    <p className="text-xs text-muted-foreground">{achievement?.requirement}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Reward</span>
                <span className="text-sm font-medium text-accent">+{achievement?.points} points</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Achievements */}
      {achievements?.recent && achievements?.recent?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-primary" />
            <span>Recently Unlocked</span>
          </h3>
          
          <div className="space-y-3">
            {achievements?.recent?.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRarityBg(achievement?.rarity)}`}>
                  <Icon name={achievement?.icon} size={20} className={getRarityColor(achievement?.rarity)?.split(' ')?.[0]} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{achievement?.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement?.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-accent">+{achievement?.points}</div>
                  <div className="text-xs text-muted-foreground">{achievement?.timeAgo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPanel;