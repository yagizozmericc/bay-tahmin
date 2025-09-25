import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLeagueSubNavOpen, setIsLeagueSubNavOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
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
      badge: null
    },
    {
      label: 'Results',
      path: '/match-results',
      icon: 'Calendar',
      badge: null
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

      if (notificationMenuRef?.current && !notificationMenuRef?.current?.contains(event?.target)) {
        setIsNotificationMenuOpen(false);
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
      setIsNotificationMenuOpen(false);
      // Stop listening to notifications
      if (user?.uid) {
        notificationService.stopListening(user.uid);
      }
    } else if (user?.uid) {
      // Start listening to notifications when authenticated
      const unsubscribe = notificationService.listenToNotifications(user.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, user?.uid]);

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

  const handleNotificationMenuToggle = () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    setIsNotificationMenuOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsNotificationMenuOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;

    try {
      await notificationService.markAllAsRead(user.uid);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();

    try {
      await notificationService.deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Scorism Logo */}
          <Link to="/user-dashboard" className="flex items-center space-x-3 group">
            {/* Simple Logo Container */}
            <div className="relative">
              {/* Main Logo Container */}
              <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105 flex items-center justify-center">
                {/* Simple Icon */}
                <Icon
                  name="Zap"
                  size={20}
                  color="white"
                  strokeWidth={2}
                  className="drop-shadow-sm"
                />
              </div>
            </div>

            {/* Scorism Text */}
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-green-600 group-hover:text-green-500 transition-colors duration-200">
                Scorism
              </h1>
              <p className="text-xs text-green-500/70 font-medium">Predict & Score</p>
            </div>

            {/* Mobile Compact Version */}
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-green-600 group-hover:text-green-500 transition-colors duration-200">
                Scorism
              </h1>
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

                <div className="relative hidden lg:inline-flex" ref={notificationMenuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNotificationMenuToggle}
                    className="relative"
                  >
                    <Icon name="Bell" size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full text-xs font-medium flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Notification Dropdown */}
                  {isNotificationMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 animate-scale-in z-50">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            <Icon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                                notification.read
                                  ? 'border-transparent'
                                  : 'border-primary bg-primary/5'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  notification.priority === 'high'
                                    ? 'bg-accent/10 text-accent'
                                    : notification.priority === 'medium'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  <Icon name={notification.icon || 'Bell'} size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-foreground truncate">
                                      {notification.title}
                                    </h4>
                                    <button
                                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                                    >
                                      <Icon name="X" size={12} />
                                    </button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notificationService.getTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-border">
                          <Link
                            to="/notifications"
                            className="text-xs text-primary hover:text-primary/80 transition-colors block text-center"
                            onClick={() => setIsNotificationMenuOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Notification Button */}
                <div className="relative lg:hidden" ref={notificationMenuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNotificationMenuToggle}
                    className="relative"
                  >
                    <Icon name="Bell" size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground rounded-full text-xs font-medium flex items-center justify-center">
                        {unreadCount > 9 ? '9' : unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Mobile Notification Dropdown */}
                  {isNotificationMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 animate-scale-in z-50">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-muted-foreground">
                            <Icon name="Bell" size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${
                                notification.read
                                  ? 'border-transparent'
                                  : 'border-primary bg-primary/5'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                  notification.priority === 'high'
                                    ? 'bg-accent/10 text-accent'
                                    : notification.priority === 'medium'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  <Icon name={notification.icon || 'Bell'} size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-foreground truncate">
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notificationService.getTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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