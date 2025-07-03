import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setRegisteredUser } = useContext(UserContext);

  const handleRegister = (e) => {
    e.preventDefault();
    setRegisteredUser({ name, email, password });
    navigate('/login');
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
        <h2 className="text-2xl font-bold mb-4">Register Page</h2>
        <form className="flex flex-col gap-4 w-80 bg-white p-8 rounded shadow" onSubmit={handleRegister}>
          <label className="flex flex-col text-left">
            Name
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="border rounded px-3 py-2 mt-1"
              required
            />
          </label>
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
          <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold mt-4">Register</button>
          <div className="mt-4 text-base text-primary-dark text-center">
            <a href="/login" className="text-primary-dark underline hover:text-primary">Already a user? Then Login directly</a>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;
