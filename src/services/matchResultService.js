import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// TheSportsDB API Configuration
const SPORTS_DB_API = {
  BASE_URL: 'https://www.thesportsdb.com/api/v2/json',
  API_KEY: '123', // Free API key for testing
  ENDPOINTS: {
    LIVESCORES_SOCCER: '/livescore/soccer',
    LIVESCORES_LEAGUE: '/livescore',
    PREVIOUS_MATCHES: '/schedule/previous/league',
    NEXT_MATCHES: '/schedule/next/league'
  }
};

// League ID mappings for TheSportsDB
const LEAGUE_MAPPINGS = {
  'champions-league': '4480',
  'premier-league': '4328',
  'la-liga': '4335',
  'bundesliga': '4331',
  'serie-a': '4332',
  'turkish-super-league': '4357'
};

/**
 * Fetch live scores from TheSportsDB API
 * @param {string} leagueId - League identifier (optional)
 */
export const fetchLiveScores = async (leagueId = null) => {
  try {
    let url = `${SPORTS_DB_API.BASE_URL}${SPORTS_DB_API.ENDPOINTS.LIVESCORES_SOCCER}`;

    if (leagueId && LEAGUE_MAPPINGS[leagueId]) {
      url = `${SPORTS_DB_API.BASE_URL}${SPORTS_DB_API.ENDPOINTS.LIVESCORES_LEAGUE}/${LEAGUE_MAPPINGS[leagueId]}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': SPORTS_DB_API.API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching live scores:', error);
    throw error;
  }
};

/**
 * Fetch completed matches from TheSportsDB API
 * @param {string} leagueId - League identifier
 */
export const fetchCompletedMatches = async (leagueId) => {
  try {
    if (!LEAGUE_MAPPINGS[leagueId]) {
      throw new Error(`Unsupported league: ${leagueId}`);
    }

    const url = `${SPORTS_DB_API.BASE_URL}${SPORTS_DB_API.ENDPOINTS.PREVIOUS_MATCHES}/${LEAGUE_MAPPINGS[leagueId]}`;

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': SPORTS_DB_API.API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching completed matches:', error);
    throw error;
  }
};

/**
 * Normalize match data from TheSportsDB to our format
 * @param {Object} apiMatch - Match data from API
 */
export const normalizeMatchData = (apiMatch) => {
  return {
    externalId: apiMatch.idEvent,
    homeTeam: apiMatch.strHomeTeam,
    awayTeam: apiMatch.strAwayTeam,
    homeScore: parseInt(apiMatch.intHomeScore) || 0,
    awayScore: parseInt(apiMatch.intAwayScore) || 0,
    status: apiMatch.strStatus,
    date: apiMatch.dateEvent,
    time: apiMatch.strTime,
    league: apiMatch.strLeague,
    season: apiMatch.strSeason,
    round: apiMatch.intRound,
    isCompleted: apiMatch.strStatus === 'Match Finished' || apiMatch.strStatus === 'FT',
    venue: apiMatch.strVenue
  };
};

/**
 * Update match results in Firestore
 * @param {string} matchId - Match document ID
 * @param {Object} resultData - Match result data
 */
export const updateMatchResult = async (matchId, resultData) => {
  try {
    const matchRef = doc(db, 'matches', matchId);

    await updateDoc(matchRef, {
      homeScore: resultData.homeScore,
      awayScore: resultData.awayScore,
      status: resultData.status,
      isCompleted: resultData.isCompleted,
      resultUpdatedAt: serverTimestamp(),
      externalId: resultData.externalId
    });

    console.log(`Match ${matchId} result updated:`, resultData);
    return true;
  } catch (error) {
    console.error('Error updating match result:', error);
    throw error;
  }
};

/**
 * Find matching Firestore match for API match data
 * @param {Object} apiMatch - Normalized match data from API
 * @param {Array} firestoreMatches - Array of Firestore match documents
 */
export const findMatchingFirestoreMatch = (apiMatch, firestoreMatches) => {
  return firestoreMatches.find(match => {
    // Try to match by external ID first
    if (match.externalId && match.externalId === apiMatch.externalId) {
      return true;
    }

    // Fall back to team name and date matching
    const homeTeamMatch = match.homeTeam?.toLowerCase().includes(apiMatch.homeTeam?.toLowerCase()) ||
                         apiMatch.homeTeam?.toLowerCase().includes(match.homeTeam?.toLowerCase());

    const awayTeamMatch = match.awayTeam?.toLowerCase().includes(apiMatch.awayTeam?.toLowerCase()) ||
                         apiMatch.awayTeam?.toLowerCase().includes(match.awayTeam?.toLowerCase());

    const dateMatch = match.date === apiMatch.date;

    return homeTeamMatch && awayTeamMatch && dateMatch;
  });
};

/**
 * Fetch pending matches from Firestore (matches without results)
 * @param {string} leagueId - League identifier (optional)
 */
export const fetchPendingMatches = async (leagueId = null) => {
  try {
    const matchesRef = collection(db, 'matches');
    let q;

    if (leagueId) {
      q = query(
        matchesRef,
        where('league', '==', leagueId),
        where('isCompleted', '==', false)
      );
    } else {
      q = query(matchesRef, where('isCompleted', '==', false));
    }

    const querySnapshot = await getDocs(q);
    const matches = [];

    querySnapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return matches;
  } catch (error) {
    console.error('Error fetching pending matches:', error);
    throw error;
  }
};

/**
 * Main function to check and update match results
 * @param {string} leagueId - League identifier (optional)
 */
export const checkAndUpdateMatchResults = async (leagueId = null) => {
  try {
    console.log('Starting match result check...', leagueId ? `for league: ${leagueId}` : 'for all leagues');

    // Get pending matches from Firestore
    const pendingMatches = await fetchPendingMatches(leagueId);

    if (pendingMatches.length === 0) {
      console.log('No pending matches found');
      return { updated: 0, errors: 0 };
    }

    console.log(`Found ${pendingMatches.length} pending matches`);

    // Get completed matches from API
    let apiMatches = [];

    if (leagueId) {
      apiMatches = await fetchCompletedMatches(leagueId);
    } else {
      // Fetch for all supported leagues
      for (const league of Object.keys(LEAGUE_MAPPINGS)) {
        try {
          const leagueMatches = await fetchCompletedMatches(league);
          apiMatches = [...apiMatches, ...leagueMatches];
        } catch (error) {
          console.error(`Error fetching matches for league ${league}:`, error);
        }
      }
    }

    console.log(`Found ${apiMatches.length} completed matches from API`);

    // Normalize API match data
    const normalizedMatches = apiMatches.map(normalizeMatchData);

    // Match and update results
    let updated = 0;
    let errors = 0;

    for (const firestoreMatch of pendingMatches) {
      try {
        const matchingApiMatch = findMatchingFirestoreMatch(firestoreMatch, normalizedMatches);

        if (matchingApiMatch && matchingApiMatch.isCompleted) {
          await updateMatchResult(firestoreMatch.id, {
            homeScore: matchingApiMatch.homeScore,
            awayScore: matchingApiMatch.awayScore,
            status: matchingApiMatch.status,
            isCompleted: true,
            externalId: matchingApiMatch.externalId
          });

          updated++;
          console.log(`Updated match: ${firestoreMatch.homeTeam} vs ${firestoreMatch.awayTeam}`);
        }
      } catch (error) {
        console.error(`Error updating match ${firestoreMatch.id}:`, error);
        errors++;
      }
    }

    console.log(`Match result check completed. Updated: ${updated}, Errors: ${errors}`);

    return { updated, errors, totalPending: pendingMatches.length };
  } catch (error) {
    console.error('Error in checkAndUpdateMatchResults:', error);
    throw error;
  }
};

/**
 * Get live match updates for display
 * @param {string} leagueId - League identifier (optional)
 */
export const getLiveMatchUpdates = async (leagueId = null) => {
  try {
    const liveScores = await fetchLiveScores(leagueId);
    return liveScores.map(normalizeMatchData);
  } catch (error) {
    console.error('Error getting live match updates:', error);
    throw error;
  }
};