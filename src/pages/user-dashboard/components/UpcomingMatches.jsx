import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingMatches = ({ matches = [], loading = false, error = null }) => {
  const hasMatches = Array.isArray(matches) && matches.length > 0;

  const renderState = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <Icon name="AlertTriangle" size={32} className="mx-auto text-warning mb-3" />
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We couldn't load upcoming matches right now. Please try again shortly.
          </p>
        </div>
      );
    }

    if (!hasMatches) {
      return (
        <div className="text-center py-10">
          <Icon name="Calendar" size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No upcoming fixtures found in the next two weeks.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back later for new matches.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {matches.map((match) => {
          const hasPrediction = Boolean(match?.userPrediction);

          return (
            <div
              key={match?.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro"
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
                  {match?.venue && (
                    <span className="text-xs text-muted-foreground">{match.venue}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{match?.timeUntil}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
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

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span className="text-sm">vs</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={match?.awayTeam?.logo}
                        alt={match?.awayTeam?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm">{match?.awayTeam?.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {match?.kickoffLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasPrediction ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="CheckCircle" size={16} />
                      <span className="text-xs font-medium">Prediction saved</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-warning">
                      <Icon name="AlertCircle" size={16} />
                      <span className="text-xs font-medium">Prediction pending</span>
                    </div>
                  )}
                </div>

                <Link to="/match-predictions">
                  <Button
                    variant={hasPrediction ? 'outline' : 'default'}
                    size="sm"
                  >
                    {hasPrediction ? 'Edit' : 'Predict'}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Upcoming Matches</h2>
        </div>
        <Link to="/match-predictions">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {renderState()}
    </div>
  );
};

export default UpcomingMatches;
