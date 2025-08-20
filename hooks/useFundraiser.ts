import { useContext } from 'react';
import { FundraiserContext } from '../context/FundraiserContext';

export const useFundraiser = () => {
  const context = useContext(FundraiserContext);
  if (context === undefined) {
    throw new Error('useFundraiser must be used within a FundraiserProvider');
  }
  return context;
};
