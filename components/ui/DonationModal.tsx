
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, message: string) => void;
  fundraiserTitle: string;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onSubmit, fundraiserTitle }) => {
    const [amount, setAmount] = useState(25);
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

    const handleDetailsSubmit = () => {
        if (amount > 0) {
            setStep(2);
        }
    };
    
    const handlePaymentSelect = () => {
        // Simulate processing
        setStep(3);
        setTimeout(() => {
            onSubmit(amount, message);
        }, 1500); // Wait for success animation
    };

    const handleClose = () => {
        onClose();
        // Reset state after a delay to allow for exit animation
        setTimeout(() => {
            setAmount(25);
            setMessage('');
            setStep(1);
        }, 300);
    }
  
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Support Campaign</h2>
                        <p className="mt-1 truncate text-brand-gray dark:text-gray-400">for "{fundraiserTitle}"</p>
                        
                        <div className="my-6">
                            <label htmlFor="donation-amount" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Amount ($)</label>
                            <input
                                id="donation-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                min="1"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-2xl font-bold text-brand-dark dark:text-white shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="donation-message" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Leave a message (optional)</label>
                            <textarea
                                id="donation-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="Go for it!"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-brand-dark dark:text-white shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50"
                            />
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={handleClose} className="w-1/2 rounded-lg bg-gray-200 dark:bg-gray-600 py-3 font-bold text-brand-dark dark:text-brand-light transition-colors hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button onClick={handleDetailsSubmit} disabled={amount <= 0} className="w-1/2 rounded-lg bg-brand-green py-3 font-bold text-white shadow-md transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-400">Next</button>
                        </div>
                    </>
                );
            case 2:
                return (
                     <>
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Choose Payment</h2>
                        <p className="mt-1 text-brand-gray dark:text-gray-400">Confirming your ${amount} donation.</p>
                        <div className="my-6 space-y-3">
                            <PaymentButton icon="💳" label="Credit Card" onClick={handlePaymentSelect} />
                            <PaymentButton icon="🅿️" label="PayPal" onClick={handlePaymentSelect} />
                            <PaymentButton icon="🇬" label="Google Pay" onClick={handlePaymentSelect} />
                            <PaymentButton icon="" label="Apple Pay" onClick={handlePaymentSelect} />
                        </div>
                        <button onClick={() => setStep(1)} className="w-full text-center text-sm text-brand-gray dark:text-gray-400 hover:underline">Back</button>
                     </>
                );
            case 3:
                 return (
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                            <div className="h-16 w-16 rounded-full border-4 border-t-brand-green border-gray-200 dark:border-gray-600 animate-spin"></div>
                        </motion.div>
                        <p className="mt-4 font-semibold text-brand-dark dark:text-brand-light">Processing your donation...</p>
                    </div>
                 );
        }
    }
  
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="w-full max-w-sm rounded-2xl bg-brand-light dark:bg-gray-800 p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                       <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                       </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const PaymentButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 rounded-lg bg-white dark:bg-gray-700 p-4 text-left font-semibold text-brand-dark dark:text-brand-light shadow-sm transition-all hover:shadow-md hover:scale-105">
        <span className="text-2xl">{icon}</span>
        <span>{label}</span>
    </button>
)


export default DonationModal;