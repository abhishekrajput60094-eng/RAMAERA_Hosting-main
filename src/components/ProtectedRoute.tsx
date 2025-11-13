import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/authStore'; // Import useUserStore

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireSuperAdmin }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useUserStore(); // Get user, loading, isAuthenticated from the store

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
