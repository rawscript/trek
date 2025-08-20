import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-2" aria-label="Thinking...">
      <svg
        width="40"
        height="20"
        viewBox="0 0 40 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 5,10 C 5,0 15,0 15,10 C 15,20 25,20 25,10 C 25,0 35,0 35,10"
          stroke="currentColor"
          className="text-brand-green"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
            opacity: { duration: 0.1 }
          }}
        />
      </svg>
    </div>
  );
};

export default Loader;
