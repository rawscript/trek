

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevice } from '../../hooks/useDevice';

// Widen JSX to allow for the spline-viewer custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
        }
    }
}


interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icons
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

const SplineAnimation = () => (
    <div className="relative flex h-56 w-56 items-center justify-center">
        <spline-viewer
            url="https://prod.spline.design/V2p3G-I1q5-738dG/scene.splinecode"
            className="h-full w-full"
        ></spline-viewer>
    </div>
);


const DeviceConnectModal: React.FC<DeviceConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect, isConnecting, connectedDevice, connectionError } = useDevice();
  
  const handleConnectClick = () => {
    connect();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative w-full max-w-sm rounded-2xl bg-brand-light p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-brand-gray transition-colors hover:text-brand-dark dark:hover:text-white">
                <CloseIcon />
            </button>
            
            <div className="text-center">
              {!connectedDevice && (
                <>
                  <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Connect Your Gear</h2>
                  <p className="mt-2 text-brand-gray dark:text-gray-400">Searching for smartwatches, heart rate monitors, and more.</p>
                  <div className="my-6 flex justify-center">
                    <SplineAnimation />
                  </div>
                  {isConnecting && <p className="text-brand-blue">Connecting... Please check your device and browser prompts.</p>}
                  {connectionError && <p className="mt-2 text-sm text-red-500">{connectionError}</p>}
                  <button
                    onClick={handleConnectClick}
                    disabled={isConnecting}
                    className="mt-4 w-full rounded-lg bg-brand-blue py-3 font-bold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isConnecting ? 'Scanning...' : 'Start Scan'}
                  </button>
                </>
              )}

              {connectedDevice && (
                <>
                  <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Successfully Connected!</h2>
                  <div className="my-8 flex justify-center">
                      <motion.div 
                        className="flex h-48 w-48 items-center justify-center rounded-full bg-brand-green"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                      >
                          <CheckIcon />
                      </motion.div>
                  </div>
                  <p className="text-lg text-brand-dark dark:text-brand-light">
                      You are now synced with <span className="font-bold">{connectedDevice.name}</span>.
                  </p>
                   <p className="mt-2 text-brand-gray dark:text-gray-400">You can now close this window. Your data will sync automatically.</p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeviceConnectModal;