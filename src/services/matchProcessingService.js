import { checkAndUpdateMatchResults } from './matchResultService';
import { processCompletedMatches } from './predictionScoringService';
import { updateUserLeaderboard } from './leaderboardService';

/**
 * Master service to process match results and update predictions
 * This should be called periodically (e.g., every 30 minutes)
 */

/**
 * Process all match updates and scoring
 * @param {Object} options - Processing options
 */
export const processMatchUpdates = async (options = {}) => {
  const {
    leagueId = null,
    updateLeaderboards = true,
    verbose = true
  } = options;

  const results = {
    matchesUpdated: 0,
    predictionsScored: 0,
    leaderboardsUpdated: 0,
    errors: [],
    processedAt: new Date().toISOString()
  };

  try {
    if (verbose) console.log('🔄 Starting match processing...', { leagueId });

    // Step 1: Check and update match results from TheSportsDB API
    if (verbose) console.log('📊 Checking match results...');

    const matchUpdateResult = await checkAndUpdateMatchResults(leagueId);
    results.matchesUpdated = matchUpdateResult.updated;

    if (verbose) {
      console.log(`✅ Match results updated: ${matchUpdateResult.updated} matches`);
    }

    // Step 2: Score predictions for completed matches
    if (verbose) console.log('🎯 Scoring predictions...');

    const scoringResult = await processCompletedMatches();
    results.predictionsScored = scoringResult.totalScored;

    if (verbose) {
      console.log(`✅ Predictions scored: ${scoringResult.totalScored} predictions`);
    }

    // Step 3: Update user leaderboards (if enabled)
    if (updateLeaderboards && (results.matchesUpdated > 0 || results.predictionsScored > 0)) {
      if (verbose) console.log('🏆 Updating leaderboards...');

      try {
        // This would need to be implemented based on your leaderboard logic
        // For now, we'll just log that it should be done
        console.log('📝 Note: Leaderboard update should be implemented');
        results.leaderboardsUpdated = 0;
      } catch (leaderboardError) {
        console.error('Error updating leaderboards:', leaderboardError);
        results.errors.push({
          type: 'leaderboard_update',
          error: leaderboardError.message
        });
      }
    }

    if (verbose) {
      console.log('✅ Match processing completed', {
        matchesUpdated: results.matchesUpdated,
        predictionsScored: results.predictionsScored,
        leaderboardsUpdated: results.leaderboardsUpdated,
        errors: results.errors.length
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Error in match processing:', error);
    results.errors.push({
      type: 'general_error',
      error: error.message
    });

    throw error;
  }
};

/**
 * Process matches for a specific league
 * @param {string} leagueId - League identifier
 */
export const processLeagueMatches = async (leagueId) => {
  return await processMatchUpdates({ leagueId, verbose: true });
};

/**
 * Process all leagues
 */
export const processAllLeagues = async () => {
  const supportedLeagues = [
    'champions-league',
    'premier-league',
    'la-liga',
    'bundesliga',
    'serie-a',
    'turkish-super-league'
  ];

  const results = [];

  for (const leagueId of supportedLeagues) {
    try {
      console.log(`🏆 Processing league: ${leagueId}`);
      const result = await processLeagueMatches(leagueId);
      results.push({ leagueId, ...result });
    } catch (error) {
      console.error(`❌ Error processing league ${leagueId}:`, error);
      results.push({
        leagueId,
        error: error.message,
        matchesUpdated: 0,
        predictionsScored: 0,
        leaderboardsUpdated: 0
      });
    }

    // Add delay between leagues to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
};

/**
 * Quick match result check (for manual triggers)
 */
export const quickMatchCheck = async () => {
  console.log('🚀 Quick match check started...');

  const result = await processMatchUpdates({
    leagueId: null,
    updateLeaderboards: false,
    verbose: true
  });

  return result;
};

/**
 * Get processing status/summary
 */
export const getProcessingStatus = () => {
  return {
    lastRun: localStorage.getItem('lastMatchProcessing'),
    nextScheduledRun: 'Manual trigger only', // Would be actual timestamp in production
    supportedLeagues: [
      'Champions League',
      'Premier League',
      'La Liga',
      'Bundesliga',
      'Serie A',
      'Turkish Super League'
    ],
    processingInterval: '30 minutes (recommended)',
    apiProvider: 'TheSportsDB.com'
  };
};

/**
 * Manual trigger for admin panel
 */
export const triggerManualProcessing = async () => {
  try {
    // Store processing start time
    localStorage.setItem('lastMatchProcessing', new Date().toISOString());

    const result = await processAllLeagues();

    // Store completion time
    localStorage.setItem('lastMatchProcessingCompleted', new Date().toISOString());

    return {
      success: true,
      results: result,
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      failedAt: new Date().toISOString()
    };
  }
};

export default {
  processMatchUpdates,
  processLeagueMatches,
  processAllLeagues,
  quickMatchCheck,
  getProcessingStatus,
  triggerManualProcessing
};