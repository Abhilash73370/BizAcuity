import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';

const ProtectedRoute = ({ children }) => {
  const { registeredUser } = useContext(UserContext);

  if (!registeredUser || !registeredUser.isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 