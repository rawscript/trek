import React, { useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { ScreenName } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);


interface NotificationsScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
  setSelectedFundraiserId: (id: string) => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ setActiveScreen, setSelectedFundraiserId }) => {
    const { notifications, markAllAsRead } = useNotification();
    
    useEffect(() => {
        // Mark as read when the component is unmounted, so the badge updates.
        return () => {
            markAllAsRead();
        };
    }, [markAllAsRead]);
    
    const handleNotificationClick = (fundraiserId?: string) => {
        if (fundraiserId) {
            setSelectedFundraiserId(fundraiserId);
            setActiveScreen('FundraiserDetail');
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center gap-4">
                <button onClick={() => setActiveScreen('Home')} className="text-brand-dark dark:text-brand-light">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Notifications</h1>
            </div>
            
            <div className="space-y-3">
                <AnimatePresence>
                {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <motion.div
                            key={notif.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleNotificationClick(notif.fundraiserId)}
                            className={`relative rounded-lg p-4 shadow-sm ${notif.fundraiserId ? 'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700' : ''} ${!notif.read ? 'bg-brand-green/10 dark:bg-brand-green/20 border border-brand-green/30' : 'bg-white dark:bg-gray-800'}`}
                        >
                            {!notif.read && <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-brand-green ring-4 ring-brand-green/20"></div>}
                            <p className="font-bold text-brand-dark dark:text-brand-light">{notif.title}</p>
                            <p className="mt-1 text-sm text-brand-gray dark:text-gray-400">{notif.body}</p>
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{new Date(notif.timestamp).toLocaleString()}</p>
                        </motion.div>
                    ))
                ) : (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="py-10 text-center text-brand-gray dark:text-gray-400">
                        <p>You have no notifications yet.</p>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificationsScreen;