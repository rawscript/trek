
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, Coords, ScreenName } from '../../types';
import ShareCard from '../ui/ShareCard';
import { useAuth } from '../../hooks/useAuth';
import { getMotivationMessage, getIncompleteActivityMessage, generateActivityImage } from '../../services/geminiService';
import { haversineDistance } from '../../utils/geolocation';
import LiveMap from '../ui/LiveMap';
import { usePreferences } from '../../hooks/usePreferences';
import { formatDistance, KM_TO_MILES } from '../../utils/formatters';
import { useActivity } from '../../hooks/useActivity';
import { useDevice } from '../../hooks/useDevice';
import FinishConfirmationModal from '../ui/FinishConfirmationModal';


type ActivityState = 'setup' | 'tracking' | 'summary';
type ActivityType = 'Cycle' | 'Run';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);

interface ActivityScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({ setActiveScreen }) => {
  const { user } = useAuth();
  const { addActivity } = useActivity();
  const { preferences } = usePreferences();
  const { heartRateHistory } = useDevice();
  const [activityState, setActivityState] = useState<ActivityState>('setup');
  const [activityType, setActivityType] = useState<ActivityType>('Cycle');
  const [goal, setGoal] = useState(10); // always in km internally
  const [elapsed, setElapsed] = useState(0);
  const [distanceCovered, setDistanceCovered] = useState(0); // always in km
  const [motivation, setMotivation] = useState<{ message: string; id: number } | null>(null);
  const [milestonesHit, setMilestonesHit] = useState<number[]>([]);
  const [path, setPath] = useState<Coords[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [completedActivity, setCompletedActivity] = useState<Activity | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [finishModal, setFinishModal] = useState({ isOpen: false, message: '' });
  const [preparedImageUrl, setPreparedImageUrl] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  
  // Real-time timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activityState === 'tracking') {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if(interval) clearInterval(interval);
    };
  }, [activityState]);

  // GPS tracking effect
  useEffect(() => {
    if (activityState === 'tracking') {
      if (!navigator.geolocation) {
        setGpsError("Geolocation is not supported by your browser.");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setGpsError(null);
          const newCoord = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setPath(prevPath => {
            if (prevPath.length > 0) {
              const lastCoord = prevPath[prevPath.length - 1];
              const newDistance = haversineDistance(lastCoord, newCoord);
              setDistanceCovered(prevDist => prevDist + newDistance);
            }
            return [...prevPath, newCoord];
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGpsError("Location access denied. Please enable it in your settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              setGpsError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setGpsError("The request to get user location timed out.");
              break;
            default:
              setGpsError("An unknown error occurred with GPS tracking.");
              break;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => { // Cleanup
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activityState]);


  // Motivation message effect
  useEffect(() => {
    if (activityState !== 'tracking' || goal <= 0) return;

    const progress = (distanceCovered / goal) * 100;
    const milestones = [25, 50, 75];
    const nextMilestone = milestones.find(m => progress >= m && !milestonesHit.includes(m));

    if (nextMilestone) {
      setMilestonesHit(prev => [...prev, nextMilestone]);
      
      const fetchMotivation = async () => {
        const message = await getMotivationMessage(activityType, goal, distanceCovered);
        setMotivation({ message, id: Date.now() });
        setTimeout(() => setMotivation(null), 7000); // Message disappears after 7 seconds
      };

      fetchMotivation();
    }
  }, [distanceCovered, goal, activityState, milestonesHit, activityType]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  const formatTimeForSummary = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${seconds}s`;
  }

  const prepareActivityImage = async () => {
    try {
        const imagePrompt = `A scenic, photorealistic image of a ${activityType.toLowerCase()} route at Lakeview City Park. Show a beautiful landscape with a path or road, vibrant colors, sunny day.`;
        const imageUrl = await generateActivityImage(imagePrompt);
        setPreparedImageUrl(imageUrl);
    } catch (error) {
        console.error("Failed to prepare activity image in background:", error);
    }
  };

  const handleStart = () => {
    setActivityState('tracking');
    prepareActivityImage();
  };
  
  const handleAttemptFinish = () => {
    if (distanceCovered < goal) {
      const distanceRemaining = (goal - distanceCovered).toFixed(1);
      const defaultMessage = `You're so close! Just ${distanceRemaining} km to go. You've got this! Are you sure you want to stop now?`;
      setFinishModal({ isOpen: true, message: defaultMessage });

      // Fetch AI message in the background and update when ready
      getIncompleteActivityMessage(activityType, goal, distanceCovered)
          .then(encouragement => {
              setFinishModal(prev => prev.isOpen ? { ...prev, message: encouragement } : prev);
          })
          .catch(err => {
              console.error("Failed to get AI encouragement:", err);
          });
    } else {
      confirmFinish();
    }
  };

  const confirmFinish = async () => {
    setFinishModal({ isOpen: false, message: '' });
    setCompletedActivity(null);
    setActivityState('summary');

    let imageUrl = preparedImageUrl; // Use pre-loaded image if ready

    // If image wasn't prepared in time or failed, generate it now.
    if (!imageUrl) {
        setIsGeneratingSummary(true); // Show loader only if we have to wait
        try {
            const imagePrompt = `A scenic, photorealistic image of a ${activityType.toLowerCase()} route at Lakeview City Park, celebrating the completion of a ${distanceCovered.toFixed(1)}km activity. Show a beautiful landscape with a path or road, vibrant colors, sunny day.`;
            imageUrl = await generateActivityImage(imagePrompt);
        } catch (error) {
            console.error("Failed to generate activity image, using fallback.", error);
        }
    }
    
    // Fallback if all generation fails
    if (!imageUrl) {
        imageUrl = `https://picsum.photos/seed/${Math.random()}/400/600`;
    }

    const finalActivity: Activity = {
      id: `act_${Date.now()}`,
      user: user as User,
      type: activityType,
      distance: distanceCovered,
      time: formatTimeForSummary(elapsed),
      duration: elapsed,
      imageUrl: imageUrl, // Use generated or fallback URL
      route: { start: 'City Park', end: 'Lakeview Point' },
      timestamp: new Date().toISOString(),
      trekPath: path,
      heartRateData: heartRateHistory.length > 0 ? heartRateHistory : undefined,
    };
    await addActivity(finalActivity);
    setCompletedActivity(finalActivity);
    setIsGeneratingSummary(false); // Ensure loader is off
  };

  const handleReset = () => {
      setActivityState('setup');
      setElapsed(0);
      setDistanceCovered(0);
      setMotivation(null);
      setMilestonesHit([]);
      setPath([]);
      setGpsError(null);
      setCompletedActivity(null);
      setPreparedImageUrl(null);
  }

  const goalInCurrentUnit = preferences.unitSystem === 'imperial' ? goal * KM_TO_MILES : goal;
  const setGoalInCurrentUnit = (value: number) => {
      setGoal(preferences.unitSystem === 'imperial' ? value / KM_TO_MILES : value);
  }

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        {activityState === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">New Activity</h1>
            <div className="my-8 flex justify-center gap-4">
              <button onClick={() => setActivityType('Cycle')} className={`px-6 py-3 rounded-full text-lg font-semibold transition ${activityType === 'Cycle' ? 'bg-brand-green text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>🚲 Cycle</button>
              <button onClick={() => setActivityType('Run')} className={`px-6 py-3 rounded-full text-lg font-semibold transition ${activityType === 'Run' ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>🏃 Run</button>
            </div>
            <div className="my-8">
              <label className="text-brand-gray dark:text-gray-400">Set your goal ({preferences.unitSystem === 'metric' ? 'km' : 'mi'})</label>
              <div className="mt-2 flex items-center justify-center gap-4 rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                <button
                  onClick={() => setGoalInCurrentUnit(Math.max(1, goalInCurrentUnit - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-300 shadow-md transition-transform active:scale-95"
                  aria-label="Decrease goal"
                >
                  <MinusIcon />
                </button>
                <input
                  type="number"
                  value={Math.round(goalInCurrentUnit)}
                  onChange={(e) => setGoalInCurrentUnit(Number(e.target.value))}
                  className="w-24 border-none bg-transparent text-center text-5xl font-bold text-brand-dark dark:text-brand-light focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setGoalInCurrentUnit(goalInCurrentUnit + 1)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-300 shadow-md transition-transform active:scale-95"
                  aria-label="Increase goal"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
            <button onClick={handleStart} className="w-full rounded-lg bg-brand-dark dark:bg-gray-700 py-4 text-xl font-bold text-white">Start</button>
          </motion.div>
        )}
        
        {activityState === 'tracking' && (
          <motion.div key="tracking" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative flex flex-col min-h-[80vh] items-center p-4">
             <div className="absolute top-0 left-4 right-4 h-20">
                <AnimatePresence>
                  {motivation && (
                    <motion.div
                      key={motivation.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20, transition: { duration: 0.5 } }}
                      className="rounded-xl bg-brand-green/20 px-4 py-3 text-center font-semibold text-brand-dark dark:text-green-200 dark:bg-green-500/20 shadow-sm"
                    >
                      <p>{motivation.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <div>
                    <p className="text-xl font-semibold text-brand-gray dark:text-gray-400">{activityType}</p>
                    <p className="text-6xl font-bold text-brand-dark dark:text-brand-light tracking-tighter tabular-nums">{formatTime(elapsed)}</p>
                </div>

                <LiveMap path={path} />
                {gpsError && <p className="mt-2 text-sm text-red-500">{gpsError}</p>}
                
                <div className="w-full max-w-xs">
                    <div className="relative h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div 
                            className="absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                            animate={{ width: `${Math.min((distanceCovered / goal) * 100, 100)}%` }}
                            transition={{ duration: 0.5, ease: 'linear' }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-sm font-medium text-brand-dark dark:text-brand-light">
                        <span>{formatDistance(distanceCovered, preferences.unitSystem, true, 2)}</span>
                        <span>{formatDistance(goal, preferences.unitSystem)}</span>
                    </div>
                </div>
                 {activityType === 'Cycle' && (
                    <div className="mt-2 text-center">
                        <p className="text-md text-brand-gray dark:text-gray-400">Equivalent Steps</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-brand-light tabular-nums animate-pulse-subtle">{Math.round((distanceCovered * KM_TO_MILES) * 2000).toLocaleString()}</p>
                    </div>
                )}
            </div>
            
            <div className="mt-4 w-full">
                <button onClick={handleAttemptFinish} className="w-full rounded-lg bg-red-500 py-4 text-xl font-bold text-white shadow-lg transition-transform active:scale-95">Finish</button>
            </div>
          </motion.div>
        )}

        {activityState === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {isGeneratingSummary ? (
                <div className="flex h-[80vh] flex-col items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-4 border-t-brand-blue border-gray-200 dark:border-gray-600"
                    />
                    <h2 className="mt-6 text-2xl font-bold text-brand-dark dark:text-brand-light">Crafting your highlight...</h2>
                    <p className="mt-2 text-brand-gray dark:text-gray-400">Our AI is generating a unique image for your adventure!</p>
                </div>
            ) : completedActivity && (
              <>
                <h1 className="mb-4 text-3xl font-bold text-brand-dark dark:text-brand-light">Great Job!</h1>
                <ShareCard activity={completedActivity} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <button onClick={handleReset} className="w-full rounded-lg bg-gray-300 dark:bg-gray-700 py-3 font-bold text-brand-dark dark:text-brand-light">Go Again</button>
                    <button onClick={() => alert("Shared!")} className="w-full rounded-lg bg-brand-green py-3 font-bold text-white">Share</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <FinishConfirmationModal
        isOpen={finishModal.isOpen}
        message={finishModal.message}
        onContinue={() => setFinishModal({ isOpen: false, message: '' })}
        onConfirm={confirmFinish}
      />
    </div>
  );
};

export default ActivityScreen;