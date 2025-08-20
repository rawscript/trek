
import React from 'react';
import { motion } from 'framer-motion';
import { Fundraiser } from '../../types';
import ProgressBar from './ProgressBar';

interface FundraiserCardProps {
  fundraiser: Fundraiser;
  onClick: () => void;
}

const FundraiserCard: React.FC<FundraiserCardProps> = ({ fundraiser, onClick }) => {
  const { title, creator, goal, currentAmount } = fundraiser;
  const progress = (currentAmount / goal) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-white dark:bg-gray-800 p-5 shadow-md transition-shadow hover:shadow-lg"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <img src={creator.avatarUrl} alt={creator.name} className="h-10 w-10 rounded-full" />
        <div>
            <h3 className="font-bold text-brand-dark dark:text-brand-light">{title}</h3>
            <p className="text-sm text-brand-gray dark:text-gray-400">by {creator.name}</p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar progress={progress} />
        <div className="mt-2 flex justify-between text-sm">
          <p className="font-semibold text-brand-dark dark:text-brand-light">${currentAmount.toLocaleString()} <span className="font-normal text-brand-gray dark:text-gray-400">raised</span></p>
          <p className="text-brand-gray dark:text-gray-400">Goal: ${goal.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FundraiserCard;