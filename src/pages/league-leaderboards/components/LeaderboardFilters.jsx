import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LeaderboardFilters = ({ 
  selectedLeague, 
  onLeagueChange, 
  selectedPeriod, 
  onPeriodChange,
  selectedSort,
  onSortChange,
  onRefresh,
  isLoading 
}) => {
  const leagueOptions = [
    { value: 'all', label: 'All Leagues' },
    { value: 'champions-league', label: 'Champions League Predictions' },
    { value: 'turkish-super-league', label: 'Turkish Super League' },
    { value: 'premier-league', label: 'Premier League Fans' },
    { value: 'la-liga', label: 'La Liga Experts' },
    { value: 'bundesliga', label: 'Bundesliga Masters' }
  ];

  const periodOptions = [
    { value: 'overall', label: 'All Time' },
    { value: 'season', label: 'Current Season' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' }
  ];

  const sortOptions = [
    { value: 'points', label: 'Total Points' },
    { value: 'accuracy', label: 'Accuracy %' },
    { value: 'predictions', label: 'Total Predictions' },
    { value: 'recent-form', label: 'Recent Form' },
    { value: 'exact-scores', label: 'Exact Scores' },
    { value: 'goal-scorers', label: 'Goal Scorers' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <Select
              label="League"
              options={leagueOptions}
              value={selectedLeague}
              onChange={onLeagueChange}
              placeholder="Select league..."
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              label="Time Period"
              options={periodOptions}
              value={selectedPeriod}
              onChange={onPeriodChange}
              placeholder="Select period..."
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              label="Sort By"
              options={sortOptions}
              value={selectedSort}
              onChange={onSortChange}
              placeholder="Sort by..."
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            iconName="RefreshCw"
            onClick={onRefresh}
            loading={isLoading}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          <Button
            variant="ghost"
            iconName="Download"
            size="icon"
          >
            <Icon name="Download" size={18} />
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-sm font-medium text-muted-foreground mr-2">Quick filters:</span>
        
        <button 
          onClick={() => onPeriodChange('week')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-micro ${
            selectedPeriod === 'week' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          This Week
        </button>
        
        <button 
          onClick={() => onSortChange('accuracy')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-micro ${
            selectedSort === 'accuracy' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Best Accuracy
        </button>
        
        <button 
          onClick={() => onSortChange('recent-form')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-micro ${
            selectedSort === 'recent-form' 
              ? 'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Hot Streak
        </button>
        
        <button 
          onClick={() => onLeagueChange('champions-league')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-micro ${
            selectedLeague === 'champions-league' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Champions League
        </button>
      </div>
    </div>
  );
};

export default LeaderboardFilters;