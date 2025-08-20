
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useDevice } from '../../hooks/useDevice';
import DeviceConnectModal from '../ui/DeviceConnectModal';
import { ScreenName } from '../../types';
import { useNotification } from '../../hooks/useNotification';
import { usePreferences } from '../../hooks/usePreferences';
import { formatDistance, KM_TO_MILES } from '../../utils/formatters';
import { useActivity } from '../../hooks/useActivity';
import { analyzeHeartRate, HeartRateAnalysis } from '../../utils/analytics';
import HeartRateZoneChart from '../ui/HeartRateZoneChart';
import LiveHeartRateChart from '../ui/LiveHeartRateChart';

const formatDurationForStats = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
}
const formatDurationForChart = (totalSeconds: number) => {
    return Math.round(totalSeconds / 60); // return in minutes
}


// Icons
const DistanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /></svg>;
const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WatchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.466 11.965l-2.266-2.267a2.5 2.5 0 00-3.536 0l-.707.707m-4.242 4.242l.707.707a2.5 2.5 0 003.536 0l2.266-2.267" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 18.727l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;

interface HomeScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen }) => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { activities } = useActivity();
  const { connectedDevice, heartRate, heartRateHistory } = useDevice();
  const { unreadCount } = useNotification();
  const [isDeviceModalOpen, setDeviceModalOpen] = useState(false);
  const [reportTab, setReportTab] = useState<'distance' | 'duration'>('distance');

  const stats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = activities.filter(act => new Date(act.timestamp) > sevenDaysAgo);
    
    const totalDistanceKm = recentActivities.reduce((acc, act) => acc + act.distance, 0);
    const totalDurationSeconds = recentActivities.reduce((acc, act) => acc + act.duration, 0);
    
    return {
      totalDistanceKm,
      totalActivities: recentActivities.length,
      totalDurationSeconds,
    };
  }, [activities]);

  const weeklyComparisonData = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfPreviousWeek = new Date(startOfWeek);
    startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);
    
    const weekData = dayNames.map(name => ({ name, currentDistance: 0, currentDuration: 0, previousDistance: 0, previousDuration: 0 }));

    activities.forEach(act => {
        const actDate = new Date(act.timestamp);
        const dayIndex = actDate.getDay() === 0 ? 6 : actDate.getDay() - 1;

        const distance = preferences.unitSystem === 'imperial' ? act.distance * KM_TO_MILES : act.distance;
        const duration = act.duration; // keep in seconds for now

        if (actDate >= startOfWeek) {
            weekData[dayIndex].currentDistance += distance;
            weekData[dayIndex].currentDuration += duration;
        } else if (actDate >= startOfPreviousWeek && actDate < startOfWeek) {
            weekData[dayIndex].previousDistance += distance;
            weekData[dayIndex].previousDuration += duration;
        }
    });
    
    const formattedChartData = weekData.map(day => ({
        name: day.name,
        currentDistance: parseFloat(day.currentDistance.toFixed(1)),
        previousDistance: parseFloat(day.previousDistance.toFixed(1)),
        currentDuration: formatDurationForChart(day.currentDuration),
        previousDuration: formatDurationForChart(day.previousDuration)
    }));
    
    const totals = {
        currentDistance: formattedChartData.reduce((sum, day) => sum + day.currentDistance, 0),
        currentDuration: weekData.reduce((sum, day) => sum + day.currentDuration, 0),
        previousDistance: formattedChartData.reduce((sum, day) => sum + day.previousDistance, 0),
        previousDuration: weekData.reduce((sum, day) => sum + day.previousDuration, 0),
    };

    return { chartData: formattedChartData, totals };
  }, [activities, preferences.unitSystem]);

  const latestActivityWithHR = useMemo(() => {
    return [...activities].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).find(act => act.heartRateData && act.heartRateData.length > 0);
  }, [activities]);

  const latestWorkoutAnalysis = useMemo(() => {
    if (latestActivityWithHR?.heartRateData) {
        return analyzeHeartRate(latestActivityWithHR.heartRateData);
    }
    return null;
  }, [latestActivityWithHR]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? { value: 'New Data!', direction: 'up' as const } : { value: '--', direction: 'same' as const };
    }
    if (current === previous) {
        return { value: '0%', direction: 'same' as const };
    }
    const percentage = ((current - previous) / previous) * 100;
    const direction = percentage > 0 ? 'up' as const : 'down' as const;
    return { value: `${direction === 'up' ? '+' : ''}${percentage.toFixed(0)}%`, direction };
  };

  const ReportTabButton = ({ name, activeTab, setTab }) => (
      <button
        onClick={() => setTab(name.toLowerCase())}
        className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors ${activeTab === name.toLowerCase() ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
      >
        {name}
      </button>
  );

  const renderReportSummary = () => {
    const isDistance = reportTab === 'distance';
    const currentTotal = isDistance ? weeklyComparisonData.totals.currentDistance : weeklyComparisonData.totals.currentDuration;
    const previousTotal = isDistance ? weeklyComparisonData.totals.previousDistance : weeklyComparisonData.totals.previousDuration;
    const change = calculateChange(currentTotal, previousTotal);
    const unit = isDistance ? (preferences.unitSystem === 'metric' ? 'km' : 'mi') : '';

    const formatValue = (value) => isDistance ? `${value.toFixed(1)} ${unit}` : formatDurationForStats(value);

    return (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
                <p className="text-xs text-brand-gray dark:text-gray-400">This Week</p>
                <p className="text-lg font-bold text-brand-dark dark:text-brand-light">{formatValue(currentTotal)}</p>
            </div>
            <div>
                <p className="text-xs text-brand-gray dark:text-gray-400">Last Week</p>
                <p className="text-lg font-bold text-brand-dark dark:text-brand-light">{formatValue(previousTotal)}</p>
            </div>
            <div>
                <p className="text-xs text-brand-gray dark:text-gray-400">Change</p>
                <div className={`flex items-center justify-center gap-1 text-lg font-bold ${change.direction === 'up' ? 'text-brand-green' : change.direction === 'down' ? 'text-red-500' : 'text-brand-dark dark:text-brand-light'}`}>
                    {change.direction === 'up' && <ArrowUpIcon />}
                    {change.direction === 'down' && <ArrowDownIcon />}
                    <span>{change.value}</span>
                </div>
            </div>
        </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-gray dark:text-gray-400">Welcome back,</p>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">{user?.name}</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setActiveScreen('Notifications')} className="relative text-brand-gray transition-colors hover:text-brand-dark dark:hover:text-white">
                <BellIcon />
                {unreadCount > 0 && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white"
                >
                    {unreadCount}
                </motion.div>
                )}
            </button>
            <button onClick={() => setActiveScreen('Settings')} className="transition-transform hover:scale-105">
                <img src={user?.avatarUrl} alt="avatar" className="h-14 w-14 rounded-full" />
            </button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <Card className="p-4">
          <DistanceIcon />
          <p className="mt-2 text-2xl font-bold text-brand-dark dark:text-brand-light">{formatDistance(stats.totalDistanceKm, preferences.unitSystem, false)}</p>
          <p className="text-sm text-brand-gray dark:text-gray-400">{preferences.unitSystem === 'metric' ? 'Km' : 'Mi'}</p>
        </Card>
        <Card className="p-4">
          <ActivityIcon />
          <p className="mt-2 text-2xl font-bold text-brand-dark dark:text-brand-light">{stats.totalActivities}</p>
          <p className="text-sm text-brand-gray dark:text-gray-400">Activities</p>
        </Card>
        <Card className="p-4">
          <TimeIcon />
          <p className="mt-2 text-2xl font-bold text-brand-dark dark:text-brand-light">{formatDurationForStats(stats.totalDurationSeconds)}</p>
          <p className="text-sm text-brand-gray dark:text-gray-400">Time</p>
        </Card>
      </motion.div>
      
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Weekly Report</h2>
          <div className="rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <ReportTabButton name="Distance" activeTab={reportTab} setTab={setReportTab} />
            <ReportTabButton name="Duration" activeTab={reportTab} setTab={setReportTab} />
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyComparisonData.chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
              <XAxis dataKey="name" stroke="#6B7280" className="dark:stroke-gray-400 text-xs" />
              <YAxis stroke="#6B7280" className="dark:stroke-gray-400 text-xs" unit={reportTab === 'duration' ? 'm' : ''} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}
                wrapperClassName="dark:!bg-gray-700/80 dark:!border-gray-600"
                formatter={(value, name) => [`${value} ${reportTab === 'duration' ? 'min' : (preferences.unitSystem === 'metric' ? 'km' : 'mi')}`, name]}
              />
              <Legend wrapperStyle={{fontSize: '12px'}} />
              <Bar dataKey={reportTab === 'distance' ? 'previousDistance' : 'previousDuration'} name="Last Week" fill="#D1D5DB" className="dark:fill-gray-600" barSize={15} radius={[4, 4, 0, 0]} />
              <Bar dataKey={reportTab === 'distance' ? 'currentDistance' : 'currentDuration'} name="This Week" fill={reportTab === 'distance' ? '#34D399' : '#60A5FA'} barSize={15} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {renderReportSummary()}
      </Card>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
            <h2 className="mb-2 text-lg font-semibold text-brand-dark dark:text-brand-light">
                {connectedDevice ? `Live Session: ${connectedDevice.name}` : 'Connect Your Gear'}
            </h2>
            {connectedDevice ? (
                <>
                    <div className="my-4 flex items-center justify-center gap-4 text-center">
                        <div className="w-1/2">
                            <p className="text-4xl font-bold text-red-500 animate-pulse-subtle">{heartRate || '--'}</p>
                            <p className="text-sm text-brand-gray dark:text-gray-400">Live HR (bpm)</p>
                        </div>
                        <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="w-1/2">
                            <p className="text-4xl font-bold text-brand-dark dark:text-brand-light">{heartRateHistory.length}</p>
                            <p className="text-sm text-brand-gray dark:text-gray-400">Data Points</p>
                        </div>
                    </div>
                    {heartRateHistory.length > 1 && (
                        <LiveHeartRateChart data={heartRateHistory.map(hr => ({ hr }))} />
                    )}
                </>
            ) : (
                <>
                    <p className="text-brand-gray dark:text-gray-400 mb-4">Sync your devices for live data and deeper insights into your performance.</p>
                    <div className="flex justify-center gap-8 my-4">
                        <WatchIcon />
                        <HeartIcon />
                        <PlusIcon />
                    </div>
                    <button
                        className="w-full rounded-lg bg-brand-blue py-3 font-bold text-white transition hover:bg-blue-600"
                        onClick={() => setDeviceModalOpen(true)}
                    >
                        Connect Now
                    </button>
                </>
            )}
        </Card>
      </motion.div>
      
      {latestWorkoutAnalysis && latestActivityWithHR && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
                <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Latest Workout Analysis</h2>
                <div className="my-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-2xl font-bold text-brand-dark dark:text-brand-light">{latestWorkoutAnalysis.avg}</p>
                        <p className="text-xs text-brand-gray dark:text-gray-400">Avg HR</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-dark dark:text-brand-light">{latestWorkoutAnalysis.max}</p>
                        <p className="text-xs text-brand-gray dark:text-gray-400">Max HR</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-dark dark:text-brand-light">{latestWorkoutAnalysis.min}</p>
                        <p className="text-xs text-brand-gray dark:text-gray-400">Min HR</p>
                    </div>
                </div>
                <HeartRateZoneChart zones={latestWorkoutAnalysis.zones} />
                
                {latestActivityWithHR.aiInsight ? (
                    <div className="mt-4 rounded-lg bg-brand-green/10 p-3 dark:bg-brand-green/20">
                        <h3 className="mb-1 flex items-center gap-2 text-md font-semibold text-brand-dark dark:text-brand-light">
                            <LightbulbIcon />
                            AI Coach Insight
                        </h3>
                        <p className="text-sm text-brand-gray dark:text-gray-400">{latestActivityWithHR.aiInsight}</p>
                    </div>
                ) : (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-100 p-3 text-sm text-brand-gray dark:bg-gray-700 dark:text-gray-400">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="h-4 w-4 shrink-0 rounded-full border-2 border-t-brand-blue border-gray-400"
                        />
                        <span>AI insight for this workout is being generated...</span>
                    </div>
                )}
            </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-brand-dark dark:text-brand-light">Start a Fundraiser</h2>
          <p className="text-brand-gray dark:text-gray-400 mb-4">Planning a big tour? Let the community support you.</p>
          <button 
            onClick={() => setActiveScreen('FundraiserList')}
            className="w-full rounded-lg bg-brand-dark py-3 font-bold text-white transition hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
            View Campaigns
          </button>
        </Card>
      </motion.div>
      
      <DeviceConnectModal isOpen={isDeviceModalOpen} onClose={() => setDeviceModalOpen(false)} />
    </div>
  );
};

export default HomeScreen;
