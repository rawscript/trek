
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import MapScreen from './components/screens/MapScreen';
import ActivityScreen from './components/screens/ActivityScreen';
import SocialScreen from './components/screens/SocialScreen';
import ChatScreen from './components/screens/ChatScreen';
import BottomNav from './components/layout/BottomNav';
import { NavItem, ScreenName } from './types';
import FundraiserListScreen from './components/screens/FundraiserListScreen';
import CreateFundraiserScreen from './components/screens/CreateFundraiserScreen';
import FundraiserDetailScreen from './components/screens/FundraiserDetailScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import { usePreferences } from './hooks/usePreferences';
import OnboardingScreen from './components/screens/OnboardingScreen';

const App: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [activeScreen, setActiveScreen] = React.useState<ScreenName>('Home');
  const [selectedFundraiserId, setSelectedFundraiserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen setActiveScreen={setActiveScreen} />;
      case 'Map':
        return <MapScreen />;
      case 'Activity':
        return <ActivityScreen setActiveScreen={setActiveScreen} />;
      case 'Social':
        return <SocialScreen setActiveScreen={setActiveScreen} setSelectedFundraiserId={setSelectedFundraiserId} />;
      case 'Chat':
        return <ChatScreen />;
      case 'FundraiserList':
        return <FundraiserListScreen setActiveScreen={setActiveScreen} setSelectedFundraiserId={setSelectedFundraiserId} />;
      case 'CreateFundraiser':
        return <CreateFundraiserScreen setActiveScreen={setActiveScreen} />;
      case 'FundraiserDetail':
        return <FundraiserDetailScreen fundraiserId={selectedFundraiserId} setActiveScreen={setActiveScreen} />;
      case 'Notifications':
        return <NotificationsScreen setActiveScreen={setActiveScreen} setSelectedFundraiserId={setSelectedFundraiserId} />;
      case 'Settings':
        return <SettingsScreen setActiveScreen={setActiveScreen} />;
      default:
        return <HomeScreen setActiveScreen={setActiveScreen} />;
    }
  };

  const isBottomNavVisible = ['Home', 'Map', 'Activity', 'Social', 'Chat'].includes(activeScreen);

  const MainApp = () => (
    <motion.div
      key="main-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col"
    >
      <main className={`flex-1 overflow-y-auto ${isBottomNavVisible ? 'pb-20' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
      {isBottomNavVisible && <BottomNav activeItem={activeScreen as NavItem} setActiveItem={setActiveScreen} />}
    </motion.div>
  );

  return (
    <div className="bg-brand-light dark:bg-black font-sans antialiased">
      <div className="relative mx-auto h-[100dvh] w-full max-w-sm overflow-hidden bg-white dark:bg-brand-dark shadow-2xl ring-1 ring-black/5">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginScreen />
            </motion.div>
          ) : !user.isOnboardingCompleted ? (
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OnboardingScreen />
            </motion.div>
          ) : (
            <MainApp />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
