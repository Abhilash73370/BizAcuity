import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';
import { isAuthenticated, getAuthUser, removeAuthUser, removeToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const { registeredUser, setRegisteredUser } = useContext(UserContext);

  useEffect(() => {
    // Check if user data exists but no valid token
    if (registeredUser?.isLoggedIn && !isAuthenticated()) {
      // Token expired or removed, logout user
      removeAuthUser();
      removeToken();
      setRegisteredUser(null);
    }
  }, [registeredUser, setRegisteredUser]);

  // Check both token and user data
  if (!isAuthenticated() || !getAuthUser()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 