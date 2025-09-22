import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LeagueManagement from './pages/league-management';
import UserDashboard from './pages/user-dashboard';
import MatchPredictions from './pages/match-predictions';
import LeaderboardsPage from './pages/league-leaderboards';
import UserProfile from './pages/user-profile';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<LeaderboardsPage />} />
        <Route path="/league-management" element={<LeagueManagement />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/match-predictions" element={<MatchPredictions />} />
        <Route path="/league-leaderboards" element={<LeaderboardsPage />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
