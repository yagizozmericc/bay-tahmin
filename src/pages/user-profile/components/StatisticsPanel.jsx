import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const StatisticsPanel = ({ statistics, onRefresh, isRefreshing }) => {
  // Use real data from statistics prop, with fallback to default
  const monthlyData = statistics?.monthlyData || [
    { month: 'Sep', predictions: 0, correct: 0 },
    { month: 'Oct', predictions: 0, correct: 0 },
    { month: 'Nov', predictions: 0, correct: 0 },
    { month: 'Dec', predictions: 0, correct: 0 },
    { month: 'Jan', predictions: 0, correct: 0 },
    { month: 'Feb', predictions: 0, correct: 0 }
  ];

  const competitionData = statistics?.competitionData || [
    { name: 'No Data', value: 1, color: '#66BB6A' }
  ];

  const accuracyData = statistics?.accuracyTrend || [
    { week: 'W1', accuracy: 0 },
    { week: 'W2', accuracy: 0 },
    { week: 'W3', accuracy: 0 },
    { week: 'W4', accuracy: 0 },
    { week: 'W5', accuracy: 0 },
    { week: 'W6', accuracy: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      {onRefresh && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Statistics Overview</h2>
            {statistics?.lastCalculated && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(statistics.lastCalculated).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon
              name="RefreshCw"
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Predictions</p>
              <p className="text-2xl font-bold text-foreground">{statistics?.totalPredictions}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <Icon name="TrendingUp" size={14} className="text-success" />
            <span className="text-xs text-success">+12% from last month</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              <p className="text-2xl font-bold text-foreground">{statistics?.accuracy}%</p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <Icon name="TrendingUp" size={14} className="text-success" />
            <span className="text-xs text-success">+3.2% from last month</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-2xl font-bold text-foreground">{statistics?.bestStreak}</p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Flame" size={20} className="text-accent" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <Icon name="Calendar" size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-foreground">{statistics?.totalPoints}</p>
            </div>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={20} className="text-warning" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <Icon name="TrendingUp" size={14} className="text-success" />
            <span className="text-xs text-success">+45 this week</span>
          </div>
        </div>
      </div>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="BarChart3" size={20} className="text-primary" />
            <span>Monthly Performance</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="predictions" fill="var(--color-primary)" name="Total Predictions" />
                <Bar dataKey="correct" fill="var(--color-success)" name="Correct Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competition Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="PieChart" size={20} className="text-primary" />
            <span>Competition Distribution</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={competitionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {competitionData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {competitionData?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item?.color }}></div>
                <span className="text-xs text-muted-foreground">{item?.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Accuracy Trend */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <span>Accuracy Trend (Last 6 Weeks)</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="var(--color-success)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Detailed Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="List" size={20} className="text-primary" />
          <span>Detailed Statistics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Exact Score Predictions</span>
              <span className="text-sm font-medium text-foreground">{statistics?.exactScores}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Correct Winner Predictions</span>
              <span className="text-sm font-medium text-foreground">{statistics?.correctWinners}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Correct Scorer Predictions</span>
              <span className="text-sm font-medium text-foreground">{statistics?.correctScorers}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="text-sm font-medium text-foreground">{statistics?.currentStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Points per Match</span>
              <span className="text-sm font-medium text-foreground">{statistics?.avgPointsPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Leagues Joined</span>
              <span className="text-sm font-medium text-foreground">{statistics?.leaguesJoined}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Global Rank</span>
              <span className="text-sm font-medium text-foreground">#{statistics?.globalRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Days Active</span>
              <span className="text-sm font-medium text-foreground">{statistics?.daysActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Achievements Unlocked</span>
              <span className="text-sm font-medium text-foreground">{statistics?.achievementsUnlocked}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;