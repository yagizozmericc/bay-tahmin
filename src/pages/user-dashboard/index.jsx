import React from 'react';
import Header from '../../components/ui/Header';
import UpcomingMatches from './components/UpcomingMatches';
import PerformanceSummary from './components/PerformanceSummary';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import ActiveLeagues from './components/ActiveLeagues';
import LiveMatches from './components/LiveMatches';
import { useMatches, useRecentResults, COMPETITIONS } from '../../hooks/useMatches';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_COMPETITIONS = [
  COMPETITIONS.TURKISH_SUPER_LEAGUE,
  COMPETITIONS.CHAMPIONS_LEAGUE
];

const COMPETITION_LABELS = {
  [COMPETITIONS.TURKISH_SUPER_LEAGUE]: 'Turkish Super Lig',
  [COMPETITIONS.CHAMPIONS_LEAGUE]: 'UEFA Champions League'
};

const formatDateInput = (date) => date.toISOString().split('T')[0];

const formatDateTime = (date) =>
  date.toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

const formatDateOnly = (date) =>
  date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });

const formatRelativeFuture = (diffMs) => {
  if (diffMs <= 0) {
    return 'Kickoff passed';
  }

  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours - days * 24;
    return `${days}d ${remainingHours}h`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes - hours * 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}m`;
};

const formatRelativePast = (diffMs) => {
  if (diffMs < 60 * 1000) {
    return 'just now';
  }

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const enhanceUpcomingMatch = (match, nowMs) => {
  const kickoff = new Date(match.kickoffTime);
  const diffMs = kickoff.getTime() - nowMs;

  return {
    ...match,
    kickoffDate: kickoff,
    kickoffLabel: formatDateTime(kickoff),
    timeUntil: formatRelativeFuture(diffMs),
    isKickoffPassed: diffMs <= 0
  };
};

const enhanceResult = (match, nowMs) => {
  const kickoff = new Date(match.kickoffTime);
  const diffMs = nowMs - kickoff.getTime();
  const homeScore = match?.score?.home ?? null;
  const awayScore = match?.score?.away ?? null;

  return {
    ...match,
    kickoffDate: kickoff,
    kickoffLabel: formatDateOnly(kickoff),
    relativeTime: formatRelativePast(diffMs),
    homeScore,
    awayScore
  };
};

const groupByCompetition = (items) => {
  return items.reduce((acc, item) => {
    const key = item?.competitionCode;
    if (!key) {
      return acc;
    }

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};

const UserDashboard = () => {
  const now = new Date();
  const nowMs = now.getTime();
  const dateFrom = formatDateInput(now);
  const dateTo = formatDateInput(new Date(nowMs + 14 * DAY_IN_MS));

  const {
    matches: upcomingMatchesRaw,
    loading: upcomingLoading,
    error: upcomingError
  } = useMatches({
    competitions: DEFAULT_COMPETITIONS,
    dateFrom,
    dateTo
  });

  const {
    results: recentResultsRaw,
    loading: resultsLoading,
    error: resultsError
  } = useRecentResults({
    competitions: DEFAULT_COMPETITIONS,
    limit: 12
  });

  const upcomingMatches = upcomingMatchesRaw
    .slice()
    .sort((a, b) => new Date(a.kickoffTime) - new Date(b.kickoffTime))
    .map((match) => enhanceUpcomingMatch(match, nowMs));

  const recentResults = recentResultsRaw
    .slice()
    .sort((a, b) => new Date(b.kickoffTime) - new Date(a.kickoffTime))
    .map((match) => enhanceResult(match, nowMs));

  const urgentMatches = upcomingMatches.filter((match) => {
    const diff = match.kickoffDate.getTime() - nowMs;
    return diff >= 0 && diff <= DAY_IN_MS;
  });

  const matchesByCompetition = groupByCompetition(upcomingMatches);
  const resultsByCompetition = groupByCompetition(recentResults);

  const competitionSummaries = DEFAULT_COMPETITIONS.map((competition) => {
    const upcomingList = matchesByCompetition[competition] || [];
    const resultsList = resultsByCompetition[competition] || [];
    const nextMatch = upcomingList[0] || null;
    const latestResult = resultsList[0] || null;

    return {
      id: competition,
      name: COMPETITION_LABELS[competition] || competition,
      upcomingCount: upcomingList.length,
      nextMatch,
      latestResult
    };
  });

  const matchesThisWeek = upcomingMatches.filter((match) => {
    const diff = match.kickoffDate.getTime() - nowMs;
    return diff >= 0 && diff <= 7 * DAY_IN_MS;
  }).length;

  const dashboardStats = {
    totalUpcoming: upcomingMatches.length,
    matchesThisWeek,
    competitionsFollowed: Object.keys(matchesByCompetition).length || 0,
    urgentCount: urgentMatches.length,
    nextMatch: upcomingMatches[0] || null,
    latestResult: recentResults[0] || null
  };

  const quickActionStats = {
    upcomingCount: upcomingMatches.length,
    urgentCount: urgentMatches.length,
    nextMatch: upcomingMatches[0] || null
  };

  const activityItems = recentResults.slice(0, 6).map((result) => ({
    id: result.id,
    title: `${result.homeTeam?.name || 'TBD'} ${
      typeof result.homeScore === 'number' ? result.homeScore : '-'
    } - ${
      typeof result.awayScore === 'number' ? result.awayScore : '-'
    } ${result.awayTeam?.name || 'TBD'}`,
    description: result.competition,
    timestamp: result.relativeTime,
    icon: result.competitionCode === COMPETITIONS.CHAMPIONS_LEAGUE ? 'Trophy' : 'Flag'
  }));

  const welcomeMessage = upcomingLoading
    ? 'Loading upcoming fixtures...'
    : quickActionStats.urgentCount > 0
      ? `There are ${quickActionStats.urgentCount} matches starting within 24 hours.`
      : `You have ${quickActionStats.upcomingCount} upcoming matches to review.`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground">
                  {welcomeMessage}
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current Time</div>
                  <div className="text-lg font-semibold text-foreground">
                    {now.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="lg:hidden">
                <QuickActions stats={quickActionStats} loading={upcomingLoading} />
              </div>

              <LiveMatches
                results={recentResults.slice(0, 4)}
                loading={resultsLoading}
                error={resultsError}
              />

              <UpcomingMatches
                matches={upcomingMatches.slice(0, 5)}
                loading={upcomingLoading}
                error={upcomingError}
              />

              <PerformanceSummary
                stats={dashboardStats}
                loading={upcomingLoading || resultsLoading}
                recentResults={recentResults.slice(0, 3)}
                upcomingMatches={upcomingMatches.slice(0, 3)}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block">
                <QuickActions stats={quickActionStats} loading={upcomingLoading} />
              </div>

              <ActiveLeagues
                summaries={competitionSummaries}
                loading={upcomingLoading}
              />

              <RecentActivity
                items={activityItems}
                loading={resultsLoading}
                error={resultsError}
              />
            </div>
          </div>

          <div className="h-4 lg:hidden" />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
