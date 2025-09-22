import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const LeaderboardTable = ({ leaderboardData, currentUserId, onUserClick }) => {
  const [expandedUser, setExpandedUser] = useState(null);

  const handleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getRankIcon = (position) => {
    if (position === 1) return { icon: 'Trophy', color: 'text-yellow-500' };
    if (position === 2) return { icon: 'Medal', color: 'text-gray-400' };
    if (position === 3) return { icon: 'Award', color: 'text-amber-600' };
    return { icon: 'User', color: 'text-muted-foreground' };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: 'TrendingUp', color: 'text-success' };
    if (trend < 0) return { icon: 'TrendingDown', color: 'text-error' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-foreground">Rank</th>
              <th className="text-left py-4 px-6 font-semibold text-foreground">Player</th>
              <th className="text-center py-4 px-6 font-semibold text-foreground">Points</th>
              <th className="text-center py-4 px-6 font-semibold text-foreground">Predictions</th>
              <th className="text-center py-4 px-6 font-semibold text-foreground">Accuracy</th>
              <th className="text-center py-4 px-6 font-semibold text-foreground">Trend</th>
              <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData?.map((user, index) => {
              const rankInfo = getRankIcon(user?.position);
              const trendInfo = getTrendIcon(user?.trend);
              const isCurrentUser = user?.id === currentUserId;
              const isExpanded = expandedUser === user?.id;

              return (
                <React.Fragment key={user?.id}>
                  <tr className={`border-b border-border hover:bg-muted/30 transition-micro ${
                    isCurrentUser ? 'bg-primary/5 border-primary/20' : ''
                  }`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          user?.position <= 3 ? 'bg-muted' : 'bg-muted/50'
                        }`}>
                          <Icon name={rankInfo?.icon} size={16} className={rankInfo?.color} />
                        </div>
                        <span className="font-semibold text-lg">{user?.position}</span>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          {user?.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">Member since {new Date(user?.lastUpdated?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="font-bold text-xl text-primary">{user?.totalPoints}</div>
                      <div className="text-xs text-muted-foreground">
                        +{user?.weeklyPoints} this week
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="font-semibold text-foreground">{user?.totalPredictions}</div>
                      <div className="text-xs text-muted-foreground">
                        {user?.correctPredictions} correct
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-12 h-2 bg-muted rounded-full overflow-hidden`}>
                          <div 
                            className="h-full bg-success rounded-full transition-all duration-500"
                            style={{ width: `${user?.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-sm">{user?.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Icon name={trendInfo?.icon} size={16} className={trendInfo?.color} />
                        <span className={`font-semibold text-sm ${trendInfo?.color}`}>
                          {Math.abs(user?.trend)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                          onClick={() => handleUserExpand(user?.id)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="User"
                          onClick={() => onUserClick(user?.id)}
                        >
                          Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-muted/20">
                      <td colSpan="7" className="py-6 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Recent Performance</h4>
                            <div className="space-y-2">
                              {user?.recentMatches?.length > 0 ? (
                                user.recentMatches.map((match, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{match?.match}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-medium ${
                                        match?.points > 0 ? 'text-success' : 'text-error'
                                      }`}>
                                        {match?.points > 0 ? '+' : ''}{match?.points}
                                      </span>
                                      <Icon
                                        name={match?.points > 0 ? "CheckCircle" : "XCircle"}
                                        size={14}
                                        className={match?.points > 0 ? 'text-success' : 'text-error'}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No recent predictions available</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Statistics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Exact Scores:</span>
                                <span className="font-medium">{user?.exactScores}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Correct Winners:</span>
                                <span className="font-medium">{user?.correctWinners}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Goal Scorers:</span>
                                <span className="font-medium">{user?.correctScorers}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Best Streak:</span>
                                <span className="font-medium">{user?.bestStreak} matches</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">League History</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Active:</span>
                                <span className="font-medium">{user?.lastUpdated ? new Date(user.lastUpdated.toDate()).toLocaleDateString() : 'Recently'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Current Streak:</span>
                                <span className="font-medium">{user?.currentStreak || 0} matches</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">League:</span>
                                <span className="font-medium">{user?.leagueId || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {leaderboardData?.map((user) => {
          const rankInfo = getRankIcon(user?.position);
          const trendInfo = getTrendIcon(user?.trend);
          const isCurrentUser = user?.id === currentUserId;
          const isExpanded = expandedUser === user?.id;

          return (
            <div key={user?.id} className={`bg-card border border-border rounded-lg p-4 ${
              isCurrentUser ? 'border-primary bg-primary/5' : ''
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    user?.position <= 3 ? 'bg-muted' : 'bg-muted/50'
                  }`}>
                    <Icon name={rankInfo?.icon} size={18} className={rankInfo?.color} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">#{user?.position}</span>
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name={trendInfo?.icon} size={14} className={trendInfo?.color} />
                      <span className={`text-sm font-medium ${trendInfo?.color}`}>
                        {Math.abs(user?.trend)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-primary">{user?.totalPoints}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  {user?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">League: {user?.leagueId || 'General'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{user?.totalPredictions}</div>
                  <div className="text-xs text-muted-foreground">Predictions</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{user?.correctPredictions}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{user?.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                  onClick={() => handleUserExpand(user?.id)}
                >
                  {isExpanded ? 'Less' : 'More'} Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="User"
                  onClick={() => onUserClick(user?.id)}
                >
                  View Profile
                </Button>
              </div>
              {/* Mobile Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Recent Matches</h4>
                    <div className="space-y-2">
                      {user?.recentMatches?.length > 0 ? (
                        user.recentMatches.slice(0, 3).map((match, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{match?.match}</span>
                            <div className="flex items-center space-x-1">
                              <span className={`font-medium ${
                                match?.points > 0 ? 'text-success' : 'text-error'
                              }`}>
                                {match?.points > 0 ? '+' : ''}{match?.points}
                              </span>
                              <Icon
                                name={match?.points > 0 ? "CheckCircle" : "XCircle"}
                                size={12}
                                className={match?.points > 0 ? 'text-success' : 'text-error'}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent predictions</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exact Scores:</span>
                        <span className="font-medium">{user?.exactScores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Streak:</span>
                        <span className="font-medium">{user?.bestStreak}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Streak:</span>
                        <span className="font-medium">{user?.currentStreak || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Points:</span>
                        <span className="font-medium">{user?.totalPoints || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardTable;