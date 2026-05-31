import { Navigate } from 'react-router-dom';

const ROLE_LOGIN = {
  applicant:   '/applicant/login',
  institution: '/company/login',
  admin:       '/company/login',
};

/**
 * Wraps a route element with auth + role checks.
 * - No token              → redirect to the appropriate login page
 * - Wrong role            → redirect to home (/)
 * - Correct role (or none required) → render the element
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token    = localStorage.getItem('token');
  const userType = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').userType; } catch { return null; }
  })();

  if (!token) {
    const loginPath = allowedRoles ? ROLE_LOGIN[allowedRoles[0]] || '/applicant/login' : '/applicant/login';
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
