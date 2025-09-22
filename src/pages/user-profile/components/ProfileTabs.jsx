import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg mb-6">
      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-micro border-b-2 ${
              activeTab === tab?.id
                ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name={tab?.icon} size={18} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Mobile Dropdown */}
      <div className="md:hidden p-4 border-b border-border">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e?.target?.value)}
            className="w-full appearance-none bg-background border border-border rounded-md px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {tabs?.map((tab) => (
              <option key={tab?.id} value={tab?.id}>
                {tab?.label}
              </option>
            ))}
          </select>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;