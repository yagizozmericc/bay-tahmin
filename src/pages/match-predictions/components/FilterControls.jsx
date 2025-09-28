import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { COMPETITIONS } from '../../../hooks/useMatches';

const FilterControls = ({ filters, onFilterChange, onClearFilters }) => {
  const competitionOptions = [
    { value: 'all', label: 'All Competitions' },
    { value: COMPETITIONS.TURKISH_SUPER_LEAGUE, label: 'Turkish Super Lig' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Matches' },
    { value: 'predicted', label: 'Predicted' },
    { value: 'unpredicted', label: 'Not Predicted' },
    { value: 'deadline-soon', label: 'Deadline Soon' }
  ];

  const sortOptions = [
    { value: 'kickoff-asc', label: 'Kickoff Time (Earliest)' },
    { value: 'kickoff-desc', label: 'Kickoff Time (Latest)' },
    { value: 'competition', label: 'Competition' },
    { value: 'prediction-status', label: 'Prediction Status' }
  ];

  const hasActiveFilters = () => {
    return filters?.competition !== 'all' || 
           filters?.date !== 'all' || 
           filters?.status !== 'all' || 
           filters?.sort !== 'kickoff-asc';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={20} />
          <span>Filter Matches</span>
        </h3>
        
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
            className="text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Competition"
          options={competitionOptions}
          value={filters?.competition}
          onChange={(value) => onFilterChange('competition', value)}
          className="w-full"
        />

        <Select
          label="Date Range"
          options={dateOptions}
          value={filters?.date}
          onChange={(value) => onFilterChange('date', value)}
          className="w-full"
        />

        <Select
          label="Prediction Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          className="w-full"
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sort}
          onChange={(value) => onFilterChange('sort', value)}
          className="w-full"
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground mr-2">Quick filters:</span>
        
        <Button
          variant={filters?.status === 'deadline-soon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('status', filters?.status === 'deadline-soon' ? 'all' : 'deadline-soon')}
          iconName="Clock"
          iconPosition="left"
        >
          Deadline Soon
        </Button>

        <Button
          variant={filters?.status === 'unpredicted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('status', filters?.status === 'unpredicted' ? 'all' : 'unpredicted')}
          iconName="AlertCircle"
          iconPosition="left"
        >
          Not Predicted
        </Button>

        <Button
          variant={filters?.competition === COMPETITIONS.TURKISH_SUPER_LEAGUE ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('competition', filters?.competition === COMPETITIONS.TURKISH_SUPER_LEAGUE ? 'all' : COMPETITIONS.TURKISH_SUPER_LEAGUE)}
          iconName="Flag"
          iconPosition="left"
        >
          Turkish Super Lig
        </Button>

        <Button
          variant={filters?.date === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('date', filters?.date === 'today' ? 'all' : 'today')}
          iconName="Calendar"
          iconPosition="left"
        >
          Today
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
