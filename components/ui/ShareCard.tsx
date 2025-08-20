
import React from 'react';
import { Activity } from '../../types';
import { usePreferences } from '../../hooks/usePreferences';
import { formatDistance } from '../../utils/formatters';

interface ShareCardProps {
  activity: Activity;
}

const ShareCard: React.FC<ShareCardProps> = ({ activity }) => {
  const { preferences } = usePreferences();

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg">
      <img src={activity.imageUrl} alt="Activity" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <div className="flex items-center gap-3">
          <img src={activity.user.avatarUrl} alt={activity.user.name} className="h-12 w-12 rounded-full border-2 border-white" />
          <div>
            <p className="font-bold">{activity.user.name}</p>
            <p className="text-sm text-gray-200">just completed a {activity.type}!</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex justify-between text-lg font-semibold">
            <span>{formatDistance(activity.distance, preferences.unitSystem)}</span>
            <span>{activity.time}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
            <MapPinIcon />
            <span>{activity.route.start}</span>
            <ArrowRightIcon />
            <span>{activity.route.end}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;

export default ShareCard;