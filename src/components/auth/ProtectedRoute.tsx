import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireAll?: boolean; // If true, user must have ALL roles; if false (default), user needs at least one
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAll = false 
}: ProtectedRouteProps) {
  const { user, roles, loading, is2FARequired, is2FAEnabled } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if 2FA is required but not enabled
  if (is2FARequired && !is2FAEnabled && location.pathname !== '/setup-2fa') {
    return <Navigate to="/setup-2fa" state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = requireAll
      ? allowedRoles.every(role => roles.includes(role))
      : allowedRoles.some(role => roles.includes(role));

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
