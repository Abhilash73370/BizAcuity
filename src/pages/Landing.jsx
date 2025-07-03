import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
        <h1 className="text-4xl font-extrabold text-primary-dark mb-2">Picture Wall Designer</h1>
        <p className="text-lg text-primary-dark mb-8">Create your own wall with custom backgrounds and draggable images!</p>
        <button
          className="bg-primary-dark text-secondary px-8 py-3 rounded-lg text-lg font-bold shadow-md hover:bg-primary transition"
          onClick={() => navigate('/wall')}
        >
          Start Designing
        </button>
      </div>
    </>
  );
};

export default Landing; 