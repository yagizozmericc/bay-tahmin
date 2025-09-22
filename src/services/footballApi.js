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

  if (!leagueNames.length) {
    return false;
  }

  const eventNames = [
    event.strLeague,
    event.strLeagueAlternate
  ].map(normalizeText);

  return eventNames.some((value) => 
    value && leagueNames.some((name) => value.includes(name))
  );
};

const mapEventToMatch = (event, league) => {
  if (!event || !league) {
    return null;
  }

  const kickoffTime = parseKickoffTime(event);

  if (!kickoffTime) {
    return null;
  }

  const competitionName = (event.strLeague || event.strLeagueAlternate || league.name || '').trim();

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

class FootballApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${ensureLeadingSlash(endpoint)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `TheSportsDB request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
        );
      }

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error while contacting TheSportsDB.');
      }

      throw error;
    }
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

    const results = [];

    for (const slug of competitions) {
      const league = LEAGUES[slug];

      if (!league) {
        continue;
      }

      const response = await this.request(`/eventspastleague.php?id=${league.id}`);
      const events = Array.isArray(response?.events) ? response.events : [];

      events.forEach((event) => {
        if (!eventMatchesLeague(event, league)) {
          return;
        }

        const match = mapEventToMatch(event, league);

        if (match) {
          results.push({
            ...match,
            status: 'FINISHED',
            score: {
              home: event.intHomeScore !== null ? Number(event.intHomeScore) : null,
              away: event.intAwayScore !== null ? Number(event.intAwayScore) : null
            }
          });
        }
      });
    }

    results.sort((a, b) => new Date(b.kickoffTime) - new Date(a.kickoffTime));

    if (typeof filters.limit === 'number') {
      return results.slice(0, filters.limit);
    }

    return results;
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
      const summaries = await Promise.all(
        DEFAULT_COMPETITIONS.map(async (slug) => {
          const league = LEAGUES[slug];
          const response = await this.request(`/eventsnextleague.php?id=${league.id}`);
          const events = Array.isArray(response?.events) ? response.events : [];
          const validEvents = events.filter((event) => eventMatchesLeague(event, league));

          return {
            slug,
            name: league.name,
            matchCount: validEvents.length
          };
        })
      );

      return {
        success: true,
        message: 'TheSportsDB connection succeeded.',
        details: summaries
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export const footballApi = new FootballApiClient();

export const {
  getMatches,
  getCompetitions,
  getLiveMatches,
  getFinishedMatches,
  getLeagueTable,
  getTurkishLeagueTable,
  getChampionsLeagueTable,
  testApiAccess
} = footballApi;
