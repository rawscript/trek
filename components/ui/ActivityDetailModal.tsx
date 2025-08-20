import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from '../../types';
import { usePreferences } from '../../hooks/usePreferences';
import { formatDistance, KM_TO_MILES } from '../../utils/formatters';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
}

// Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const FollowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
);
const DistanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpeedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
    const { preferences } = usePreferences();

    const calculateAvgSpeed = (): string => {
        const { distance: distanceKm, time } = activity;
        
        let totalHours = 0;
        if (time.includes('h')) {
            totalHours += parseFloat(time.split('h')[0]);
        }
        if (time.includes('m')) {
            const minutesPart = time.includes('h') ? time.split('h')[1] : time;
            totalHours += parseFloat(minutesPart.replace('m', '')) / 60;
        }
        
        if (totalHours === 0) return 'N/A';
        
        if (preferences.unitSystem === 'imperial') {
            const speedMph = (distanceKm * KM_TO_MILES) / totalHours;
            return `${speedMph.toFixed(1)} mph`;
        }
        
        const speedKph = distanceKm / totalHours;
        return `${speedKph.toFixed(1)} km/h`;
    };

    const avgSpeed = calculateAvgSpeed();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100vh' }}
                animate={{ y: 0 }}
                exit={{ y: '100vh' }}
                transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                className="relative h-full w-full max-w-sm overflow-y-auto bg-brand-light dark:bg-brand-dark"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-3">
                            <img src={activity.user.avatarUrl} alt={activity.user.name} className="h-12 w-12 rounded-full" />
                            <div>
                                <p className="font-bold text-brand-dark dark:text-brand-light">{activity.user.name}</p>
                                <p className="text-sm text-brand-gray dark:text-gray-400">{activity.timestamp}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-brand-gray dark:text-gray-400"><CloseIcon /></button>
                    </div>

                    {/* Map with Path */}
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                        <img src={activity.imageUrl.replace('/400/600', '/400/400')} alt="Activity map" className="h-64 w-full object-cover" />
                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <motion.path
                                d="M 10 80 Q 20 20, 50 50 T 90 20"
                                fill="none"
                                stroke="rgba(96, 165, 250, 0.8)" // brand-blue with opacity
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray="500"
                                initial={{ strokeDashoffset: 500 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>

                    {/* Stats */}
                    <div className="my-6 grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm">
                            <DistanceIcon />
                            <p className="mt-1 text-xl font-bold text-brand-dark dark:text-brand-light">{formatDistance(activity.distance, preferences.unitSystem, false)} <span className="text-sm font-normal">{preferences.unitSystem === 'metric' ? 'km' : 'mi'}</span></p>
                            <p className="text-xs text-brand-gray dark:text-gray-400">Distance</p>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm">
                            <TimeIcon />
                            <p className="mt-1 text-xl font-bold text-brand-dark dark:text-brand-light">{activity.time}</p>
                            <p className="text-xs text-brand-gray dark:text-gray-400">Time</p>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm">
                            <SpeedIcon />
                            <p className="mt-1 text-xl font-bold text-brand-dark dark:text-brand-light">{avgSpeed}</p>
                            <p className="text-xs text-brand-gray dark:text-gray-400">Avg Speed</p>
                        </div>
                    </div>
                    
                    {/* Route Info */}
                    <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex items-center justify-between text-brand-dark dark:text-brand-light">
                           <p className="font-semibold">{activity.route.start}</p>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-gray dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           <p className="font-semibold">{activity.route.end}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                        <button 
                            onClick={() => alert(`Following ${activity.user.name}!`)}
                            className="flex w-full items-center justify-center rounded-lg bg-brand-blue py-3 font-bold text-white transition hover:bg-blue-600">
                           <FollowIcon /> Follow {activity.user.name}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ActivityDetailModal;