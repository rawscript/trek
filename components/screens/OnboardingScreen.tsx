
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import TrekGuide from '../ui/TrekGuide';
import Confetti from '../ui/Confetti';

const onboardingSteps = [
  {
    title: 'Track Your Adventures',
    text: 'Start a run or a cycle, set your goals, and see your progress in real-time.',
  },
  {
    title: 'Explore with Live Maps',
    text: 'Find your way, discover new routes, and locate amenities with our interactive map.',
  },
  {
    title: 'Join the Community',
    text: 'Share your activities and support fundraisers from fellow adventurers in the social feed.',
  },
  {
    title: 'Plan with Your AI Coach',
    text: 'Get route suggestions, motivation, and insights from your personal AI planner.',
  },
];

const OnboardingScreen: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);

  const isFinalStep = step >= onboardingSteps.length;
  const progress = onboardingSteps.length > 1 ? step / (onboardingSteps.length - 1) : 1;

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-between bg-brand-dark p-6 text-white overflow-hidden">
      
      {/* Top section for animated text content */}
      <div className="w-full text-center pt-10">
        <AnimatePresence mode="wait">
          {!isFinalStep ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-brand-green">
                Welcome, {user?.name}!
              </h1>
              <div className="mt-12">
                <h2 className="text-2xl font-semibold">{onboardingSteps[step].title}</h2>
                <p className="mt-2 text-brand-gray">{onboardingSteps[step].text}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            >
              <Confetti />
              <h1 className="text-5xl font-bold">You're All Set!</h1>
              <p className="mt-4 text-lg text-brand-gray">
                Your adventure is waiting. Let's get moving!
              </p>
              <button
                onClick={completeOnboarding}
                className="mt-12 rounded-full bg-brand-green px-12 py-4 text-xl font-bold text-brand-dark shadow-lg transition-transform hover:scale-105"
              >
                Let's Go!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom section for persistent progress bar and navigation */}
      {!isFinalStep && (
        <motion.div 
          className="w-full shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-10 w-full">
            <div className="relative h-1.5 rounded-full bg-gray-600 mx-16">
              <motion.div 
                className="h-full rounded-full bg-brand-green"
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              />
              <TrekGuide progress={progress} />
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-brand-gray">{step + 1} / {onboardingSteps.length}</div>
            <button
              onClick={handleNext}
              className="rounded-full bg-brand-green px-8 py-3 font-bold text-brand-dark transition-transform hover:scale-105"
            >
              {step === onboardingSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingScreen;
