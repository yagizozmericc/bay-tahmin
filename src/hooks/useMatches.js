import { useState, useEffect } from 'react';
import { footballApi } from '../services/footballApi';

export const COMPETITIONS = {
  TURKISH_SUPER_LEAGUE: 'turkish-super-league',
  CHAMPIONS_LEAGUE: 'champions-league'
};

const DEFAULT_COMPETITIONS = [
  COMPETITIONS.TURKISH_SUPER_LEAGUE,
  COMPETITIONS.CHAMPIONS_LEAGUE
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatDate = (date) => date.toISOString().split('T')[0];

const isValidCompetition = (slug) => Object.values(COMPETITIONS).includes(slug);

const resolveCompetitions = (source) => {
  const list = Array.isArray(source) && source.length ? source : DEFAULT_COMPETITIONS;
  const seen = new Set();
  const sanitized = list.filter((slug) => {
    if (!isValidCompetition(slug)) {
      return false;
    }

    if (seen.has(slug)) {
      return false;
    }

    seen.add(slug);
    return true;
  });

  return sanitized.length ? sanitized : DEFAULT_COMPETITIONS;
};

export const useMatches = (filters = {}) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date();
        const defaultFrom = formatDate(today);
        const defaultTo = formatDate(new Date(today.getTime() + 30 * DAY_IN_MS));

        const competitions = resolveCompetitions(filters.competitions);

        const apiFilters = {
          competitions,
          dateFrom: filters.dateFrom || defaultFrom,
          dateTo: filters.dateTo || defaultTo
        };

        const matchData = await footballApi.getMatches(apiFilters);
        setMatches(matchData);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Unable to load matches.');
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [JSON.stringify(filters)]);

  const refetch = async (overrides = {}) => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const defaultFrom = formatDate(today);
      const defaultTo = formatDate(new Date(today.getTime() + 7 * DAY_IN_MS));

      const competitions = resolveCompetitions(overrides.competitions ?? filters.competitions);

      const apiFilters = {
        competitions,
        dateFrom: overrides.dateFrom || filters.dateFrom || defaultFrom,
        dateTo: overrides.dateTo || filters.dateTo || defaultTo
      };

      const matchData = await footballApi.getMatches(apiFilters);
      setMatches(matchData);
    } catch (err) {
      console.error('Error refetching matches:', err);
      setError(err.message || 'Unable to reload matches.');
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    error,
    refetch
  };
};

export const useRecentResults = (options = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const competitions = resolveCompetitions(options.competitions);
        const limit = typeof options.limit === 'number' ? options.limit : 10;

        const response = await footballApi.getFinishedMatches({
          competitions,
          limit
        });

        if (!isMounted) {
          return;
        }

        setResults(Array.isArray(response) ? response : []);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching recent results:', err);
          setError(err.message || 'Unable to load recent results.');
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify({
    competitions: options.competitions,
    limit: options.limit
  })]);

  return {
    results,
    loading,
    error
  };
};


export const useLiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        const matches = await footballApi.getLiveMatches();
        setLiveMatches(matches);
      } catch (err) {
        console.warn('Live matches not available:', err.message);
        setError(err.message);
        setLiveMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();

    const interval = setInterval(fetchLiveMatches, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    liveMatches,
    loading,
    error
  };
};

export const useCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const competitionData = await footballApi.getCompetitions();
        setCompetitions(competitionData);
      } catch (err) {
        console.warn('Competition list not available:', err.message);
        setError(err.message);
        setCompetitions([
          { id: '4339', name: 'Turkish Super Lig', slug: COMPETITIONS.TURKISH_SUPER_LEAGUE },
          { id: '4480', name: 'UEFA Champions League', slug: COMPETITIONS.CHAMPIONS_LEAGUE }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  return {
    competitions,
    loading,
    error
  };
};
