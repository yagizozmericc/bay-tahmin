import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
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

  const handleLeagueClick = () => {
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
          {/* Logo */}
          <Link to="/user-dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Icon name="Target" size={24} color="white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Bay Tahmin</h1>
              <p className="text-xs text-muted-foreground font-medium">Pro</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <div key={item?.path} className="relative">
                {item?.hasSubNav ? (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden lg:inline-flex"
                >
                  <Icon name="Bell" size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
                </Button>

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