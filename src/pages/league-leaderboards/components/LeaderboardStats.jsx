import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LeaderboardStats = ({ statsData, topPerformers }) => {
  const statCards = [
    {
      title: 'Total Players',
      value: statsData?.totalPlayers || 0,
      change: statsData?.totalPlayers > 0 ? 'Active' : 'No data',
      changeLabel: 'in this league',
      icon: 'Users',
      color: 'text-primary'
    },
    {
      title: 'Total Predictions',
      value: statsData?.totalPredictions?.toLocaleString() || '0',
      change: statsData?.totalPredictions > 0 ? 'Available' : 'No data',
      changeLabel: 'predictions made',
      icon: 'Target',
      color: 'text-secondary'
    },
    {
      title: 'Average Accuracy',
      value: `${statsData?.averageAccuracy || 0}%`,
      change: statsData?.averageAccuracy > 0 ? 'Calculated' : 'No data',
      changeLabel: 'league average',
      icon: 'TrendingUp',
      color: 'text-success'
    },
    {
      title: 'Active Leagues',
      value: statsData?.activeLeagues || 0,
      change: statsData?.activeLeagues > 0 ? 'Available' : 'No data',
      changeLabel: 'leagues active',
      icon: 'Trophy',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-muted ${stat?.color}`}>
                <Icon name={stat?.icon} size={24} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{stat?.value}</div>
                <div className="text-xs text-muted-foreground">{stat?.title}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-muted-foreground font-medium">{stat?.change}</span>
              <span className="text-muted-foreground">{stat?.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Accurate Predictors */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Most Accurate</h3>
            <Icon name="Target" size={20} className="text-success" />
          </div>
          <div className="space-y-3">
            {topPerformers?.mostAccurate?.length > 0 ? (
              topPerformers.mostAccurate.map((user, index) => (
                <div key={user?.id} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{user?.totalPredictions || 0} predictions</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">{user?.accuracy || 0}%</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available yet</p>
            )}
          </div>
        </div>

        {/* Highest Scorers */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Highest Scorers</h3>
            <Icon name="Trophy" size={20} className="text-accent" />
          </div>
          <div className="space-y-3">
            {topPerformers?.highestScorers?.length > 0 ? (
              topPerformers.highestScorers.map((user, index) => (
                <div key={user?.id} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{user?.exactScores || 0} exact scores</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{user?.totalPoints || 0}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available yet</p>
            )}
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
          <Icon name="Award" size={20} className="text-warning" />
        </div>
        <div className="space-y-4">
          {topPerformers?.recentAchievements?.length > 0 ? (
            topPerformers.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  achievement?.type === 'streak' ? 'bg-success/20 text-success' :
                  achievement?.type === 'accuracy'? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'
                }`}>
                  <Icon
                    name={
                      achievement?.type === 'streak' ? 'Zap' :
                      achievement?.type === 'accuracy'? 'Target' : 'Trophy'
                    }
                    size={18}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{achievement?.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement?.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                      {(achievement?.user?.displayName || achievement?.user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-foreground">{achievement?.user?.displayName || achievement?.user?.username || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{achievement?.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Award" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent achievements yet</p>
              <p className="text-xs text-muted-foreground">Start making predictions to earn achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardStats;