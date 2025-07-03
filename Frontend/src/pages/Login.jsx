import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { registeredUser, setRegisteredUser } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      registeredUser &&
      email === registeredUser.email &&
      password === registeredUser.password
    ) {
      setError('');
      setRegisteredUser({ ...registeredUser, isLoggedIn: true });
      navigate('/wall');
    } else {
      setError('Invalid email or password, or user not registered.');
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
        <h2 className="text-2xl font-bold mb-4">Login Page</h2>
        <form className="flex flex-col gap-4 w-80 bg-white p-8 rounded shadow" onSubmit={handleLogin}>
          <label className="flex flex-col text-left">
            Email
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border rounded px-3 py-2 mt-1"
              required
            />
          </label>
          <label className="flex flex-col text-left">
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border rounded px-3 py-2 mt-1"
              required
            />
          </label>
          <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold mt-4">Login</button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="mt-4 text-base text-primary-dark">
           <Link to="/register" className="text-primary-dark underline hover:text-primary">If new user register here</Link>
        </div>
      </div>
    </>
  );
};

export default Login;