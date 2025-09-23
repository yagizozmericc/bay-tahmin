import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLeagueSubNavOpen, setIsLeagueSubNavOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef(null);
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

  const displayName = (user?.displayName || '').trim() || (user?.email ? user.email.split('@')[0] : '');
  const userEmail = user?.email || '';
  const userInitial = (displayName || userEmail || 'U').charAt(0).toUpperCase();

  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/user-dashboard',
      icon: 'LayoutDashboard',
      badge: null
    },
    {
      label: 'Predictions',
      path: '/match-predictions',
      icon: 'Target',
      badge: 3
    },
    {
      label: 'Leagues',
      path: '/league-management',
      icon: 'Trophy',
      badge: null,
      hasSubNav: true,
      subItems: [
        { label: 'Management', path: '/league-management', icon: 'Settings' },
        { label: 'Leaderboards', path: '/league-leaderboards', icon: 'BarChart3' }
      ]
    },
    {
      label: 'Profile',
      path: '/user-profile',
      icon: 'User',
      badge: null
    }
  ];

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const isLeagueRoute = () => {
    return location?.pathname === '/league-management' || location?.pathname === '/league-leaderboards';
  };

  useEffect(() => {
    setIsLeagueSubNavOpen(isLeagueRoute());
  }, [location?.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }

      // Close league submenu when clicking outside
      if (!event?.target?.closest('.relative')) {
        setIsLeagueSubNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsUserMenuOpen(false);
    }
  }, [isAuthenticated]);

  const handleUserMenuToggle = () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    setIsUserMenuOpen((prev) => !prev);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLeagueClick = (e) => {
    e.preventDefault();
    setIsLeagueSubNavOpen(!isLeagueSubNavOpen);
  };

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    try {
      setSigningOut(true);
      await logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setSigningOut(false);
      setIsUserMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Revolutionary Logo */}
          <Link to="/user-dashboard" className="flex items-center space-x-3 group animate-float">
            {/* 3D Logo Container with Advanced Effects */}
            <div className="relative">
              {/* Animated Glow Ring */}
              <div className="absolute inset-0 w-12 h-12 rounded-2xl animate-logo-glow"></div>

              {/* Multi-layer Glow Effect */}
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-primary via-accent to-success rounded-2xl blur-sm opacity-40 group-hover:opacity-70 transition-all duration-500"></div>

              {/* Main Logo Container with 3D Effect */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 w-1/4 h-full animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Inner 3D Gradient Layers */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/20 to-accent/30 rounded-2xl"></div>

                {/* Icon with Enhanced Animation */}
                <div className="relative flex items-center justify-center w-full h-full">
                  <Icon
                    name="Target"
                    size={24}
                    color="white"
                    strokeWidth={2.5}
                    className="drop-shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ease-out"
                  />

                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-2 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full shadow-sm opacity-80"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-success rounded-full shadow-sm opacity-60"></div>

                {/* Edge Highlights */}
                <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>

            {/* Revolutionary Text Design */}
            <div className="hidden sm:block">
              {/* Main Title with Advanced Gradient */}
              <div className="relative">
                {/* Background Glow for Text */}
                <div className="absolute inset-0 text-2xl font-black blur-sm bg-gradient-to-r from-primary/20 via-accent/20 to-success/20 bg-clip-text text-transparent group-hover:from-accent/30 group-hover:via-primary/30 group-hover:to-success/30 transition-all duration-500"></div>

                {/* Main Text with Dynamic Gradient */}
                <h1
                  className="relative text-2xl font-black bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent group-hover:from-accent group-hover:via-success group-hover:to-primary transition-all duration-700 bg-[length:200%_100%] animate-gradient-shift"
                  style={{ backgroundSize: '200% 100%' }}
                >
                  Bay Tahmin
                </h1>

                {/* Holographic Shimmer Overlay */}
                <div className="absolute inset-0 text-2xl font-black bg-gradient-to-r from-transparent via-white/30 to-transparent bg-clip-text text-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
              </div>

              {/* Enhanced Pro Badge and Status */}
              <div className="flex items-center space-x-2 mt-1">
                {/* 3D Pro Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-warning rounded-full blur-sm opacity-50"></div>
                  <div className="relative px-3 py-1 bg-gradient-to-br from-accent via-warning to-accent/80 rounded-full shadow-lg overflow-hidden">
                    {/* Inner Shine */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
                    <p className="relative text-xs font-black text-white tracking-wider drop-shadow-sm">PRO</p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-2">
                  {/* Live Indicator */}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <p className="text-xs text-success font-semibold">LIVE</p>
                  </div>

                  {/* Version with Glow */}
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-60"></div>
                    <p className="text-xs text-muted-foreground font-medium">v2.0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Mobile Compact Version */}
            <div className="sm:hidden">
              <div className="relative">
                {/* Background Glow for Mobile */}
                <div className="absolute inset-0 text-lg font-black blur-sm bg-gradient-to-r from-primary/30 to-accent/30 bg-clip-text text-transparent"></div>

                {/* Main Mobile Text */}
                <h1 className="relative text-lg font-black bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-500">
                  BT
                </h1>

                {/* Mobile Accent Elements */}
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-accent rounded-full shadow-sm"></div>
                <div className="absolute -top-1 -left-1 w-1 h-1 bg-success rounded-full opacity-70"></div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <div key={item?.path} className="relative">
                {item?.hasSubNav ? (
                  <>
                    <button
                      onClick={handleLeagueClick}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                        isLeagueRoute()
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={item?.icon} size={18} />
                      <span>{item?.label}</span>
                      {item?.badge && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                          {item?.badge}
                        </span>
                      )}
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={`transition-transform ${isLeagueSubNavOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Desktop Sub Navigation Dropdown */}
                    {isLeagueSubNavOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 animate-scale-in z-50">
                        {item?.subItems?.map((subItem) => (
                          <Link
                            key={subItem?.path}
                            to={subItem?.path}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-micro ${
                              isActiveRoute(subItem?.path)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                            onClick={() => setIsLeagueSubNavOpen(false)}
                          >
                            <Icon name={subItem?.icon} size={16} />
                            <span>{subItem?.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item?.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                      isActiveRoute(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={18} />
                    <span>{item?.label}</span>
                    {item?.badge && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-accent text-accent-foreground rounded-full animate-pulse">
                        {item?.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <ThemeToggle className="hidden lg:inline-flex" />

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden lg:inline-flex"
                >
                  <Icon name="Bell" size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
                </Button>

                <ThemeToggle className="lg:hidden" />

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted transition-micro"
                    disabled={authLoading}
                  >
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                      {userInitial}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-sm font-medium text-foreground leading-none">{displayName || 'Account'}</span>
                      {userEmail && (
                        <span className="text-xs text-muted-foreground leading-none truncate max-w-[140px]">
                          {userEmail}
                        </span>
                      )}
                    </div>
                    <Icon name="ChevronDown" size={16} className="hidden sm:block text-muted-foreground" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="text-sm font-medium text-foreground truncate">
                          {displayName || 'Account'}
                        </div>
                        {userEmail && (
                          <div className="text-xs text-muted-foreground truncate">
                            {userEmail}
                          </div>
                        )}
                      </div>

                      <Link
                        to="/user-profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-micro"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon name="User" size={16} />
                        <span>Profile</span>
                      </Link>

                      <div className="border-t border-border mt-2 pt-2 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={handleSignOut}
                          loading={signingOut}
                        >
                          <Icon name="LogOut" size={16} className="mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              !authLoading && (
                <>
                  <ThemeToggle className="hidden lg:inline-flex" />

                  <Button variant="outline" size="sm" className="hidden lg:inline-flex" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="hidden lg:inline-flex" asChild>
                    <Link to="/register">Create Account</Link>
                  </Button>
                </>
              )
            )}

            {!isAuthenticated && !authLoading && (
              <>
                <ThemeToggle className="lg:hidden" />

                <Button variant="ghost" size="icon" className="lg:hidden" asChild>
                  <Link to="/login">
                    <Icon name="LogIn" size={18} />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="lg:hidden" asChild>
                  <Link to="/register">
                    <Icon name="UserPlus" size={18} />
                  </Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={handleMobileMenuToggle}
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <div key={item?.path}>
                  {item?.hasSubNav ? (
                    <>
                      <button
                        onClick={handleLeagueClick}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                          isLeagueRoute()
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name={item?.icon} size={18} />
                          <span>{item?.label}</span>
                        </div>
                        <Icon 
                          name="ChevronDown" 
                          size={16} 
                          className={`transition-transform ${isLeagueSubNavOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isLeagueSubNavOpen && (
                        <div className="ml-6 mt-2 space-y-1">
                          {item?.subItems?.map((subItem) => (
                            <Link
                              key={subItem?.path}
                              to={subItem?.path}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-micro ${
                                isActiveRoute(subItem?.path)
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Icon name={subItem?.icon} size={16} />
                              <span>{subItem?.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item?.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                        isActiveRoute(item?.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon name={item?.icon} size={18} />
                        <span>{item?.label}</span>
                      </div>
                      {item?.badge && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                          {item?.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Theme Toggle for Mobile - Always show */}
            <div className="px-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeToggle size="sm" />
              </div>
            </div>

            {!isAuthenticated && !authLoading && (
              <div className="px-4 pb-4">
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <Button variant="default" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/register">Create Account</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <nav className="flex items-center justify-around py-2">
          {navigationItems?.slice(0, 4)?.map((item) => (
            <Link
              key={item?.path}
              to={item?.hasSubNav ? '/league-management' : item?.path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-micro ${
                (item?.hasSubNav && isLeagueRoute()) || isActiveRoute(item?.path)
                  ? 'text-primary' :'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon name={item?.icon} size={20} />
                {item?.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 text-xs font-medium bg-accent text-accent-foreground rounded-full flex items-center justify-center">
                    {item?.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item?.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;