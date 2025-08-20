

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenName, Theme, UnitSystem, PayoutDetails, PayoutMethod, BankPayoutDetails, PayPalPayoutDetails, StripePayoutDetails } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../hooks/usePreferences';
import Card from '../ui/Card';
import AvatarSelectionModal from '../ui/AvatarSelectionModal';


interface SettingsScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
}

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const defaultPayouts = {
    bank: { method: 'bank', accountHolderName: '', accountNumber: '', routingNumber: '' } as BankPayoutDetails,
    paypal: { method: 'paypal', email: '' } as PayPalPayoutDetails,
    stripe: { method: 'stripe', accountId: '' } as StripePayoutDetails,
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setActiveScreen }) => {
  const { user, updateUser, logout } = useAuth();
  const { preferences, setPreferences } = usePreferences();
  const [name, setName] = useState(user?.name || '');
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(user?.payoutDetails?.method || 'bank');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>(user?.payoutDetails || defaultPayouts.bank);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isPayoutSaved, setIsPayoutSaved] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if(isProfileSaved) setIsProfileSaved(false);
  };
  
  const handleSaveName = () => {
    if(name.trim() && name.trim() !== user?.name) {
        updateUser({ name: name.trim() });
        setIsProfileSaved(true);
        setTimeout(() => setIsProfileSaved(false), 2000);
    }
  };
  
  const handleAvatarSelect = (url: string) => {
    updateUser({ avatarUrl: url });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  }

  const handlePayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPayoutDetails({ ...payoutDetails, [e.target.name]: e.target.value });
      if(isPayoutSaved) setIsPayoutSaved(false);
  }
  
  const handleMethodChange = (method: PayoutMethod) => {
      setSelectedMethod(method);
      setPayoutDetails(user?.payoutDetails?.method === method ? user.payoutDetails : defaultPayouts[method]);
  };
  
  const handleStripeConnect = () => {
    // Simulate connecting to Stripe
    const mockStripeId = `acct_${Date.now()}`;
    const newDetails: StripePayoutDetails = { method: 'stripe', accountId: mockStripeId };
    setPayoutDetails(newDetails);
    updateUser({ payoutDetails: newDetails });
    setIsPayoutSaved(true);
    setTimeout(() => setIsPayoutSaved(false), 2000);
  }

  const handleSavePayout = () => {
    updateUser({ payoutDetails });
    setIsPayoutSaved(true);
    setTimeout(() => setIsPayoutSaved(false), 2000);
  }

  const handlePreferenceChange = (key: 'theme' | 'unitSystem', value: Theme | UnitSystem) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => setActiveScreen('Home')} className="text-brand-dark dark:text-brand-light">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <button onClick={() => setIsAvatarModalOpen(true)} className="group relative h-16 w-16 shrink-0 rounded-full">
                <img src={user?.avatarUrl} alt="avatar" className="h-16 w-16 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-bold text-white">Change</span>
                </div>
            </button>
            <div className="flex-1">
              <label htmlFor="name" className="text-sm text-brand-gray dark:text-gray-400">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={handleSaveName}
                className="w-full rounded-md border-gray-300 bg-gray-100 p-2 text-brand-dark dark:bg-gray-700 dark:text-brand-light dark:border-gray-600"
              />
            </div>
          </div>
           {isProfileSaved && <p className="mt-2 text-sm text-center text-brand-green">Profile updated!</p>}
        </Card>

        {/* Payout Section */}
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Payout Settings</h2>
          <p className="text-sm text-brand-gray dark:text-gray-400 mt-1">Add your account to receive fundraiser donations.</p>
          
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              <PayoutMethodButton method="bank" selected={selectedMethod} onClick={handleMethodChange} label="Bank" />
              <PayoutMethodButton method="paypal" selected={selectedMethod} onClick={handleMethodChange} label="PayPal" />
              <PayoutMethodButton method="stripe" selected={selectedMethod} onClick={handleMethodChange} label="Stripe" />
          </div>

          <div className="mt-4 space-y-3">
              {selectedMethod === 'bank' && payoutDetails.method === 'bank' && (
                  <>
                    <div>
                        <label htmlFor="accountHolderName" className="text-sm text-brand-gray dark:text-gray-400">Account Holder Name</label>
                        <input id="accountHolderName" name="accountHolderName" type="text" value={payoutDetails.accountHolderName} onChange={handlePayoutChange} className="w-full rounded-md border-gray-300 bg-gray-100 p-2 text-brand-dark dark:bg-gray-700 dark:text-brand-light dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="accountNumber" className="text-sm text-brand-gray dark:text-gray-400">Account Number</label>
                        <input id="accountNumber" name="accountNumber" type="text" value={payoutDetails.accountNumber} onChange={handlePayoutChange} className="w-full rounded-md border-gray-300 bg-gray-100 p-2 text-brand-dark dark:bg-gray-700 dark:text-brand-light dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="routingNumber" className="text-sm text-brand-gray dark:text-gray-400">Routing Number</label>
                        <input id="routingNumber" name="routingNumber" type="text" value={payoutDetails.routingNumber} onChange={handlePayoutChange} className="w-full rounded-md border-gray-300 bg-gray-100 p-2 text-brand-dark dark:bg-gray-700 dark:text-brand-light dark:border-gray-600"/>
                    </div>
                    <button onClick={handleSavePayout} className="!mt-4 w-full rounded-lg bg-brand-blue py-2 font-bold text-white transition hover:bg-blue-600">Save Bank Info</button>
                  </>
              )}
              {selectedMethod === 'paypal' && payoutDetails.method === 'paypal' && (
                  <>
                    <div>
                        <label htmlFor="email" className="text-sm text-brand-gray dark:text-gray-400">PayPal Email</label>
                        <input id="email" name="email" type="email" value={payoutDetails.email} onChange={handlePayoutChange} className="w-full rounded-md border-gray-300 bg-gray-100 p-2 text-brand-dark dark:bg-gray-700 dark:text-brand-light dark:border-gray-600"/>
                    </div>
                     <button onClick={handleSavePayout} className="!mt-4 w-full rounded-lg bg-brand-blue py-2 font-bold text-white transition hover:bg-blue-600">Save PayPal Info</button>
                  </>
              )}
              {selectedMethod === 'stripe' && (
                  <div className='text-center'>
                      {payoutDetails.method === 'stripe' && payoutDetails.accountId ? (
                          <div className='rounded-lg bg-brand-green/10 p-4'>
                              <p className='font-semibold text-brand-dark dark:text-brand-light'>Stripe Account Connected!</p>
                              <p className='text-sm text-brand-gray dark:text-gray-400 mt-1'>ID: {payoutDetails.accountId}</p>
                          </div>
                      ) : (
                          <>
                            <p className='text-brand-gray dark:text-gray-400'>Connect your Stripe account to receive payouts securely.</p>
                            <button onClick={handleStripeConnect} className="!mt-4 w-full rounded-lg bg-[#635BFF] py-2 font-bold text-white transition hover:bg-[#554cfa]">Connect with Stripe</button>
                          </>
                      )}
                  </div>
              )}
          </div>
          {isPayoutSaved && <p className="mt-2 text-sm text-center text-brand-green">Payout details saved!</p>}
        </Card>

        {/* Preferences Section */}
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Preferences</h2>
          <div className="mt-4 space-y-4">
            {/* Unit System */}
            <div>
              <p className="text-sm text-brand-gray dark:text-gray-400">Units</p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  onClick={() => handlePreferenceChange('unitSystem', 'metric')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors ${preferences.unitSystem === 'metric' ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                >
                  Metric (km)
                </button>
                <button
                  onClick={() => handlePreferenceChange('unitSystem', 'imperial')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors ${preferences.unitSystem === 'imperial' ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                >
                  Imperial (mi)
                </button>
              </div>
            </div>
            {/* Theme */}
            <div>
              <p className="text-sm text-brand-gray dark:text-gray-400">Theme</p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors ${preferences.theme === 'light' ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors ${preferences.theme === 'dark' ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <div className="pb-6">
          <button
            onClick={logout}
            className="w-full rounded-lg bg-red-500/10 py-3 font-bold text-red-500 transition-colors hover:bg-red-500/20"
          >
            Log Out
          </button>
        </div>
      </div>
      <AvatarSelectionModal 
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSelect={handleAvatarSelect}
      />
    </div>
  );
};


const PayoutMethodButton: React.FC<{method: PayoutMethod, selected: PayoutMethod, onClick: (method: PayoutMethod) => void, label: string}> = ({ method, selected, onClick, label}) => (
    <button
        onClick={() => onClick(method)}
        className={`rounded-md py-2 text-sm font-semibold transition-colors ${selected === method ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
    >
        {label}
    </button>
);

export default SettingsScreen;