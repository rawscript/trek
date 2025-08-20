

import React, { useState } from 'react';
import { ScreenName, User } from '../../types';
import { useFundraiser } from '../../hooks/useFundraiser';
import { useAuth } from '../../hooks/useAuth';
import ProgressBar from '../ui/ProgressBar';
import { motion } from 'framer-motion';
import DonationModal from '../ui/DonationModal';

interface FundraiserDetailScreenProps {
  fundraiserId: string | null;
  setActiveScreen: (screen: ScreenName) => void;
}

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const FundraiserDetailScreen: React.FC<FundraiserDetailScreenProps> = ({ fundraiserId, setActiveScreen }) => {
  const { fundraisers, addDonation } = useFundraiser();
  const { user } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const fundraiser = fundraisers.find(f => f.id === fundraiserId);

  if (!fundraiser) {
    return (
      <div className="text-center dark:text-gray-300">
        <p>Fundraiser not found.</p>
        <button onClick={() => setActiveScreen('FundraiserList')} className="mt-4 text-brand-blue">Go Back</button>
      </div>
    );
  }

  const handleDonateSubmit = (amount: number, message: string) => {
    if (user) {
        addDonation(fundraiser.id, amount, {
          name: user.name,
          avatarUrl: user.avatarUrl,
          message: message || undefined,
        });
    }
  };

  const progress = (fundraiser.currentAmount / fundraiser.goal) * 100;

  const isCreator = user?.id === fundraiser.creator.id;
  const hasPayoutInfo = !!fundraiser.creator.payoutDetails;
  const canDonate = !isCreator && hasPayoutInfo;
  
  let disabledMessage = '';
  if (isCreator) {
      disabledMessage = "You cannot donate to your own campaign.";
  } else if (!hasPayoutInfo) {
      disabledMessage = `${fundraiser.creator.name} has not set up a payout account yet.`;
  }

  return (
    <div>
      <div className="mb-4 flex items-center">
        <button onClick={() => setActiveScreen('FundraiserList')} className="text-brand-dark dark:text-brand-light p-2 -ml-2">
            <ArrowLeftIcon />
        </button>
      </div>

      <div className="relative mb-6">
          <div className="overflow-hidden rounded-2xl shadow-lg">
              <img src={fundraiser.imageUrl} alt={fundraiser.title} className="h-48 w-full object-cover" />
          </div>
          <div className="absolute -bottom-8 left-4 flex items-center gap-3">
              <img src={fundraiser.creator.avatarUrl} alt={fundraiser.creator.name} className="h-16 w-16 rounded-full border-4 border-brand-light dark:border-brand-dark" />
          </div>
      </div>
      
      <div className="pt-8">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-light">{fundraiser.title}</h1>
        <p className="text-md text-brand-gray dark:text-gray-400">by {fundraiser.creator.name}</p>
      </div>
      
      {/* Progress Section */}
      <div className="mt-4 rounded-xl bg-white dark:bg-gray-800 p-5 shadow-md">
        <p className="text-center text-brand-gray dark:text-gray-400">Raised</p>
        <p className="text-center text-4xl font-bold text-brand-dark dark:text-brand-light">${fundraiser.currentAmount.toLocaleString()}</p>
        <p className="mb-4 text-center text-sm text-brand-gray dark:text-gray-400">of ${fundraiser.goal.toLocaleString()} goal</p>
        <ProgressBar progress={progress} />
      </div>

      {/* Donate Button */}
      <div className="my-6">
        <button 
          onClick={() => setIsDonationModalOpen(true)}
          disabled={!canDonate}
          className="w-full rounded-lg bg-brand-green py-4 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-100 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none disabled:hover:scale-100"
        >
          Donate Now
        </button>
        {!canDonate && (
            <p className="mt-2 text-center text-sm text-brand-gray dark:text-gray-400">{disabledMessage}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-brand-dark dark:text-brand-light">About this campaign</h2>
        <p className="mt-2 text-brand-gray dark:text-gray-400 whitespace-pre-wrap">{fundraiser.description}</p>
      </div>

      {/* Supporters */}
      <div>
        <h2 className="text-lg font-bold text-brand-dark dark:text-brand-light">Supporters ({fundraiser.supporters.length})</h2>
        <div className="mt-4 space-y-3">
          {fundraiser.supporters.map((supporter, index) => (
             <motion.div 
                key={supporter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm"
              >
              <img src={supporter.avatarUrl} alt={supporter.name} className="h-10 w-10 rounded-full" />
              <div>
                <p className="font-semibold text-brand-dark dark:text-brand-light">{supporter.name} <span className="font-normal text-brand-green">donated ${supporter.amount}</span></p>
                {supporter.message && <p className="mt-1 text-sm text-brand-gray dark:text-gray-400 italic">"{supporter.message}"</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onSubmit={handleDonateSubmit}
        fundraiserTitle={fundraiser.title}
      />
    </div>
  );
};

export default FundraiserDetailScreen;