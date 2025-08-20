import React from 'react';
import { Fundraiser } from '../../types';
import ProgressBar from './ProgressBar';

interface FundraiserShareCardProps {
  fundraiser: Fundraiser;
  onClick: () => void;
}

const FundraiserShareCard: React.FC<FundraiserShareCardProps> = ({ fundraiser, onClick }) => {
  const { title, creator, goal, currentAmount, description, imageUrl } = fundraiser;
  const progress = (currentAmount / goal) * 100;
  
  return (
    <div className="relative cursor-pointer overflow-hidden rounded-xl shadow-lg" onClick={onClick}>
      <img src={imageUrl} alt={title} className="aspect-[4/5] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
        <div className="flex items-center gap-3">
          <img src={creator.avatarUrl} alt={creator.name} className="h-12 w-12 rounded-full border-2 border-white" />
          <div>
            <p className="font-bold">{creator.name}</p>
            <p className="text-sm text-gray-200">started a new campaign!</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">{description}</p>
          <div className="mt-3">
            <ProgressBar progress={progress} />
            <div className="mt-2 flex justify-between text-xs">
              <p><span className="font-semibold">${currentAmount.toLocaleString()}</span> raised</p>
              <p>Goal: <span className="font-semibold">${goal.toLocaleString()}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraiserShareCard;