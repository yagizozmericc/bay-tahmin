const env = import.meta.env || {};

const RAW_BASE_URL = env.VITE_THESPORTSDB_API_URL || 'https://www.thesportsdb.com/api/v1/json';
const BASE_URL = RAW_BASE_URL.replace(/\/$/, '');
const API_KEY = env.VITE_THESPORTSDB_API_KEY || '3';
const API_URL = `${BASE_URL}/${API_KEY}`;

const FALLBACK_BADGE = '/assets/images/no_image.png';

const LEAGUES = {
  'turkish-super-league': {
    id: '4339',
    slug: 'turkish-super-league',
    name: 'Turkish Super Lig',
    country: 'Turkey',
    aliases: ['Turkish Super Lig', 'Turkish Super League', 'Super Lig', 'Turkiye Super Lig', 'TrendYol Super Lig', 'Spor Toto Super Lig']
  },
  'champions-league': {
    id: '4480',
    slug: 'champions-league',
    name: 'UEFA Champions League',
    country: 'Europe',
    aliases: ['UEFA Champions League', 'Champions League', 'UEFA Champions League Qualifying', 'UEFA Champions League Group Stage']
  }
};

const DEFAULT_COMPETITIONS = Object.keys(LEAGUES);

const ensureLeadingSlash = (endpoint) => (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

const hasTimezone = (value) => /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

const parseKickoffTime = (event) => {
  if (!event) {
    return null;
  }

  const candidates = [];

  if (event.strTimestamp) {
    candidates.push(event.strTimestamp.trim());
  }

  if (event.dateEvent && event.strTime) {
    candidates.push(`${event.dateEvent}T${event.strTime}`);
    candidates.push(`${event.dateEvent} ${event.strTime}`);
  }

  if (event.dateEvent) {
    candidates.push(`${event.dateEvent}T00:00:00`);
  }

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const sanitized = candidate.replace(' ', 'T');
    const isoCandidate = hasTimezone(sanitized) ? sanitized : `${sanitized}Z`;
    const parsed = new Date(isoCandidate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
};

const normalizeStatus = (status) => {
  if (!status) {
    return 'SCHEDULED';
  }

  const normalized = status.trim().toUpperCase();

  if (['NOT STARTED', 'NS', 'SCHEDULED'].includes(normalized)) {
    return 'SCHEDULED';
  }

  if (['FINISHED', 'FT', 'FULL TIME'].includes(normalized)) {
    return 'FINISHED';
  }

  if (['POSTPONED', 'PP'].includes(normalized)) {
    return 'POSTPONED';
  }

  return normalized;
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const buildLeagueNames = (league) => {
  if (!league) {
    return [];
  }

  const names = [league.name, ...(league.aliases || [])];
  return names.map(normalizeText).filter(Boolean);
};

const eventMatchesLeague = (event, league) => {
  if (!event || !league) {
    return false;
  }

  if (event.idLeague && String(event.idLeague) === String(league.id)) {
    return true;
  }

  const leagueNames = buildLeagueNames(league);
  const eventNames = [
    event.strLeague,
    event.strLeagueAlternate
  ].map(normalizeText);

  if (leagueNames.length && eventNames.some((value) => value && leagueNames.some((name) => value.includes(name)))) {
    return true;
  }

  const eventCountry = normalizeText(event.strCountry);
  const leagueCountry = normalizeText(league.country);
  if (eventCountry && leagueCountry && eventCountry === leagueCountry) {
    return true;
  }

  // TheSportsDB free tier sometimes returns mismatched league metadata; reject mismatched events.
  return false;
};

const mapEventToMatch = (event, league) => {
  if (!event || !league) {
    return null;
  }

  const kickoffTime = parseKickoffTime(event);

  if (!kickoffTime) {
    return null;
  }

  const rawCompetitionName = (event.strLeague || event.strLeagueAlternate || '').trim();
  const normalizedCompetition = normalizeText(rawCompetitionName);
  const leagueNames = buildLeagueNames(league);
  const hasMatchingName = normalizedCompetition && leagueNames.some((name) => normalizedCompetition.includes(name));
  const competitionName = hasMatchingName ? rawCompetitionName : (league?.name || rawCompetitionName || '');

  return {
    id: event.idEvent,
    leagueId: event.idLeague || league.id,
    competition: competitionName || league.name,
    competitionCode: league.slug,
    competitionCountry: league.country,
    kickoffTime,
    venue: event.strVenue || 'TBD',
    status: normalizeStatus(event.strStatus),
    matchday: event.intRound ? Number(event.intRound) : null,
    stage: event.strStage || event.strSeason || null,
    season: event.strSeason || null,
    homeTeam: {
      id: event.idHomeTeam,
      name: event.strHomeTeam,
      shortName: event.strHomeTeamShort || event.strHomeTeam,
      logo: event.strHomeTeamBadge || event.strHomeTeamLogo || FALLBACK_BADGE
    },
    awayTeam: {
      id: event.idAwayTeam,
      name: event.strAwayTeam,
      shortName: event.strAwayTeamShort || event.strAwayTeam,
      logo: event.strAwayTeamBadge || event.strAwayTeamLogo || FALLBACK_BADGE
    },
    metadata: {
      rawDate: event.dateEvent || null,
      rawTime: event.strTime || null,
      timestamp: event.strTimestamp || null
    }
  };
};

const parseDateFilter = (value, endOfDay = false) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && !value.includes('T')) {
    const suffix = endOfDay ? 'T23:59:59Z' : 'T00:00:00Z';
    const candidate = `${value}${suffix}`;
    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getCurrentSeasonIdentifier = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const seasonStartYear = now.getUTCMonth() >= 6 ? year : year - 1;
  return `${seasonStartYear}-${seasonStartYear + 1}`;
};

const sanitizeSeason = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getPreviousSeasonIdentifier = (season) => {
  const sanitized = sanitizeSeason(season);

  if (!sanitized || !sanitized.includes('-')) {
    return null;
  }

  const [start] = sanitized.split('-');
  const startYear = Number(start);

  if (Number.isNaN(startYear)) {
    return null;
  }

  return `${startYear - 1}-${startYear}`;
};
class FootballApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.leagueSeasonCache = new Map();
  }

  async getSeasonCandidates(league, seasonOverride) {
    const candidates = new Set();
    const addSeason = (value, includePrevious = false) => {
      const sanitized = sanitizeSeason(value);

      if (!sanitized) {
        return;
      }

      if (!candidates.has(sanitized)) {
        candidates.add(sanitized);
      }

      if (includePrevious) {
        const previous = getPreviousSeasonIdentifier(sanitized);

        if (previous && !candidates.has(previous)) {
          candidates.add(previous);
        }
      }
    };

    if (seasonOverride) {
      addSeason(seasonOverride, true);
    }

    if (Array.isArray(league?.seasonHints)) {
      league.seasonHints.forEach((hint) => addSeason(hint, true));
    }

    if (this.leagueSeasonCache.has(league.id)) {
      const cachedSeason = this.leagueSeasonCache.get(league.id);
      if (cachedSeason) {
        addSeason(cachedSeason, true);
      }
    } else {
      try {
        const lookup = await this.request(`/lookupleague.php?id=${league.id}`, {}, 1);
        const leagueData = Array.isArray(lookup?.leagues) ? lookup.leagues[0] : null;
        const currentSeason = sanitizeSeason(leagueData?.strCurrentSeason);

        if (currentSeason) {
          this.leagueSeasonCache.set(league.id, currentSeason);
          addSeason(currentSeason, true);
        } else {
          this.leagueSeasonCache.set(league.id, null);
        }
      } catch (error) {
        console.warn(`[footballApi] League lookup failed for ${league.slug}:`, error.message);
        this.leagueSeasonCache.set(league.id, null);
      }
    }

    const derivedSeason = getCurrentSeasonIdentifier();
    addSeason(derivedSeason, true);

    if (candidates.size === 0) {
      return [derivedSeason];
    }

    return Array.from(candidates);
  }
  async request(endpoint, options = {}, retries = 3) {
    const url = `${this.baseURL}${ensureLeadingSlash(endpoint)}`;
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`API request attempt ${attempt}/${retries}: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, {
          method: 'GET',
          ...options,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Football-Predictions-App/1.0',
            ...(options.headers || {})
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');

          if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
          }

          if (response.status >= 500) {
            throw new Error('TheSportsDB service is temporarily unavailable.');
          }

          throw new Error(
            `TheSportsDB request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
          );
        }

        const data = await response.json();

        if (data?.error) {
          throw new Error(data.error);
        }

        console.log(`API request successful on attempt ${attempt}`);
        return data;

      } catch (error) {
        lastError = error;

        console.error(`API request attempt ${attempt} failed:`, error.message);

        if (error.name === 'AbortError') {
          lastError = new Error('API request timed out. Please check your connection.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          lastError = new Error('Network error while contacting TheSportsDB. Please check your internet connection.');
        }

        // Don't retry on rate limit or client errors
        if (error.message.includes('rate limit') || (error.message.includes('failed:') && error.message.includes('4'))) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`API request failed after ${retries} attempts. Last error: ${lastError.message}`);
  }

  async getMatches(filters = {}) {
    const competitions = Array.isArray(filters.competitions) && filters.competitions.length
      ? filters.competitions
      : DEFAULT_COMPETITIONS;

    const matchMap = new Map();

    for (const slug of competitions) {
      const league = LEAGUES[slug];

      if (!league) {
        console.warn(`[footballApi] Unknown competition slug "${slug}" skipped.`);
        continue;
      }

      const response = await this.request(`/eventsnextleague.php?id=${league.id}`);
      const events = Array.isArray(response?.events) ? response.events : [];
      let validEvents = events.filter((event) => eventMatchesLeague(event, league));

      if (!validEvents.length) {
        const season = filters.season || getCurrentSeasonIdentifier();
        try {
          const seasonResponse = await this.request(`/eventsseason.php?id=${league.id}&s=${season}`);
          const seasonEvents = Array.isArray(seasonResponse?.events) ? seasonResponse.events : [];
          validEvents = seasonEvents.filter((event) => eventMatchesLeague(event, league));
        } catch (seasonError) {
          console.warn(`[footballApi] Failed to load season schedule for ${league.slug}:`, seasonError.message);
        }
      }

      validEvents.forEach((event) => {
        const match = mapEventToMatch(event, league);

        if (match) {
          matchMap.set(match.id, match);
        }
      });
    }

    let matches = Array.from(matchMap.values());

    const from = parseDateFilter(filters.dateFrom);
    const to = parseDateFilter(filters.dateTo, true);

    if (from) {
      matches = matches.filter((match) => new Date(match.kickoffTime) >= from);
    }

    if (to) {
      matches = matches.filter((match) => new Date(match.kickoffTime) <= to);
    }

    matches.sort((a, b) => new Date(a.kickoffTime) - new Date(b.kickoffTime));

    return matches;
  }

  async getCompetitions() {
    try {
      const response = await this.request('/search_all_leagues.php?s=Soccer');
      const leagues = Array.isArray(response?.countries) ? response.countries : [];

      return leagues.filter((league) => (
        league?.idLeague && Object.values(LEAGUES).some((entry) => entry.id === league.idLeague)
      ));
    } catch (error) {
      console.warn('TheSportsDB competitions not available:', error.message);

      return DEFAULT_COMPETITIONS.map((slug) => {
        const league = LEAGUES[slug];
        return {
          id: league.id,
          name: league.name,
          slug: league.slug
        };
      });
    }
  }

  async getLiveMatches() {
    console.warn('Live matches are not available on TheSportsDB free tier.');
    return [];
  }

  async getFinishedMatches(filters = {}) {
    const competitions = Array.isArray(filters.competitions) && filters.competitions.length
      ? filters.competitions
      : DEFAULT_COMPETITIONS;

    const limit = typeof filters.limit === 'number' ? Math.max(filters.limit, 0) : null;
    const results = [];

    for (const slug of competitions) {
      const league = LEAGUES[slug];

      if (!league) {
        continue;
      }

      const seasonCandidates = await this.getSeasonCandidates(league, filters.season);

      for (const season of seasonCandidates) {
        if (!season) {
          continue;
        }

        const response = await this.request(`/eventsseason.php?id=${league.id}&s=${encodeURIComponent(season)}`);
        const events = Array.isArray(response?.events) ? response.events : [];

        if (!events.length) {
          continue;
        }

        const finishedMatches = events
          .filter((event) => eventMatchesLeague(event, league))
          .map((event) => {
            const hasScores = event.intHomeScore !== null && event.intHomeScore !== '' &&
              event.intAwayScore !== null && event.intAwayScore !== '';

            if (!hasScores) {
              return null;
            }

            const match = mapEventToMatch(event, league);

            if (!match) {
              return null;
            }

            const homeScore = Number(event.intHomeScore);
            const awayScore = Number(event.intAwayScore);

            if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
              return null;
            }

            return {
              ...match,
              status: 'FINISHED',
              finalScore: {
                home: homeScore,
                away: awayScore
              },
              // Keep the old format for backwards compatibility
              score: {
                home: homeScore,
                away: awayScore
              }
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.kickoffTime) - new Date(a.kickoffTime));

        if (!finishedMatches.length) {
          continue;
        }

        if (limit) {
          const remaining = limit - results.length;

          if (remaining <= 0) {
            break;
          }

          results.push(...finishedMatches.slice(0, remaining));
        } else {
          results.push(...finishedMatches);
        }

        if (!limit || results.length >= limit) {
          break;
        }
      }

      if (limit && results.length >= limit) {
        break;
      }
    }

    results.sort((a, b) => new Date(b.kickoffTime) - new Date(a.kickoffTime));

    if (limit) {
      return results.slice(0, limit);
    }

    return results;
  }
  async getEventResult(eventId) {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await this.request(`/eventresults.php?id=${eventId}`);

      if (!response?.events || !Array.isArray(response.events) || response.events.length === 0) {
        return null;
      }

      const event = response.events[0];

      return {
        id: event.idEvent,
        matchId: event.idEvent,
        finalScore: {
          home: event.intHomeScore !== null ? Number(event.intHomeScore) : null,
          away: event.intAwayScore !== null ? Number(event.intAwayScore) : null
        },
        status: normalizeStatus(event.strStatus) || 'FINISHED',
        homeTeam: {
          id: event.idHomeTeam,
          name: event.strHomeTeam,
          shortName: event.strHomeTeamShort || event.strHomeTeam
        },
        awayTeam: {
          id: event.idAwayTeam,
          name: event.strAwayTeam,
          shortName: event.strAwayTeamShort || event.strAwayTeam
        },
        competition: event.strLeague || '',
        kickoffTime: parseKickoffTime(event),
        venue: event.strVenue || 'TBD',
        scorers: [] // TheSportsDB free doesn't provide detailed scorer info
      };
    } catch (error) {
      console.error('Error fetching event result:', error);
      throw error;
    }
  }

  async getLeagueTable(leagueId, season = '2024-2025') {
    if (!leagueId) {
      return [];
    }

    const response = await this.request(`/lookuptable.php?l=${leagueId}&s=${season}`);
    return Array.isArray(response?.table) ? response.table : [];
  }

  async getTurkishLeagueTable(season) {
    return this.getLeagueTable(LEAGUES['turkish-super-league'].id, season);
  }

  async getChampionsLeagueTable(season) {
    return this.getLeagueTable(LEAGUES['champions-league'].id, season);
  }

  async testApiAccess() {
    try {
      console.log('Testing API access...');

      // Use a simple endpoint that should work - Turkish Super Lig
      const response = await this.request(`/eventspastleague.php?id=${LEAGUES['turkish-super-league'].id}`, {}, 1);

      const success = response && (response.events || response.error !== undefined);

      return {
        success: success,
        message: success ? 'API connection successful' : 'API returned empty response',
        endpoint: this.baseURL,
        dataReceived: !!response,
        eventCount: response?.events ? response.events.length : 0
      };
    } catch (error) {
      console.error('API test failed:', error);

      return {
        success: false,
        message: error.message,
        endpoint: this.baseURL,
        errorType: error.name,
        suggestion: this.getErrorSuggestion(error)
      };
    }
  }

  getErrorSuggestion(error) {
    if (error.message.includes('Network error') || error.message.includes('fetch')) {
      return 'Check your internet connection and firewall settings';
    }
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return 'API server is slow or unresponsive. Try again later';
    }
    if (error.message.includes('rate limit')) {
      return 'API rate limit exceeded. Wait a few minutes before trying again';
    }
    if (error.message.includes('500') || error.message.includes('unavailable')) {
      return 'TheSportsDB service is temporarily down. Check their status page';
    }
    return 'Unknown API error. Try refreshing the page';
  }
}

export const footballApi = new FootballApiClient();

export const {
  getMatches,
  getCompetitions,
  getLiveMatches,
  getFinishedMatches,
  getEventResult,
  getLeagueTable,
  getTurkishLeagueTable,
  getChampionsLeagueTable,
  testApiAccess
} = footballApi;



















