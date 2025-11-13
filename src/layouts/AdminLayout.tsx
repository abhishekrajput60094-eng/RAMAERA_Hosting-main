import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Server,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Gift,
  Package
} from 'lucide-react';
import { useUserStore } from '../store/authStore';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/servers', icon: Server, label: 'Server Management' },
    { to: '/admin/plans', icon: Package, label: 'Plans Management' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders Management' },
    { to: '/admin/referrals', icon: Gift, label: 'Referral Management' },
    { to: '/admin/support', icon: MessageSquare, label: 'Support Management' },
  ];

  return (
    // Add lg:pl-64 so content clears the fixed sidebar on large screens
    <div className="min-h-screen bg-slate-950 lg:pl-64">
      {/* Sidebar */}
      <aside
        className={[
          // mobile drawer behavior
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // styling
          'bg-slate-900 border-r border-red-500/20',
          // large screens: keep it fixed, visible, full height, and non-scrollable
          'lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:h-screen lg:overflow-hidden'
        ].join(' ')}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-red-500/20">
            <Link to="/admin" className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-red-400" />
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Remove overflow-y-auto so the aside itself doesn't scroll */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-slate-300 hover:bg-slate-950'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}

            <Link
              to="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-950 transition border-t border-red-500/20 mt-4 pt-4"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Switch to User Panel</span>
            </Link>
          </nav>

          <div className="border-t border-red-500/20 p-4">
            <div className="flex items-center space-x-3 px-4 py-3 bg-slate-950 rounded-lg mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-red-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content area (scrolls) */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-b border-red-500/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-300 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Administration</h1>
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-red-400">ADMIN MODE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
