import React from 'react';
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Chaaya</h1>
        <p className="text-xl mb-8">
          Your personal space to reflect and understand your mental well-being.
        </p>
        <p className="text-lg mb-8">
          Chaaya helps you identify patterns in your daily life, providing insights that empower you to take control of your mental health. Our unique check-in process is designed to be quick, intuitive, and insightful.
        </p>
        <button
          onClick={() => setLocation('/app')}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
