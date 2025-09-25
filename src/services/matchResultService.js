import { footballApi } from './footballApi';
import { matchResultCacheService } from './matchResultCacheService';
import { processMatchResult } from './scoringService';

export const matchResultService = {
  /**
   * Fetch match result with caching and API optimization
   */
  async fetchMatchResult(matchId, options = {}) {
    try {
      if (!matchId) {
        throw new Error('Match ID is required');
      }

      const { forceRefresh = false } = options;

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cached = await matchResultCacheService.getCachedResult(matchId);
        if (cached) {
          console.log('Using cached result for match:', matchId);
          return cached;
        }
      }

      // Fetch from API
      console.log('Fetching result from API for match:', matchId);
      const result = await footballApi.getEventResult(matchId);

      if (!result) {
        console.log('No result found for match:', matchId);
        return null;
      }

      // Cache the result
      const cachedResult = await matchResultCacheService.cacheMatchResult(matchId, result);

      return cachedResult;
    } catch (error) {
      console.error('Error fetching match result:', error);

      // Try to return cached result as fallback
      const cached = await matchResultCacheService.getCachedResult(matchId);
      if (cached) {
        console.log('Using cached result as fallback for match:', matchId);
        return cached;
      }

      throw error;
    }
  },

  /**
   * Fetch multiple match results efficiently
   */
  async fetchMultipleResults(matchIds, options = {}) {
    try {
      if (!Array.isArray(matchIds) || matchIds.length === 0) {
        return new Map();
      }

      const { forceRefresh = false, maxApiCalls = 5 } = options;
      const results = new Map();

      // Get cached results first
      if (!forceRefresh) {
        const cachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);
        cachedResults.forEach((result, matchId) => {
          results.set(matchId, result);
        });
      }

      // Find matches that need API calls
      const uncachedMatchIds = matchIds.filter(id => !results.has(id));

      if (uncachedMatchIds.length === 0) {
        console.log('All results found in cache');
        return results;
      }

      // Limit API calls to avoid hitting rate limits
      const apiCallIds = uncachedMatchIds.slice(0, maxApiCalls);

      if (apiCallIds.length < uncachedMatchIds.length) {
        console.warn(`Limited API calls to ${maxApiCalls} out of ${uncachedMatchIds.length} needed`);
      }

      // Fetch from API in sequence to respect rate limits
      for (const matchId of apiCallIds) {
        try {
          const result = await this.fetchMatchResult(matchId, { forceRefresh: true });
          if (result) {
            results.set(matchId, result);
          }

          // Add delay between API calls to respect rate limits (30 calls/minute = 2 seconds)
          if (apiCallIds.indexOf(matchId) < apiCallIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2100));
          }
        } catch (error) {
          console.error(`Failed to fetch result for match ${matchId}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching multiple results:', error);
      return new Map();
    }
  },

  /**
   * Process match results and update predictions
   */
  async processAndScoreMatches(matchIds) {
    try {
      const results = await this.fetchMultipleResults(matchIds);
      const processedCount = { total: 0, success: 0, errors: 0 };

      for (const [matchId, result] of results) {
        processedCount.total++;

        try {
          if (result && result.finalScore) {
            await processMatchResult(matchId, result);
            processedCount.success++;
            console.log(`Processed and scored match: ${matchId}`);
          }
        } catch (error) {
          processedCount.errors++;
          console.error(`Error processing match ${matchId}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing and scoring matches:', error);
      return { total: 0, success: 0, errors: 1 };
    }
  },

  /**
   * Get finished matches that need result processing
   */
  async getFinishedMatchesNeedingResults(filters = {}) {
    try {
      const finishedMatches = await footballApi.getFinishedMatches({
        competitions: filters.competitions,
        limit: filters.limit || 20
      });

      // Filter out matches that already have cached results
      const matchIds = finishedMatches.map(match => match.id);
      const cachedResults = await matchResultCacheService.getCachedResultsForMatches(matchIds);

      const matchesNeedingResults = finishedMatches.filter(match => {
        return !cachedResults.has(match.id);
      });

      return matchesNeedingResults;
    } catch (error) {
      console.error('Error getting finished matches needing results:', error);
      return [];
    }
  },

  /**
   * Background job to update recent match results
   */
  async updateRecentResults(options = {}) {
    try {
      const { maxMatches = 10, competitions = ['turkish-super-league'] } = options;

      console.log('Starting background result update...');

      const matchesNeedingResults = await this.getFinishedMatchesNeedingResults({
        competitions,
        limit: maxMatches
      });

      if (matchesNeedingResults.length === 0) {
        console.log('No matches need result updates');
        return { updated: 0, processed: 0 };
      }

      console.log(`Found ${matchesNeedingResults.length} matches needing results`);

      const matchIds = matchesNeedingResults.map(match => match.id);
      const processedCount = await this.processAndScoreMatches(matchIds);

      console.log('Background result update completed:', processedCount);

      return {
        updated: processedCount.success,
        processed: processedCount.total,
        errors: processedCount.errors
      };
    } catch (error) {
      console.error('Error in background result update:', error);
      return { updated: 0, processed: 0, errors: 1 };
    }
  }
};

export default matchResultService;