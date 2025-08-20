
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-brand-dark p-8 text-white">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="text-center"
      >
        <BicycleIcon />
        <h1 className="mt-4 text-5xl font-bold">Trekly</h1>
        <p className="mt-2 text-brand-gray">Your cycling adventure starts here.</p>
      </motion.div>

      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="mt-12 w-full"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-lg border-2 border-brand-gray bg-transparent p-4 text-center text-white placeholder-gray-500 transition focus:border-brand-green focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-brand-green p-4 font-bold text-brand-dark transition hover:bg-emerald-400 disabled:opacity-50"
          disabled={!name.trim()}
        >
          Start Your Journey
        </button>
      </motion.form>
    </div>
  );
};

const BicycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14l-3 3-3-3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 6.343l1.414 1.414m8.486 8.486l1.414 1.414M12 3v1m0 16v1m-6.343 2.657l-1.414-1.414m0-11.314l1.414-1.414" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
);


export default LoginScreen;
