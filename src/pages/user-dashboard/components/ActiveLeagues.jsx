import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveLeagues = ({ summaries = [], loading = false }) => {
  const hasData = Array.isArray(summaries) && summaries.some((item) => item.upcomingCount > 0 || item.latestResult);

  const renderSummary = (summary) => {
    const upcomingCount = summary?.upcomingCount || 0;
    const nextMatch = summary?.nextMatch;
    const latestResult = summary?.latestResult;

    return (
      <div key={summary?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{summary?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming fixture${upcomingCount > 1 ? 's' : ''}`
                : 'No upcoming fixtures scheduled'}
            </p>
          </div>
          <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
            {upcomingCount > 0 ? 'Active' : 'Waiting'}
          </div>
        </div>

        {nextMatch && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
              <Icon name="Calendar" size={12} />
              <span>Next fixture</span>
            </div>
            <div className="text-sm font-medium text-foreground">
              {nextMatch?.homeTeam?.name} vs {nextMatch?.awayTeam?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {nextMatch?.kickoffLabel}
            </div>
          </div>
        )}

        {latestResult && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
              <Icon name="History" size={12} />
              <span>Latest result</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>{latestResult?.homeTeam?.name}</span>
              <span>
                {typeof latestResult?.homeScore === 'number' ? latestResult.homeScore : '-'}
                <span className="mx-1 text-muted-foreground">-</span>
                {typeof latestResult?.awayScore === 'number' ? latestResult.awayScore : '-'}
              </span>
              <span>{latestResult?.awayTeam?.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{latestResult?.kickoffLabel}</div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="TrendingUp" size={12} />
            <span>
              {upcomingCount > 0
                ? 'Stay ahead by submitting predictions early.'
                : 'We will notify you when new fixtures are added.'}
            </span>
          </div>
          <Link to="/league-leaderboards">
            <Button variant="outline" size="sm">
              View Board
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Competitions</h2>
        </div>
        <Link to="/league-management">
          <Button variant="outline" size="sm">
            Manage All
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : hasData ? (
        <div className="space-y-4">
          {summaries.map((summary) => renderSummary(summary))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Icon name="Layers" size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No active fixtures available for the tracked competitions.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            New matches will appear here as soon as schedules are released.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <Icon name="Plus" size={24} className="text-muted-foreground mb-2 mx-auto" />
          <h3 className="font-medium text-foreground mb-1">Explore more leagues</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Follow additional competitions to expand your predictions.
          </p>
          <Link to="/league-management">
            <Button variant="outline" className="w-full">
              Browse Leagues
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActiveLeagues;
