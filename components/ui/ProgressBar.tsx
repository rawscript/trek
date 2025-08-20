import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // A value between 0 and 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
};

export default ProgressBar;
