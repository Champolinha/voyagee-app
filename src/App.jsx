import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryPage from './pages/ItineraryPage';
import ExpensesPage from './pages/ExpensesPage';
import BottomNav from './components/BottomNav';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';

import ChangePasswordModal from './components/ChangePasswordModal';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AuthenticatedLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const location = useLocation();

  // Extract tripId from URL if present
  const tripMatch = location.pathname.match(/\/trip\/([^/]+)/);
  const selectedTripId = tripMatch ? tripMatch[1] : null;

  return (
    <>
      <Outlet />
      <BottomNav
        selectedTripId={selectedTripId}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onProfileClick={() => { setSettingsOpen(false); setProfileOpen(true); }}
          onPasswordClick={() => { setSettingsOpen(false); setPasswordOpen(true); }}
        />
      )}
      {profileOpen && (
        <ProfileModal onClose={() => setProfileOpen(false)} />
      )}
      {passwordOpen && (
        <ChangePasswordModal onClose={() => setPasswordOpen(false)} />
      )}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/trip/:tripId" element={<TripDetailPage />} />
          <Route path="/trip/:tripId/itinerary" element={<ItineraryPage />} />
          <Route path="/trip/:tripId/expenses" element={<ExpensesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
