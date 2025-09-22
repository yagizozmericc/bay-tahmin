import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PredictionSummary = ({
  predictions,
  matches,
  onClearAll,
  onSaveAll,
  pendingCount = 0,
  isSaving = false,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const matchesArray = Array.isArray(matches) ? matches : [];
  const predictionEntries = Object.entries(predictions || {});

  const stats = (() => {
    const totalMatches = matchesArray.length;
    let predictedMatches = 0;
    let completePredictions = 0;

    predictionEntries.forEach(([_, prediction]) => {
      if (!prediction) {
        return;
      }

      const hasPrediction = prediction.homeScore !== ''
        || prediction.awayScore !== ''
        || (Array.isArray(prediction.scorers) && prediction.scorers.length > 0);

      if (hasPrediction) {
        predictedMatches += 1;
      }

      if (prediction.homeScore !== '' && prediction.awayScore !== '') {
        completePredictions += 1;
      }
    });

    return {
      totalMatches,
      predictedMatches,
      completePredictions
    };
  })();

  const recentPredictions = predictionEntries
    .filter(([_, prediction]) => prediction && (prediction.homeScore !== '' || prediction.awayScore !== ''))
    .slice(0, 3)
    .map(([matchId, prediction]) => ({
      match: matchesArray.find((match) => match?.id === matchId),
      prediction
    }))
    .filter(({ match }) => Boolean(match));

  const hasAnyPredictions = stats.predictedMatches > 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Loading your predictions...</span>
        </div>
      </div>
    );
  }

  if (!hasAnyPredictions) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="text-center">
          <Icon name="Target" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Predictions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start making predictions for upcoming matches to see your summary here. Changes are saved automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Trophy" size={16} />
              <span>+3 for exact score</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="CheckCircle" size={16} />
              <span>+1 for correct winner</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={16} />
              <span>+1 per correct scorer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const predictionProgress = stats.totalMatches > 0
    ? Math.min(100, Math.round((stats.predictedMatches / stats.totalMatches) * 100))
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="BarChart3" size={20} />
          <span>Prediction Summary</span>
        </h3>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.predictedMatches}</div>
          <div className="text-sm text-muted-foreground">Predicted</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-success">{stats.completePredictions}</div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-muted-foreground">{Math.max(stats.totalMatches - stats.predictedMatches, 0)}</div>
          <div className="text-sm text-muted-foreground">Remaining</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Prediction Progress</span>
          <span className="font-medium text-foreground">{predictionProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${predictionProgress}%` }}
          ></div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="mb-4 text-xs text-muted-foreground flex items-center space-x-2">
          <Icon name="Loader2" size={14} className="animate-spin" />
          <span>{pendingCount} pending auto-save{pendingCount > 1 ? 's' : ''}.</span>
        </div>
      )}

      {isExpanded && recentPredictions.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">Recent Predictions</h4>
          <div className="space-y-3">
            {recentPredictions.map(({ match, prediction }) => (
              <div key={match?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="font-medium">{match?.homeTeam?.name}</span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className="font-medium">{match?.awayTeam?.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">
                    {prediction?.homeScore === '' ? '-' : prediction?.homeScore} - {prediction?.awayScore === '' ? '-' : prediction?.awayScore}
                  </div>
                  {Array.isArray(prediction?.scorers) && prediction.scorers.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Icon name="User" size={12} />
                      <span>{prediction.scorers.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {stats.predictedMatches > 0 && (
            <span>Auto-save is enabled. Last snapshot at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {stats.predictedMatches > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              iconName="Trash2"
              iconPosition="left"
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={onSaveAll}
            iconName={isSaving ? 'Loader2' : 'Save'}
            iconPosition="left"
            disabled={isSaving || pendingCount === 0}
            className={isSaving ? 'opacity-80' : ''}
          >
            {isSaving ? 'Saving...' : 'Save Pending'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PredictionSummary;