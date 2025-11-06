// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/NewAuthContext';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requireAdmin?: boolean;
// }

// export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
//   const { user, loading, isAdmin } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requireAdmin && !isAdmin) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <>{children}</>;
// }




interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // ✅ Allow everything — no auth or admin restrictions
  return <>{children}</>;
}
