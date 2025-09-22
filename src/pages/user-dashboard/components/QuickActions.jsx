import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ stats = {}, loading = false }) => {
  const upcomingCount = stats?.upcomingCount || 0;
  const urgentCount = stats?.urgentCount || 0;
  const nextMatch = stats?.nextMatch || null;

  const urgentDescription = urgentCount > 0
    ? `${urgentCount} match${urgentCount > 1 ? 'es' : ''} starting within 24 hours`
    : `${upcomingCount} upcoming match${upcomingCount === 1 ? '' : 'es'} ready for predictions`;

  const quickActionItems = [
    {
      id: 1,
      title: 'Make Predictions',
      description: urgentDescription,
      icon: 'Target',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      route: '/match-predictions',
      badge: urgentCount > 0 ? String(urgentCount) : upcomingCount > 0 ? String(upcomingCount) : null,
      urgent: urgentCount > 0
    },
    {
      id: 2,
      title: 'Join League',
      description: 'Discover new competitions',
      icon: 'Users',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      route: '/league-management',
      badge: null,
      urgent: false
    },
    {
      id: 3,
      title: 'View Leaderboards',
      description: 'Check your rankings',
      icon: 'BarChart3',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      route: '/league-leaderboards',
      badge: null,
      urgent: false
    },
    {
      id: 4,
      title: 'Profile Settings',
      description: 'Update your preferences',
      icon: 'Settings',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      route: '/user-profile',
      badge: null,
      urgent: false
    }
  ];

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Zap" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Zap" size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActionItems.map((item) => (
          <Link key={item.id} to={item.route} className="block">
            <div
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-elevation-1 hover:scale-[1.02] ${
                item.urgent ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <Icon name={item.icon} size={24} className={item.color} />
                </div>

                {item.badge && (
                  <div className="flex items-center space-x-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.urgent ? 'bg-warning text-warning-foreground animate-pulse' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                    {item.urgent && <Icon name="AlertCircle" size={16} className="text-warning" />}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

              <div className="flex items-center justify-between">
                <Button
                  variant={item.urgent ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                >
                  {item.urgent ? 'Act Now' : 'Go'}
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Deadline Alerts</span>
          <Icon name="Clock" size={16} className="text-warning" />
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="text-sm font-medium text-warning">
              {urgentCount > 0 ? 'Upcoming deadline' : 'Stay ready'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {nextMatch
              ? `${nextMatch.homeTeam?.name} vs ${nextMatch.awayTeam?.name} starts in ${nextMatch.timeUntil}.`
              : 'No urgent fixtures detected. We will highlight the next deadline here.'}
          </p>
          <Link to="/match-predictions">
            <Button variant="warning" size="sm" className="w-full">
              {nextMatch ? 'Predict Now' : 'View Schedule'}
              <Icon name="ExternalLink" size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
