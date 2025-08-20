import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Activity } from '../types';
import { getAIInsight } from '../services/geminiService';

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const storedActivities = window.localStorage.getItem('trekly-activities');
      return storedActivities ? JSON.parse(storedActivities) : [];
    } catch (error) {
      console.error('Error reading activities from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('trekly-activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities to localStorage', error);
    }
  }, [activities]);

  const addActivity = async (activity: Activity) => {
    let insight: string | undefined = undefined;
    if (activity.heartRateData && activity.heartRateData.length > 5) {
      try {
        insight = await getAIInsight(activity.heartRateData);
      } catch (error) {
        console.error("Failed to generate AI insight on activity completion:", error);
        // Fail silently, the insight is an enhancement, not critical.
      }
    }

    const activityWithInsight: Activity = {
      ...activity,
      aiInsight: insight,
    };

    setActivities(prevActivities => [activityWithInsight, ...prevActivities]);
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};