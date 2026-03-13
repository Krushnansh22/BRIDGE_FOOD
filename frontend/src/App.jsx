import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import DonorListings from './pages/DonorListings';
import CreateListing from './pages/CreateListing';
import DonorListingDetail from './pages/DonorListingDetail';
import NgoFeed from './pages/NgoFeed';
import NgoListingDetail from './pages/NgoListingDetail';
import NgoRequests from './pages/NgoRequests';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function PrivateRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function DefaultRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'donor' ? '/donor' : '/ngo/feed'} replace />;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Donor */}
      <Route path="/donor" element={
        <PrivateRoute role="donor">
          <AppLayout><DonorListings /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/donor/create" element={
        <PrivateRoute role="donor">
          <AppLayout><CreateListing /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/donor/listing/:id" element={
        <PrivateRoute role="donor">
          <AppLayout><DonorListingDetail /></AppLayout>
        </PrivateRoute>
      } />

      {/* NGO */}
      <Route path="/ngo/feed" element={
        <PrivateRoute role="ngo">
          <AppLayout><NgoFeed /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/ngo/listing/:id" element={
        <PrivateRoute role="ngo">
          <AppLayout><NgoListingDetail /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/ngo/requests" element={
        <PrivateRoute role="ngo">
          <AppLayout><NgoRequests /></AppLayout>
        </PrivateRoute>
      } />

      {/* Shared */}
      <Route path="/notifications" element={
        <PrivateRoute>
          <AppLayout><Notifications /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <AppLayout><Profile /></AppLayout>
        </PrivateRoute>
      } />

      {/* Default */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
