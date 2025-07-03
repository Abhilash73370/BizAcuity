import React, { useContext } from 'react';
import Header from '../components/Header';
import { UserContext } from '../App';

const User = () => {
  const { registeredUser } = useContext(UserContext);

  if (!registeredUser || !registeredUser.isLoggedIn) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
          <div className="bg-white p-8 rounded shadow text-center text-xl text-red-600">
            You are not logged in.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
        <div className="bg-white p-8 rounded shadow w-96">
          <h2 className="text-2xl font-bold mb-6 text-primary-dark">User Details</h2>
          <div className="mb-4 text-lg"><span className="font-semibold">Name:</span> {registeredUser.name}</div>
          <div className="mb-4 text-lg"><span className="font-semibold">Email:</span> {registeredUser.email}</div>
          <div className="mb-4 text-lg"><span className="font-semibold">Password:</span> {registeredUser.password}</div>
        </div>
      </div>
    </>
  );
};

export default User; 