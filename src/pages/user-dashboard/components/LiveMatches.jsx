import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LiveMatches = ({ results = [], loading = false, error = null }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Radio" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Latest Results</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Radio" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Latest Results</h2>
        </div>
        <div className="text-center py-10">
          <Icon name="AlertTriangle" size={32} className="mx-auto text-warning mb-3" />
          <p className="text-sm text-muted-foreground">
            We couldn't load recent results at the moment. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Radio" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Latest Results</h2>
        </div>
        <div className="text-center py-10">
          <Icon name="Calendar" size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No recent results from the tracked competitions yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            TheSportsDB free plan does not provide live play-by-play data, so we'll show final scores as they become available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Radio" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Latest Results</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="space-y-4">
        {results.map((match) => (
          <div
            key={match?.id}
            className="border border-border rounded-lg p-4 bg-gradient-to-r from-background to-muted/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match?.competition?.toLowerCase().includes('champions')
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary'
                  }`}
                >
                  {match?.competition}
                </div>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-muted/30 text-muted-foreground">
                <Icon name="Square" size={12} />
                <span>Final</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={match?.homeTeam?.logo}
                      alt={match?.homeTeam?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm">{match?.homeTeam?.name}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 px-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {typeof match?.homeScore === 'number' ? match.homeScore : '-'}
                    <span className="text-muted-foreground mx-1">-</span>
                    {typeof match?.awayScore === 'number' ? match.awayScore : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{match?.kickoffLabel}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-1 justify-end">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{match?.awayTeam?.name}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={match?.awayTeam?.logo}
                      alt={match?.awayTeam?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{match?.relativeTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={12} />
                  <span>{match?.venue || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>Live coverage is limited on the free API tier. Scores refresh when matches finish.</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMatches;

