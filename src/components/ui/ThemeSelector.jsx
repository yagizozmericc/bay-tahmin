import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useTheme } from '../../context/ThemeContext';

const ThemeSelector = ({ showLabels = true, className = '' }) => {
  const { theme, setLightTheme, setDarkTheme, isLoading } = useTheme();

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: 'Sun',
      description: 'Light theme with bright colors'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: 'Moon',
      description: 'Dark theme with muted colors'
    }
  ];

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading theme...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabels && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">Theme Preference</h3>
          <p className="text-xs text-muted-foreground">Choose how the interface should look</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => themeOption.id === 'light' ? setLightTheme() : setDarkTheme()}
            className={`relative p-4 rounded-lg border transition-micro text-left ${
              theme === themeOption.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-border/60 hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === themeOption.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Icon name={themeOption.icon} size={16} />
              </div>

              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  theme === themeOption.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {themeOption.name}
                </div>
                {showLabels && (
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                )}
              </div>

              {theme === themeOption.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Icon name="Check" size={12} color="white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;