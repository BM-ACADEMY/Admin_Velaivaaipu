import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
    <Loader2 className="h-10 w-10 text-primary animate-spin" />
    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading experience...</span>
  </div>
);

// Redirect logged-in users away from login/register to their dashboard
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) {
    const roleRedirects = {
      admin: '/admin/dashboard',
      subadmin: '/subadmin',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }
  return children;
};

// Protect authenticated routes. If roles provided, also enforces role check.
// If permissionKey is provided, additionally restricts team-managed recruiters (an org's
// delegated team member, not the company owner or a solo recruiter) to only the pages
// their admin has explicitly granted.
export const PrivateRoute = ({ children, roles, permissionKey }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const roleRedirects = {
      admin: '/admin/dashboard',
      subadmin: '/subadmin',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }
  if (
    permissionKey &&
    user.role === 'recruiter' &&
    user.isTeamManaged === true &&
    !(user.teamPermissions || []).includes(permissionKey)
  ) {
    return <Navigate to="/company/dashboard" replace />;
  }
  return children;
};
