

import React, { createContext, useState, ReactNode } from 'react';
import { Fundraiser, Supporter, User } from '../types';
import { useNotification } from '../hooks/useNotification';

interface FundraiserContextType {
  fundraisers: Fundraiser[];
  addFundraiser: (fundraiser: Omit<Fundraiser, 'id' | 'supporters' | 'currentAmount' | 'timestamp'>) => void;
  addDonation: (fundraiserId: string, amount: number, supporter: Omit<Supporter, 'id' | 'amount'>) => void;
}

export const FundraiserContext = createContext<FundraiserContextType | undefined>(undefined);

const mockUser1: User = { 
    id: '1', 
    name: 'Alex Ride', 
    avatarUrl: 'https://i.pravatar.cc/150?u=alex', 
    payoutDetails: { 
        method: 'bank',
        accountHolderName: 'Alex R.', 
        accountNumber: '**** **** **** 1234', 
        routingNumber: '***-**-56' 
    } 
};
const mockUser2: User = { id: '102', name: 'Mia Runner', avatarUrl: 'https://i.pravatar.cc/150?u=mia' };

const mockSupporters: Supporter[] = [
    { id: 's1', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', amount: 50, message: 'Go for it!' },
    { id: 's2', name: 'Diana', avatarUrl: 'https://i.pravatar.cc/150?u=diana', amount: 25, message: 'Happy to support!' },
];

const mockFundraisers: Fundraiser[] = [
  {
    id: 'fund1',
    creator: mockUser1,
    title: 'Cycle Across the Alps',
    description: 'I\'m embarking on a challenging journey to cycle across the Alps to raise money for new cycling equipment for underprivileged kids. Every donation helps!',
    goal: 5000,
    currentAmount: 2850,
    supporters: mockSupporters,
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    imageUrl: 'https://picsum.photos/seed/alps-cycle/800/450',
  },
  {
    id: 'fund2',
    creator: mockUser2,
    title: 'Marathon for Clean Water',
    description: 'Running my first full marathon to support charities that provide clean drinking water to communities in need. Your contribution, big or small, makes a huge difference.',
    goal: 3000,
    currentAmount: 1200,
    supporters: [{ id: 's3', name: 'Ethan', avatarUrl: 'https://i.pravatar.cc/150?u=ethan', amount: 100 }],
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    imageUrl: 'https://picsum.photos/seed/water-run/800/450',
  },
];

export const FundraiserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>(mockFundraisers);
  const { addNotification } = useNotification();

  const addFundraiser = (fundraiser: Omit<Fundraiser, 'id' | 'supporters' | 'currentAmount' | 'timestamp'>) => {
    const newFundraiser: Fundraiser = {
      ...fundraiser,
      id: `fund${Date.now()}`,
      currentAmount: 0,
      supporters: [],
      timestamp: new Date().toISOString(),
    };
    setFundraisers(prev => [newFundraiser, ...prev]);
  };

  const addDonation = (fundraiserId: string, amount: number, supporter: Omit<Supporter, 'id' | 'amount'>) => {
    const fundraiserToUpdate = fundraisers.find(f => f.id === fundraiserId);
    if (!fundraiserToUpdate) return;

    setFundraisers(prev =>
      prev.map(f => {
        if (f.id === fundraiserId) {
          const newSupporter: Supporter = {
            ...supporter,
            id: `supp${Date.now()}`,
            amount: amount,
          };
          return {
            ...f,
            currentAmount: f.currentAmount + amount,
            supporters: [newSupporter, ...f.supporters],
          };
        }
        return f;
      })
    );

    // Send notification to the campaign creator
    addNotification({
        userId: fundraiserToUpdate.creator.id,
        title: 'New Donation Received!',
        body: `${supporter.name} donated $${amount} to your "${fundraiserToUpdate.title}" campaign.`,
        fundraiserId: fundraiserId,
    });
  };

  return (
    <FundraiserContext.Provider value={{ fundraisers, addFundraiser, addDonation }}>
      {children}
    </FundraiserContext.Provider>
  );
};