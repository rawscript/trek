
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinishConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onContinue: () => void;
  onConfirm: () => void;
}

const FinishConfirmationModal: React.FC<FinishConfirmationModalProps> = ({ isOpen, message, onContinue, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onContinue}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-full max-w-sm rounded-2xl bg-brand-light p-6 shadow-xl text-center dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Hold On!</h2>
            <p className="my-4 text-brand-gray dark:text-gray-400 min-h-[4rem] flex items-center justify-center">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={onContinue}
                className="w-full rounded-lg bg-brand-green py-3 font-bold text-white shadow-md transition-transform hover:scale-105"
              >
                Continue Trek
              </button>
              <button
                onClick={onConfirm}
                className="w-full rounded-lg bg-transparent py-3 font-bold text-red-500 transition-colors hover:bg-red-500/10"
              >
                Finish Anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinishConfirmationModal;