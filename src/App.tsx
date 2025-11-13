import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TawkToWidget } from './components/TawkToWidget';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { DedicatedServers } from './pages/DedicatedServers';
import { Solutions } from './pages/Solutions';
import { Contact } from './pages/Contact';
import { Calculator } from './pages/Calculator';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

import { Overview } from './pages/dashboard/Overview';
import { MyServers } from './pages/dashboard/MyServers';
import { Referrals } from './pages/dashboard/Referrals';
import { Billing } from './pages/dashboard/Billing';
import { Support } from './pages/dashboard/Support';
import { Settings } from './pages/dashboard/Settings';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ReferralManagement } from './pages/admin/ReferralManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { ServerManagement } from './pages/admin/ServerManagement';
import { PlansManagement } from './pages/admin/PlansManagement';
import { OrdersManagement } from './pages/admin/OrdersManagement';
import { SupportManagement } from './pages/admin/SupportManagement';
import SplashCursor from './components/SplashCurser';

function App() {
  return (
    <>
    {/* <SplashCursor/> */}
    <BrowserRouter>
        <TawkToWidget hideOnRoutes={['/login', '/signup']} />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/dedicated-servers" element={<DedicatedServers />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="servers" element={<MyServers />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="servers" element={<ServerManagement />} />
            <Route path="plans" element={<PlansManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="referrals" element={<ReferralManagement />} />
            <Route path="support" element={<SupportManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
