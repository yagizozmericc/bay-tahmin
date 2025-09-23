import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', size = 'icon', variant = 'ghost' }) => {
  const { theme, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Icon name="Loader2" size={20} className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon
        name={theme === 'dark' ? 'Sun' : 'Moon'}
        size={20}
        className="transition-transform duration-300 hover:scale-110"
      />
    </Button>
  );
};

export default ThemeToggle;