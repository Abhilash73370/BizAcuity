import React, { useState, useContext, useEffect } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { isAuthenticated } from '../utils/auth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registeredUser } = useContext(UserContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/landing', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password: password.trim() 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Redirect to login page with success message
      navigate('/login', { 
        replace: true,
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1e6cb' }}>
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-end px-4 py-8 md:px-8 lg:px-12">
        <div className="w-full md:w-[500px] lg:w-[40%] space-y-8">
          {/* Welcome Text */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#625d8c' }}>
              Create Account
            </h2>
            <p className="text-gray-600">
              Join us and start designing your perfect wall
            </p>
          </div>

          {/* Register Form */}
          <form 
            onSubmit={handleRegister}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-6"
          >
            {/* Name Field */}
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                         focus:border-purple-500 transition-all duration-200
                         bg-white/50 backdrop-blur-sm"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                         focus:border-purple-500 transition-all duration-200
                         bg-white/50 backdrop-blur-sm"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                         focus:border-purple-500 transition-all duration-200
                         bg-white/50 backdrop-blur-sm"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-3 px-6 rounded-xl text-white font-semibold
                       bg-primary-dark hover:bg-primary
                       transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-lg hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <Link 
                to="/login" 
                className="text-primary-dark hover:text-primary font-medium 
                         transition-colors duration-200"
              >
                Already have an account? Login here
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;