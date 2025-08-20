import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenName } from '../../types';
import { useFundraiser } from '../../hooks/useFundraiser';
import FundraiserCard from '../ui/FundraiserCard';

interface FundraiserListScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
  setSelectedFundraiserId: (id: string) => void;
}

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);


const FundraiserListScreen: React.FC<FundraiserListScreenProps> = ({ setActiveScreen, setSelectedFundraiserId }) => {
  const { fundraisers } = useFundraiser();

  const handleSelectFundraiser = (id: string) => {
    setSelectedFundraiserId(id);
    setActiveScreen('FundraiserDetail');
  };

  return (
    <div>
       <div className="mb-6 flex items-center gap-4">
            <button onClick={() => setActiveScreen('Home')} className="text-brand-dark dark:text-brand-light">
                <ArrowLeftIcon />
            </button>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Campaigns</h1>
        </div>

      <div className="mb-6">
        <button
          onClick={() => setActiveScreen('CreateFundraiser')}
          className="w-full rounded-lg bg-brand-green py-3 font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-100"
        >
          + Create Your Own Campaign
        </button>
      </div>

      <AnimatePresence>
        <div className="space-y-4">
          {fundraisers.map(fundraiser => (
            <FundraiserCard
              key={fundraiser.id}
              fundraiser={fundraiser}
              onClick={() => handleSelectFundraiser(fundraiser.id)}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default FundraiserListScreen;