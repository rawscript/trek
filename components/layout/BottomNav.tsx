import React from 'react';
import { motion } from 'framer-motion';
import { NavItem } from '../../types';

interface BottomNavProps {
  activeItem: NavItem;
  setActiveItem: (item: NavItem) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeItem, setActiveItem }) => {
    // Moved icons inside component to define before use
    const HomeIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
    const MapIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10h6" />
      </svg>
    );
    const ActivityIcon = () => (
        <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors ${activeItem === 'Activity' ? 'bg-brand-green' : 'bg-brand-gray'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </div>
    );
    const SocialIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
    const ChatIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );

    const navItems: { name: NavItem; icon: React.ReactNode }[] = [
      { name: 'Home', icon: <HomeIcon /> },
      { name: 'Map', icon: <MapIcon /> },
      { name: 'Activity', icon: <ActivityIcon /> },
      { name: 'Social', icon: <SocialIcon /> },
      { name: 'Chat', icon: <ChatIcon /> },
    ];
    
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-900/80 p-2 backdrop-blur-md">
      <div className="flex justify-around rounded-full bg-brand-dark px-2 py-3 shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveItem(item.name)}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 text-xs text-brand-gray transition-colors hover:text-white"
          >
            {item.name === 'Activity' ? (
              <div className="absolute -top-10 flex flex-col items-center gap-2">
                {item.icon}
                {activeItem === 'Activity' && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1}} className="font-semibold text-brand-dark dark:text-brand-light">Activity</motion.span>
                )}
              </div>
            ) : (
              <>
                <div className={`transition-transform ${activeItem === item.name ? 'text-brand-green' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span className={`transition-colors ${activeItem === item.name ? 'text-white' : 'text-gray-400'}`}>
                  {item.name}
                </span>
                {activeItem === item.name && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-2 h-1 w-6 rounded-full bg-brand-green"
                  />
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};


export default BottomNav;