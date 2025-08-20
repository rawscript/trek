import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Fundraiser, ScreenName } from '../../types';
import ShareCard from '../ui/ShareCard';
import ActivityDetailModal from '../ui/ActivityDetailModal';
import { useFundraiser } from '../../hooks/useFundraiser';
import FundraiserShareCard from '../ui/FundraiserShareCard';

const mockActivities: Activity[] = [
  {
    id: '1',
    user: { id: '2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=jane' },
    type: 'Cycle',
    distance: 25.5,
    time: '1h 15m',
    duration: 4500, // 1h 15m in seconds
    imageUrl: 'https://picsum.photos/seed/ride1/400/600',
    route: { start: 'Mountain Pass', end: 'Valley Overlook' },
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: { id: '3', name: 'Bob Smith', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    type: 'Run',
    distance: 10.2,
    time: '55m',
    duration: 3300, // 55m in seconds
    imageUrl: 'https://picsum.photos/seed/run1/400/600',
    route: { start: 'Beachside Path', end: 'The Pier' },
    timestamp: '5 hours ago',
  },
];

interface SocialScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
  setSelectedFundraiserId: (id: string) => void;
}

const SocialScreen: React.FC<SocialScreenProps> = ({ setActiveScreen, setSelectedFundraiserId }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState<'Adventures' | 'Campaigns'>('Adventures');
  const { fundraisers } = useFundraiser();

  const handleCampaignClick = (id: string) => {
    setSelectedFundraiserId(id);
    setActiveScreen('FundraiserDetail');
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-brand-dark dark:text-brand-light">Community Feed</h1>

      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        <TabButton name="Adventures" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Campaigns" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Adventures' ? (
            <div className="space-y-6">
              {mockActivities.map(activity => (
                <motion.div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  <ShareCard activity={activity} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {fundraisers.map(campaign => (
                <FundraiserShareCard 
                  key={campaign.id} 
                  fundraiser={campaign} 
                  onClick={() => handleCampaignClick(campaign.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailModal 
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface TabButtonProps {
    name: 'Adventures' | 'Campaigns';
    activeTab: 'Adventures' | 'Campaigns';
    setActiveTab: (name: 'Adventures' | 'Campaigns') => void;
}

const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(name)}
        className={`relative w-1/2 py-3 text-center font-semibold transition-colors ${activeTab === name ? 'text-brand-green' : 'text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white'}`}
    >
        {name}
        {activeTab === name && <motion.div layoutId="social-tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green" />}
    </button>
);


export default SocialScreen;