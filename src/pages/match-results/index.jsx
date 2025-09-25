import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useRecentResults } from '../../hooks/useMatches';
import { matchResultService } from '../../services/matchResultService';
import { footballApi } from '../../services/footballApi';
import { useAuth } from '../../context/AuthContext';
import { getUserPredictions } from '../../services/predictionService';

const ResultCard = ({ match, userPrediction, showPrediction = false }) => {
  const getOutcomeIcon = () => {
    if (!match.finalScore) return null;

    const { home, away } = match.finalScore;
    if (home > away) return { icon: 'TrendingUp', color: 'text-success' };
    if (away > home) return { icon: 'TrendingDown', color: 'text-destructive' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  const outcome = getOutcomeIcon();

  const getPredictionResult = () => {
    if (!userPrediction || !userPrediction.evaluation) return null;

    const eval_ = userPrediction.evaluation;
    if (eval_.exactScore) return { text: 'Exact Score!', color: 'text-success', points: 3 };
    if (eval_.correctOutcome) return { text: 'Correct Outcome', color: 'text-success', points: 1 };
    return { text: 'No Points', color: 'text-muted-foreground', points: 0 };
  };

  const predictionResult = getPredictionResult();

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Trophy" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">{match.competition}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(match.kickoffTime).toLocaleDateString('en-GB')}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-center">
            <h3 className="font-semibold text-foreground">{match.homeTeam?.name}</h3>
            <p className="text-xs text-muted-foreground">Home</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mx-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Final Score</p>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {match.finalScore?.home ?? '-'}
                </span>
              </div>
              <span className="text-lg font-bold text-muted-foreground">-</span>
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {match.finalScore?.away ?? '-'}
                </span>
              </div>
            </div>
            {outcome && (
              <div className="mt-2 flex items-center justify-center space-x-1">
                <Icon name={outcome.icon} size={16} className={outcome.color} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-1 justify-end">
          <div className="text-center">
            <h3 className="font-semibold text-foreground">{match.awayTeam?.name}</h3>
            <p className="text-xs text-muted-foreground">Away</p>
          </div>
        </div>
      </div>

      {showPrediction && userPrediction && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Prediction</p>
              <div className="text-sm text-foreground">
                {userPrediction.homeScore || '0'} - {userPrediction.awayScore || '0'}
              </div>
            </div>
            {predictionResult && (
              <div className="text-right">
                <div className={`text-sm font-medium ${predictionResult.color}`}>
                  {predictionResult.text}
                </div>
                <div className="text-lg font-bold text-foreground">
                  +{userPrediction.points || 0} pts
                </div>
              </div>
            )}
          </div>

          {userPrediction.evaluation?.scorerHits && userPrediction.evaluation.scorerHits.length > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-success">
                +{userPrediction.evaluation.scorerHits.length} bonus points for correct scorers
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MatchResults = () => {
  const { user, isAuthenticated } = useAuth();
  const [predictions, setPredictions] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const { results: recentMatches, loading, error, refetch } = useRecentResults({
    competitions: ['turkish-super-league'],
    limit: 20
  });

  // Load user predictions
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setPredictions({});
      return;
    }

    const loadPredictions = async () => {
      setLoadingPredictions(true);
      try {
        const userPredictions = await getUserPredictions(user.uid);
        const predictionsMap = {};
        userPredictions.forEach(pred => {
          if (pred.matchId) {
            predictionsMap[pred.matchId] = pred;
          }
        });
        setPredictions(predictionsMap);
      } catch (error) {
        console.error('Error loading predictions:', error);
      } finally {
        setLoadingPredictions(false);
      }
    };

    loadPredictions();
  }, [isAuthenticated, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await matchResultService.updateRecentResults({
        maxMatches: 10,
        competitions: ['turkish-super-league']
      });
      await refetch();
    } catch (error) {
      console.error('Error refreshing results:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestApi = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await footballApi.testApiAccess();
      setTestResult(result);
      console.log('API Test Result:', result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        errorType: error.name
      });
    } finally {
      setTesting(false);
    }
  };

  const totalPoints = Object.values(predictions).reduce((sum, pred) => {
    return sum + (pred.points || 0);
  }, 0);

  const totalPredictions = Object.values(predictions).filter(pred =>
    pred.status === 'scored'
  ).length;

  const correctPredictions = Object.values(predictions).filter(pred =>
    pred.evaluation?.correctOutcome
  ).length;

  const exactScores = Object.values(predictions).filter(pred =>
    pred.evaluation?.exactScore
  ).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Match Results</h1>
              <p className="text-muted-foreground">
                Recent match results and your prediction scores
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                loading={refreshing}
                iconName="RefreshCw"
              >
                Refresh Results
              </Button>

              <Button
                variant="outline"
                onClick={handleTestApi}
                loading={testing}
                iconName="Wifi"
              >
                Test API
              </Button>
            </div>
          </div>

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Trophy" size={20} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Total Points</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Target" size={20} className="text-success" />
                  <span className="text-sm font-medium text-muted-foreground">Exact Scores</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{exactScores}</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <span className="text-sm font-medium text-muted-foreground">Correct Outcomes</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{correctPredictions}</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Percent" size={20} className="text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0}%
                </div>
              </div>
            </div>
          )}

          {testResult && (
            <div className={`p-4 rounded-lg border mb-6 ${
              testResult.success
                ? 'bg-success/10 border-success/20'
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Icon
                  name={testResult.success ? "CheckCircle" : "AlertCircle"}
                  size={20}
                  className={testResult.success ? "text-success" : "text-destructive"}
                />
                <h4 className="font-medium">API Test Result</h4>
              </div>
              <p className="text-sm mb-2">{testResult.message}</p>
              {testResult.suggestion && (
                <p className="text-xs text-muted-foreground">Suggestion: {testResult.suggestion}</p>
              )}
              {testResult.success && testResult.eventCount && (
                <p className="text-xs text-muted-foreground">Found {testResult.eventCount} events</p>
              )}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-destructive/10 rounded-lg border border-destructive/20 mb-6">
              <Icon name="AlertCircle" size={48} className="mx-auto text-destructive mb-4" />
              <h3 className="font-semibold text-foreground mb-2">API Connection Error</h3>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                Unable to connect to TheSportsDB API. This could be due to:
              </p>
              <div className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                <ul className="list-disc text-left space-y-1">
                  <li>Network connectivity issues</li>
                  <li>API service temporarily down</li>
                  <li>Rate limit exceeded (free plan: 30 requests/minute)</li>
                  <li>Firewall blocking the API</li>
                </ul>
              </div>
              <div className="flex items-center space-x-3 justify-center">
                <Button variant="outline" onClick={refetch}>
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.thesportsdb.com/', '_blank')}
                >
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Check API Status
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Error: {error}
              </p>
            </div>
          )}

          {!error && recentMatches.length === 0 && !loading && (
            <div className="text-center py-12">
              <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Recent Results</h3>
              <p className="text-muted-foreground">
                No recent match results available. Check back after matches have been played.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading recent results...</p>
            </div>
          )}

          {!loading && !error && recentMatches.length > 0 && (
            <div className="space-y-6">
              {recentMatches.map((match) => (
                <ResultCard
                  key={match.id}
                  match={match}
                  userPrediction={predictions[match.id]}
                  showPrediction={isAuthenticated && Boolean(predictions[match.id])}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchResults;