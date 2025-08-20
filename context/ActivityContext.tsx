import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types';
import { getAIInsight } from '../services/geminiService';

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const STORAGE_KEY = 'trekly-activities';
const isWeb =
  typeof window !== 'undefined' &&
  typeof (window as any).localStorage !== 'undefined' &&
  typeof (window as any).document !== 'undefined';

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load
  useEffect(() => {
    const load = async () => {
      try {
        if (isWeb) {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) setActivities(JSON.parse(stored));
        } else {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) setActivities(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error reading activities from storage', err);
      }
    };
    load();
  }, []);

  // Persist
  useEffect(() => {
    const persist = async () => {
      try {
        const json = JSON.stringify(activities);
        if (isWeb) {
          window.localStorage.setItem(STORAGE_KEY, json);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, json);
        }
      } catch (err) {
        console.error('Error saving activities to storage', err);
      }
    };
    persist();
  }, [activities]);

  const addActivity = async (activity: Activity) => {
    let insight: string | undefined = undefined;
    if (activity.heartRateData && activity.heartRateData.length > 5) {
      try {
        insight = await getAIInsight(activity.heartRateData);
      } catch (error) {
        console.error('Failed to generate AI insight on activity completion:', error);
      }
    }

    const activityWithInsight: Activity = { ...activity, aiInsight: insight };
    setActivities(prevActivities => [activityWithInsight, ...prevActivities]);
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};
