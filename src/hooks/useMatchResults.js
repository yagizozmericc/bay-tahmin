import { useState, useEffect, useCallback } from 'react';
import { matchResultService } from '../services/matchResultService';
import { matchResultCacheService } from '../services/matchResultCacheService';

export const useMatchResults = (matches = [], options = {}) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { autoUpdate = true, competitions = ['turkish-super-league'] } = options;

  const loadResults = useCallback(async (forceRefresh = false) => {
    if (!matches || matches.length === 0) {
      setResults({});
      return;
    }

    setLoading(true);
    setError(null);

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
        setResults({});
        return;
      }

      const matchIds = finishedMatches.map(match => match.id);

      if (forceRefresh) {
        // Force refresh from API
        const refreshedResults = await matchResultService.fetchMultipleResults(matchIds, {
          forceRefresh: true,
          maxApiCalls: 5
        });

        const resultsMap = {};
        refreshedResults.forEach((result, matchId) => {
          resultsMap[matchId] = result;
        });
        setResults(resultsMap);
      } else {
        // Get cached results first
        const cachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);

        const resultsMap = {};
        cachedResults.forEach((result, matchId) => {
          resultsMap[matchId] = result;
        });
        setResults(resultsMap);

        // Check if we need to fetch any new results (limit to avoid API rate limits)
        const uncachedMatches = finishedMatches.filter(match => !cachedResults.has(match.id));

        if (uncachedMatches.length > 0 && autoUpdate) {
          console.log(`Found ${uncachedMatches.length} matches needing result updates`);

          // Background update without blocking UI
          matchResultService.updateRecentResults({
            maxMatches: Math.min(uncachedMatches.length, 5),
            competitions
          }).then(async (updateResults) => {
            console.log('Background result update:', updateResults);

            if (updateResults.updated > 0) {
              // Reload cached results after API updates
              const updatedCachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);

              const updatedResultsMap = {};
              updatedCachedResults.forEach((result, matchId) => {
                updatedResultsMap[matchId] = result;
              });
              setResults(updatedResultsMap);
            }
          }).catch(err => {
            console.error('Background result update failed:', err);
          });
        }
      }
    } catch (err) {
      console.error('Error loading match results:', err);
      setError(err.message || 'Failed to load match results');
    } finally {
      setLoading(false);
    }
  }, [matches, autoUpdate, competitions]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const refreshResults = useCallback(() => {
    return loadResults(true);
  }, [loadResults]);

  const getResult = useCallback((matchId) => {
    return results[matchId] || null;
  }, [results]);

  const hasResult = useCallback((matchId) => {
    const result = results[matchId];
    return Boolean(result?.finalScore);
  }, [results]);

  const isMatchFinished = useCallback((match) => {
    if (!match) return false;

    const now = new Date();
    const kickoffTime = new Date(match.kickoffTime);
    const timeSinceKickoff = now - kickoffTime;

    return timeSinceKickoff > (2 * 60 * 60 * 1000);
  }, []);

  return {
    results,
    loading,
    error,
    refreshResults,
    getResult,
    hasResult,
    isMatchFinished
  };
};

export default useMatchResults;