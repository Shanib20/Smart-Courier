import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateDelivery from './pages/CreateDelivery';
import MyDeliveries from './pages/MyDeliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import TrackParcel from './pages/TrackParcel';
import Support from './pages/Support';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ForcePasswordChange from './pages/ForcePasswordChange';

import Profile from './pages/Profile';
import UpdateTracking from './pages/UpdateTracking';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminDeliveries from './pages/AdminDeliveries';
import Reports from './pages/Reports';
import HubsManagement from './pages/HubsManagement';
import UserManagement from './pages/UserManagement';
import PricingManagement from './pages/admin/PricingManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Group: No Layout Chrome */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/force-password-change" element={<ForcePasswordChange />} />

        {/* Public Routes with Layout (if any, like track) */}
        <Route element={<Layout />}>
          <Route path="/track" element={<TrackParcel />} />
          
          {/* Protected Group (Both Customer and Admin) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deliveries" element={<MyDeliveries />} />
            <Route path="/deliveries/new" element={<CreateDelivery />} />
            <Route path="/deliveries/:id" element={<DeliveryDetail />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected ADMIN Group */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/deliveries" element={<AdminDeliveries />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/hubs" element={<HubsManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/pricing" element={<PricingManagement />} />
            <Route path="/admin/tracking/update/:id" element={<UpdateTracking />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
