import React, { useContext, useEffect, useState } from 'react';
import Header from '../components/Header';
import { UserContext } from '../App';

const User = () => {
  const { registeredUser } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    if (registeredUser && registeredUser.isLoggedIn) {
      setLoading(true);
      fetch(`http://localhost:5001/user/${registeredUser.id}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch user info');
          setLoading(false);
        });
    }
  }, [registeredUser]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous messages
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setUpdateError('');
    setUpdateSuccess('');
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setUpdateError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setUpdateError('New password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/user/update-password/${registeredUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      // Clear form and show success message
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Set success message and keep it visible
      setUpdateSuccess('Password updated successfully!');
      
      // Wait 3 seconds before hiding the form
      setTimeout(() => {
        setIsUpdatingPassword(false);
        setUpdateSuccess(''); // Clear success message when form is hidden
      }, 1000);
      
    } catch (err) {
      setUpdateError(err.message || 'Failed to update password');
    }
  };

  if (!registeredUser || !registeredUser.isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1e6cb' }}>
        <Header />
        <main className="flex-1 flex items-center justify-end px-4 py-8 md:px-8 lg:px-12">
          <div className="w-full md:w-[500px] lg:w-[40%]">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <div className="text-center text-xl text-red-600">
                You are not logged in.
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1e6cb' }}>
        <Header />
        <main className="flex-1 flex items-center justify-end px-4 py-8 md:px-8 lg:px-12">
          <div className="w-full md:w-[500px] lg:w-[40%]">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-primary-dark mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl text-primary-dark">Loading user info...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1e6cb' }}>
        <Header />
        <main className="flex-1 flex items-center justify-end px-4 py-8 md:px-8 lg:px-12">
          <div className="w-full md:w-[500px] lg:w-[40%]">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-center">
                {error}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1e6cb' }}>
      <Header />
      <main className="flex-1 flex items-center justify-end px-4 py-8 md:px-8 lg:px-12">
        <div className="w-full md:w-[500px] lg:w-[40%] space-y-8">
          {/* Welcome Text */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#625d8c' }}>
              User Profile
            </h2>
            <p className="text-gray-600">
              View and manage your account details
            </p>
          </div>

          {/* User Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm">
                  {user.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm">
                  {user.email}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsUpdatingPassword(!isUpdatingPassword)}
                  className="w-full py-3 px-6 rounded-xl text-white font-semibold
                           bg-primary-dark hover:bg-primary
                           transition-all duration-200 shadow-md
                           hover:shadow-lg hover:scale-[1.02]"
                >
                  {isUpdatingPassword ? 'Cancel Password Update' : 'Update Password'}
                </button>
              </div>

              {/* Password Update Form */}
              {isUpdatingPassword && (
                <form onSubmit={handleUpdatePassword} className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                               focus:border-purple-500 transition-all duration-200
                               bg-white/50 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                               focus:border-purple-500 transition-all duration-200
                               bg-white/50 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                               focus:border-purple-500 transition-all duration-200
                               bg-white/50 backdrop-blur-sm"
                      required
                    />
                  </div>

                  {updateError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="p-4 rounded-xl bg-[#eee3cb] border border-[#967e76] text-[#967e76] text-sm font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {updateSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl text-white font-semibold
                             bg-primary-dark hover:bg-primary
                             transition-all duration-200 shadow-md
                             hover:shadow-lg hover:scale-[1.02]"
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default User; 