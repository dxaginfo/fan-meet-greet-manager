import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { checkAuthStatus } from './store/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import EventList from './pages/events/EventList';
import EventCreate from './pages/events/EventCreate';
import EventDetail from './pages/events/EventDetail';
import FanList from './pages/fans/FanList';
import FanDetail from './pages/fans/FanDetail';
import RegistrationList from './pages/registrations/RegistrationList';
import RegistrationDetail from './pages/registrations/RegistrationDetail';
import CheckIn from './pages/check-in/CheckIn';
import Analytics from './pages/analytics/Analytics';
import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Protected route handling
  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
    
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && isPublicRoute) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    // You could render a loading spinner here
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">Loading...</Box>;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        
        {/* Event routes */}
        <Route path="/events" element={<EventList />} />
        <Route path="/events/create" element={<EventCreate />} />
        <Route path="/events/:id" element={<EventDetail />} />
        
        {/* Fan routes */}
        <Route path="/fans" element={<FanList />} />
        <Route path="/fans/:id" element={<FanDetail />} />
        
        {/* Registration routes */}
        <Route path="/registrations" element={<RegistrationList />} />
        <Route path="/registrations/:id" element={<RegistrationDetail />} />
        
        {/* Check-in */}
        <Route path="/check-in/:eventId?" element={<CheckIn />} />
        
        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Settings & Profile */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;