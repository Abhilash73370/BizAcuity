import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { isAuthenticated } from '../utils/auth';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registeredUser, handleLogout } = useContext(UserContext);
  const isLoggedIn = isAuthenticated();

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-primary-dark text-secondary text-center py-6 px-4 shadow-xl font-bold font-poppins flex items-center justify-between">
      <Link to="/" className="text-2xl font-extrabold tracking-tight hover:underline">
        Picture Wall Designer
      </Link>
      <nav className="flex gap-4 text-lg items-center">
        <Link to="/" className={`hover:underline ${location.pathname === '/' ? 'underline' : ''}`}>Home</Link>
        <Link to="/wall" className={`hover:underline ${location.pathname === '/wall' ? 'underline' : ''}`}>Wall</Link>
        {isLoggedIn ? (
          <>
            <Link to="/user" className={`hover:underline ${location.pathname === '/user' ? 'underline' : ''}`}>User</Link>
            <button onClick={onLogout} className="hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={`hover:underline ${location.pathname === '/login' ? 'underline' : ''}`}>Login</Link>
            <Link to="/register" className={`hover:underline ${location.pathname === '/register' ? 'underline' : ''}`}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header; 