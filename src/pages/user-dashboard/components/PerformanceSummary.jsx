import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PerformanceSummary = ({
  stats = {},
  loading = false,
  recentResults = [],
  upcomingMatches = []
}) => {
  const totalUpcoming = stats?.totalUpcoming || 0;
  const matchesThisWeek = stats?.matchesThisWeek || 0;
  const urgentCount = stats?.urgentCount || 0;
  const competitionsFollowed = stats?.competitionsFollowed || 0;
  const nextMatch = stats?.nextMatch || null;
  const latestResult = stats?.latestResult || null;

  const progressTarget = totalUpcoming > 0 ? Math.min(100, Math.round((matchesThisWeek / totalUpcoming) * 100)) : 0;

  const highlights = [
    nextMatch
      ? {
          id: 'next-match',
          title: 'Next Kickoff',
          description: `${nextMatch.homeTeam?.name || 'TBD'} vs ${nextMatch.awayTeam?.name || 'TBD'} ? ${nextMatch.kickoffLabel}`,
          icon: 'Clock',
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        }
      : null,
    latestResult
      ? {
          id: 'latest-result',
          title: 'Latest Result',
          description: `${latestResult.homeTeam?.name || 'TBD'} ${
            typeof latestResult.homeScore === 'number' ? latestResult.homeScore : '-'
          }-${
            typeof latestResult.awayScore === 'number' ? latestResult.awayScore : '-'
          } ${latestResult.awayTeam?.name || 'TBD'} ? ${latestResult.competition}`,
          icon: 'CheckCircle',
          color: 'text-success',
          bgColor: 'bg-success/10'
        }
      : null,
    upcomingMatches[1]
      ? {
          id: 'second-match',
          title: 'Also Coming Up',
          description: `${upcomingMatches[1].homeTeam?.name || 'TBD'} vs ${
            upcomingMatches[1].awayTeam?.name || 'TBD'
          } ? ${upcomingMatches[1].kickoffLabel}`,
          icon: 'Calendar',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10'
        }
      : null
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Performance Summary</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Performance Summary</h2>
        </div>
        <Link to="/user-profile">
          <Button variant="outline" size="sm">
            View Stats
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{totalUpcoming}</div>
          <div className="text-xs text-muted-foreground">Upcoming Matches</div>
          <div className="flex items-center justify-center mt-1 text-xs text-success">
            <Icon name="Calendar" size={12} className="mr-1" />
            <span>Next 14 days</span>
          </div>
        </div>

        <div className="bg-secondary/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">{matchesThisWeek}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
          <div className="text-xs text-muted-foreground mt-1">Within 7 days</div>
        </div>

        <div className="bg-warning/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">{urgentCount}</div>
          <div className="text-xs text-muted-foreground">Starting Soon</div>
          <div className="text-xs text-muted-foreground mt-1">Next 24 hours</div>
        </div>

        <div className="bg-success/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">{competitionsFollowed}</div>
          <div className="text-xs text-muted-foreground">Competitions Tracked</div>
          <div className="text-xs text-muted-foreground mt-1">Active feeds</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Weekly Coverage</span>
          <span className="text-sm text-success">{progressTarget}% of upcoming fixtures</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${progressTarget}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>{totalUpcoming} total</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Highlights</h3>
        {highlights.length > 0 ? (
          <div className="space-y-2">
            {highlights.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-micro">
                <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center`}>
                  <Icon name={item.icon} size={16} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            No fixtures to highlight yet. New matches will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceSummary;
