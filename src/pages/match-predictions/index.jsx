import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MatchCard from './components/MatchCard';
import FilterControls from './components/FilterControls';
import PredictionSummary from './components/PredictionSummary';
import ConfirmationDialog from './components/ConfirmationDialog';
import { useMatches, COMPETITIONS } from '../../hooks/useMatches';
import { savePrediction, getUserPredictions, predictionService } from '../../services/predictionService';
import { useAuth } from '../../context/AuthContext';
import { matchResultService } from '../../services/matchResultService';
import { matchResultCacheService } from '../../services/matchResultCacheService';
import { isActivePrediction } from '../../utils/predictionUtils';

const DEFAULT_COMPETITIONS = [
  COMPETITIONS.TURKISH_SUPER_LEAGUE
];

const AUTO_SAVE_DELAY = 800;

const toDisplayScore = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '';
};

const normalizePredictionState = (prediction = {}) => ({
  ...prediction,
  homeScore: toDisplayScore(prediction.homeScore),
  awayScore: toDisplayScore(prediction.awayScore),
  scorers: Array.isArray(prediction.scorers) ? prediction.scorers.filter(Boolean) : [],
  status: prediction.status || 'pending',
  points: typeof prediction.points === 'number' ? prediction.points : 0
});

const normalizePredictionForSave = (prediction, matchId, userId) => {
  const parseScore = (value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    ...prediction,
    userId,
    matchId,
    homeScore: parseScore(prediction.homeScore),
    awayScore: parseScore(prediction.awayScore),
    scorers: Array.isArray(prediction.scorers) ? prediction.scorers.filter(Boolean) : [],
    status: prediction.status || 'pending',
    points: typeof prediction.points === 'number' ? prediction.points : 0,
    createdAt: prediction.createdAt || null
  };
};

const MatchPredictions = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const userId = user?.uid;

  const [predictions, setPredictions] = useState({});
  const [filters, setFilters] = useState({
    competition: 'all',
    date: 'all',
    status: 'all',
    sort: 'kickoff-asc'
  });
  const [pendingPredictions, setPendingPredictions] = useState({});
  const [savingMatches, setSavingMatches] = useState({});
  const [saveErrors, setSaveErrors] = useState({});
  const [lastSavedMap, setLastSavedMap] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [predictionLoadError, setPredictionLoadError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [matchResults, setMatchResults] = useState({});
  const [loadingResults, setLoadingResults] = useState(false);

  const autoSaveTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const selectedCompetitions = useMemo(() => (
    filters.competition === 'all'
      ? DEFAULT_COMPETITIONS
      : [filters.competition]
  ), [filters.competition]);

  const apiFilters = useMemo(() => ({ competitions: selectedCompetitions }), [selectedCompetitions]);

  const { matches, loading: matchesLoading, error, refetch } = useMatches(apiFilters);

  const showFeedback = useCallback((type, message) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    setFeedback({ type, message });
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setPredictions({});
      setPendingPredictions({});
      setSavingMatches({});
      setSaveErrors({});
      setLastSavedMap({});
      setLoadingPredictions(false);
      setPredictionLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadingPredictions(true);

    getUserPredictions(userId)
      .then((records) => {
        if (cancelled) {
          return;
        }

        const nextPredictions = {};
        const savedMap = {};

        records
          .filter(Boolean)
          .forEach((record) => {
            if (!record.matchId) {
              return;
            }

            const statePrediction = normalizePredictionState(record);
            statePrediction.createdAt = record.createdAt || null;
            statePrediction.updatedAt = record.updatedAt || null;

            nextPredictions[record.matchId] = statePrediction;

            if (record.updatedAt instanceof Date) {
              savedMap[record.matchId] = record.updatedAt.getTime();
            }
          });

        setPredictions(nextPredictions);
        setPendingPredictions({});
        setSavingMatches({});
        setSaveErrors({});
        setLastSavedMap(savedMap);
        setPredictionLoadError(null);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error('Failed to load predictions', err);
        setPredictions({});
        setPredictionLoadError(err?.message || 'Unable to load your predictions.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPredictions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, userId]);

  // Load match results for finished matches
  useEffect(() => {
    let cancelled = false;

    const loadMatchResults = async () => {
      if (!matches || matches.length === 0) {
        return;
      }

      setLoadingResults(true);

      try {
        // Get finished matches (based on status or time passed)
        const now = new Date();
        const finishedMatches = matches.filter(match => {
          const kickoffTime = new Date(match.kickoffTime);
          const timeSinceKickoff = now - kickoffTime;

          // Consider finished if kickoff was more than 2 hours ago
          return timeSinceKickoff > (2 * 60 * 60 * 1000);
        });

        if (finishedMatches.length === 0) {
          if (!cancelled) {
            setMatchResults({});
            setLoadingResults(false);
          }
          return;
        }

        const matchIds = finishedMatches.map(match => match.id);

        // Get cached results first
        const cachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);

        if (!cancelled) {
          const resultsMap = {};
          cachedResults.forEach((result, matchId) => {
            resultsMap[matchId] = result;
          });
          setMatchResults(resultsMap);
        }

        // Check if we need to fetch any new results (limit to avoid API rate limits)
        const uncachedMatches = finishedMatches.filter(match => !cachedResults.has(match.id));

        if (uncachedMatches.length > 0) {
          console.log(`Found ${uncachedMatches.length} matches needing result updates`);

          // Limit concurrent API calls to respect rate limits
          const updateResults = await matchResultService.updateRecentResults({
            maxMatches: Math.min(uncachedMatches.length, 5), // Limit to 5 API calls
            competitions: selectedCompetitions
          });

          console.log('Background result update:', updateResults);

          // Reload cached results after API updates
          if (updateResults.updated > 0) {
            const updatedCachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);

            if (!cancelled) {
              const updatedResultsMap = {};
              updatedCachedResults.forEach((result, matchId) => {
                updatedResultsMap[matchId] = result;
              });
              setMatchResults(updatedResultsMap);
            }
          }
        }
      } catch (error) {
        console.error('Error loading match results:', error);
      } finally {
        if (!cancelled) {
          setLoadingResults(false);
        }
      }
    };

    loadMatchResults();

    return () => {
      cancelled = true;
    };
  }, [matches, selectedCompetitions]);

  const savePredictionsBatch = useCallback(async (batch, { reason = 'auto' } = {}) => {
    if (!userId) {
      return;
    }

    const entries = Object.entries(batch || {}).filter(([, value]) => Boolean(value));

    if (!entries.length) {
      if (reason === 'manual') {
        showFeedback('info', 'No predictions to save.');
      }
      return;
    }

    setSavingMatches((prev) => {
      const next = { ...prev };
      entries.forEach(([matchId]) => {
        next[matchId] = 'saving';
      });
      return next;
    });

    const successes = [];
    const failures = [];

    await Promise.all(entries.map(async ([matchId, draft]) => {
      const { _dirtyKey, ...payload } = draft || {};
      const existing = predictions[matchId] || {};
      const mergedDraft = normalizePredictionState({ ...existing, ...payload });
      const savePayload = normalizePredictionForSave(mergedDraft, matchId, userId);

      try {
        const saved = await savePrediction(userId, matchId, savePayload);
        successes.push({ matchId, draft: mergedDraft, saved, dirtyKey: _dirtyKey });
      } catch (error) {
        console.error(`Failed to save prediction for match ${matchId}`, error);
        failures.push({ matchId, error, dirtyKey: _dirtyKey });
      }
    }));

    if (successes.length) {
      setPredictions((prev) => {
        const next = { ...prev };
        successes.forEach(({ matchId, draft, saved }) => {
          next[matchId] = {
            ...normalizePredictionState({ ...next[matchId], ...draft }),
            matchId,
            userId,
            createdAt: saved?.createdAt || next[matchId]?.createdAt || null,
            updatedAt: saved?.updatedAt || new Date()
          };
        });
        return next;
      });

      setLastSavedMap((prev) => {
        const next = { ...prev };
        successes.forEach(({ matchId, saved }) => {
          next[matchId] = (saved.updatedAt || new Date()).getTime();
        });
        return next;
      });

      setSavingMatches((prev) => {
        const next = { ...prev };
        successes.forEach(({ matchId }) => {
          next[matchId] = 'saved';
        });
        return next;
      });

      setSaveErrors((prev) => {
        const next = { ...prev };
        successes.forEach(({ matchId }) => {
          delete next[matchId];
        });
        return next;
      });

      setPendingPredictions((prev) => {
        const next = { ...prev };
        successes.forEach(({ matchId, dirtyKey }) => {
          const pending = next[matchId];
          if (!pending || dirtyKey === undefined || pending._dirtyKey === dirtyKey) {
            delete next[matchId];
          }
        });
        return next;
      });
    }

    if (failures.length) {
      setSavingMatches((prev) => {
        const next = { ...prev };
        failures.forEach(({ matchId }) => {
          next[matchId] = 'error';
        });
        return next;
      });

      setSaveErrors((prev) => {
        const next = { ...prev };
        failures.forEach(({ matchId, error }) => {
          next[matchId] = error?.message || 'Unable to save prediction.';
        });
        return next;
      });

      if (reason === 'manual') {
        showFeedback('error', 'Some predictions could not be saved. Please try again.');
      }
    } else if (reason === 'manual') {
      showFeedback('success', 'Predictions saved successfully.');
    }
  }, [predictions, showFeedback, userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const pendingKeys = Object.keys(pendingPredictions);

    if (!pendingKeys.length) {
      return undefined;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      savePredictionsBatch(pendingPredictions, { reason: 'auto' });
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [pendingPredictions, userId, savePredictionsBatch]);

  useEffect(() => () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.warn('Football API Error:', error);
    }
  }, [error]);

  const handlePredictionChange = useCallback((matchId, updates) => {
    if (!isAuthenticated || !userId) {
      return;
    }

    setPredictions((prev) => {
      const previous = prev[matchId] || {};
      const nextState = normalizePredictionState({ ...previous, ...updates });

      return {
        ...prev,
        [matchId]: {
          ...previous,
          ...nextState,
          matchId,
          userId,
          status: nextState.status || 'pending'
        }
      };
    });

    setPendingPredictions((prev) => {
      const previousDraft = prev[matchId] || predictions[matchId] || {};
      const nextDraft = normalizePredictionState({ ...previousDraft, ...updates });

      return {
        ...prev,
        [matchId]: {
          ...nextDraft,
          matchId,
          userId,
          status: 'pending',
          points: predictions[matchId]?.points || 0,
          createdAt: predictions[matchId]?.createdAt || null,
          _dirtyKey: Date.now()
        }
      };
    });
  }, [isAuthenticated, userId, predictions]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      competition: 'all',
      date: 'all',
      status: 'all',
      sort: 'kickoff-asc'
    });
  };

  const handleSaveAll = useCallback(() => {
    if (!isAuthenticated || !userId) {
      showFeedback('warning', 'Sign in to save your predictions.');
      return;
    }

    const pendingKeys = Object.keys(pendingPredictions);

    const batch = pendingKeys.length > 0
      ? pendingPredictions
      : Object.fromEntries(
          Object.entries(predictions)
            .filter(([, prediction]) => prediction && (
              prediction.homeScore !== ''
              || prediction.awayScore !== ''
              || (Array.isArray(prediction.scorers) && prediction.scorers.length > 0)
            ))
            .map(([matchId, prediction], index) => ([
              matchId,
              {
                ...prediction,
                _dirtyKey: Date.now() + index
              }
            ]))
        );

    if (!Object.keys(batch).length) {
      showFeedback('info', 'No predictions to save.');
      return;
    }

    savePredictionsBatch(batch, { reason: 'manual' });
  }, [isAuthenticated, userId, pendingPredictions, predictions, savePredictionsBatch, showFeedback]);

  const handleClearAll = () => {
    setConfirmDialog({ isOpen: true });
  };

  const confirmClearAll = useCallback(async () => {
    const entries = Object.entries(predictions).filter(([, prediction]) => isActivePrediction(prediction));

    if (!entries.length) {
      setConfirmDialog({ isOpen: false });
      return;
    }

    try {
      setConfirmDialog({ isOpen: false });
      showFeedback('info', 'Clearing all predictions...');

      // Delete from database using the predictionService
      const deletePromises = entries.map(([matchId]) =>
        predictionService.deletePrediction(userId, matchId)
      );

      await Promise.all(deletePromises);

      // Clear from local state - completely remove the entries
      setPredictions((prev) => {
        const next = { ...prev };
        entries.forEach(([matchId]) => {
          delete next[matchId]; // Completely remove the entry
        });
        return next;
      });

      // Clear from pending predictions too
      setPendingPredictions((prev) => {
        const next = { ...prev };
        entries.forEach(([matchId]) => {
          delete next[matchId]; // Completely remove the entry
        });
        return next;
      });

      showFeedback('success', `${entries.length} predictions cleared successfully.`);
    } catch (error) {
      console.error('Error clearing predictions:', error);
      showFeedback('error', 'Failed to clear predictions. Please try again.');
    }
  }, [predictions, userId, showFeedback]);


  const getFilteredMatches = useCallback(() => {
    let filtered = [...(matches || [])];

    if (filters?.competition !== 'all') {
      filtered = filtered.filter((match) => match?.competitionCode === filters?.competition);
    }

    if (filters?.date !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((match) => {
        const matchDate = new Date(match.kickoffTime);
        switch (filters?.date) {
          case 'today':
            return matchDate >= today && matchDate < tomorrow;
          case 'tomorrow':
            return matchDate >= tomorrow && matchDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
          case 'this-week':
            return matchDate >= today && matchDate < nextWeek;
          case 'next-week':
            return matchDate >= nextWeek && matchDate < new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    if (filters?.status !== 'all') {
      filtered = filtered.filter((match) => {
        const prediction = predictions?.[match?.id];
        const hasPrediction = isActivePrediction(prediction);
        const isDeadlineSoon = new Date(match.kickoffTime) - new Date() <= 2 * 60 * 60 * 1000;
        switch (filters.status) {
          case 'predicted':
            return hasPrediction;
          case 'unpredicted':
            return !hasPrediction;
          case 'deadline-soon':
            return isDeadlineSoon && new Date(match.kickoffTime) > new Date();
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (filters?.sort) {
        case 'kickoff-desc':
          return new Date(b.kickoffTime) - new Date(a.kickoffTime);
        case 'competition':
          return (a?.competition || '').localeCompare(b?.competition || '');
        case 'prediction-status': {
          const aPred = predictions?.[a?.id];
          const bPred = predictions?.[b?.id];
          const aHasPred = isActivePrediction(aPred);
          const bHasPred = isActivePrediction(bPred);
          return Number(bHasPred) - Number(aHasPred);
        }
        case 'kickoff-asc':
        default:
          return new Date(a.kickoffTime) - new Date(b.kickoffTime);
      }
    });

    return filtered;
  }, [filters, matches, predictions]);

  const filteredMatches = useMemo(() => getFilteredMatches(), [getFilteredMatches]);

  const isAuthError = typeof error === 'string' && error.toLowerCase().includes('key');
  const pendingCount = Object.keys(pendingPredictions).length;
  const isSaving = Object.values(savingMatches).some((status) => status === 'saving');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Match Predictions</h1>
              <p className="text-muted-foreground">
                Predict match scores and goal scorers to earn points in your leagues
              </p>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Next Deadline</div>
                <div className="font-semibold text-foreground">
                  {matches?.length > 0 && new Date(matches[0].kickoffTime)?.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {!authLoading && !isAuthenticated && (
            <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Info" size={18} />
                <span>Sign in to save your predictions across devices.</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          )}

          {predictionLoadError && (
            <div className="mb-4 p-4 border border-destructive/40 bg-destructive/10 text-destructive text-sm rounded-lg">
              {predictionLoadError}
            </div>
          )}

          {feedback && (
            <div
              className={`mb-4 p-4 text-sm rounded-lg border ${
                feedback.type === 'success' ? 'border-success/40 bg-success/10 text-success'
                  : feedback.type === 'error' ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : feedback.type === 'warning' ? 'border-warning/40 bg-warning/10 text-warning'
                  : 'border-primary/40 bg-primary/10 text-primary'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {Object.keys(saveErrors).length > 0 && (
            <div className="mb-4 p-4 border border-destructive/40 bg-destructive/10 text-destructive text-sm rounded-lg">
              Some predictions failed to save. Please try again using the Save Pending button.
            </div>
          )}

          <PredictionSummary
            predictions={predictions}
            matches={matches}
            onClearAll={handleClearAll}
            onSaveAll={handleSaveAll}
            pendingCount={pendingCount}
            isSaving={isSaving}
            loading={loadingPredictions && isAuthenticated}
          />

          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {error && (
            <div className="text-center py-12 bg-destructive/10 rounded-lg border border-destructive/20 mb-6">
              <Icon name="AlertCircle" size={48} className="mx-auto text-destructive mb-4" />
              <h3 className="font-semibold text-foreground mb-2">API Connection Error</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {isAuthError
                  ? 'Please check your .env.local file and make sure VITE_THESPORTSDB_API_KEY is set if you are using a private key.'
                  : 'Failed to load match data. Please check your internet connection and try again.'}
              </p>
              <Button variant="outline" onClick={refetch}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {!error && filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Matches Found</h3>
              <p className="text-muted-foreground mb-4">
                {matchesLoading ? 'Loading matches...' : 'Try adjusting your filters to see more matches'}
              </p>
              {!matchesLoading && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMatches.map((match) => {
                const matchResult = matchResults[match?.id];
                const hasResult = Boolean(matchResult?.finalScore);
                const now = new Date();
                const kickoffTime = new Date(match.kickoffTime);
                const isFinished = (now - kickoffTime) > (2 * 60 * 60 * 1000); // 2 hours after kickoff

                return (
                  <MatchCard
                    key={match?.id}
                    match={match}
                    onPredictionChange={handlePredictionChange}
                    userPrediction={predictions?.[match?.id]}
                    canEdit={isAuthenticated}
                    savingState={savingMatches?.[match?.id]}
                    lastSavedAt={lastSavedMap?.[match?.id]}
                    saveError={saveErrors?.[match?.id]}
                    matchResult={matchResult}
                    showResult={isFinished && hasResult}
                  />
                );
              })}
            </div>
          )}

          <div className="lg:hidden fixed bottom-20 right-4 z-40">
            <Button
              variant="default"
              size="lg"
              onClick={handleSaveAll}
              iconName={isSaving ? 'Loader2' : 'Save'}
              iconPosition="left"
              className="rounded-full shadow-elevation-2"
              disabled={isSaving || pendingCount === 0}
            >
              {isSaving ? 'Saving...' : 'Save Pending'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog?.isOpen}
        type="clear-all"
        data={null}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmClearAll}
      />
    </>
  );
};

export default MatchPredictions;