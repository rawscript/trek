import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAvatarImages } from '../../services/geminiService';
import ErrorDisplay from './ErrorDisplay';
import { logger } from '../../config/env';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect: (url: string) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ImageGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onAvatarSelect }) => {
    const [prompt, setPrompt] = useState('A friendly cyclist with sunglasses');
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPresets, setShowPresets] = useState(false);

    // Suggested prompts for better avatar generation
    const suggestedPrompts = [
        'A friendly cyclist with sunglasses',
        'A happy runner in athletic gear',
        'A mountain biker with a helmet',
        'A yoga enthusiast in peaceful pose',
        'A fitness trainer with a smile'
    ];

    // Predefined avatar options as additional fallback
    const presetAvatars = [
        'https://api.dicebear.com/7.x/adventurer/svg?seed=fitness-runner',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=cyclist-pro',
        'https://api.dicebear.com/7.x/big-smile/svg?seed=happy-athlete',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sporty-person',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=mountain-biker',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=trail-runner',
        'https://api.dicebear.com/7.x/big-smile/svg?seed=fitness-enthusiast',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=active-lifestyle'
    ];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setImages([]);
        try {
            logger.info("Starting avatar generation with prompt:", prompt);
            const generatedImages = await generateAvatarImages(prompt);
            
            if (generatedImages && generatedImages.length > 0) {
                setImages(generatedImages);
                logger.info("Successfully generated", generatedImages.length, "avatars");
            } else {
                throw new Error("No avatars were generated. Please try a different description.");
            }
        } catch (err: any) {
            logger.error("Avatar generation error:", err);
            setError(err.message || "Failed to generate avatars. Please try again with a different description.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (url: string) => {
        onAvatarSelect(url);
        onClose();
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

                        <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Create Your Avatar</h2>
                        <p className="mt-1 text-sm text-brand-gray dark:text-gray-400">Choose from presets or generate custom avatars with AI.</p>

                        {/* Tab Navigation */}
                        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                            <button
                                onClick={() => setShowPresets(false)}
                                className={`rounded-md py-2 text-sm font-semibold transition-colors ${!showPresets ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                            >
                                🤖 AI Generate
                            </button>
                            <button
                                onClick={() => setShowPresets(true)}
                                className={`rounded-md py-2 text-sm font-semibold transition-colors ${showPresets ? 'bg-white text-brand-blue shadow dark:bg-gray-800' : 'text-brand-gray dark:text-gray-400'}`}
                            >
                                🎨 Presets
                            </button>
                        </div>

                        {!showPresets && (
                            <div className="mt-4 flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A running tiger in pixel art style"
                                className="flex-grow rounded-md border-gray-300 bg-white p-2 text-sm text-brand-dark shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="flex shrink-0 items-center gap-2 rounded-md bg-brand-blue px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                <ImageGeneratorIcon />
                                Generate
                            </button>
                        </div>
                        )}

                        <div className="mt-4 min-h-[16rem]">
                            {showPresets ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {presetAvatars.map((avatar, i) => (
                                        <motion.button
                                            key={i}
                                            onClick={() => handleSelect(avatar)}
                                            className="overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-brand-green hover:scale-105 focus:border-brand-green focus:scale-105"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img src={avatar} alt={`Preset avatar ${i+1}`} className="aspect-square w-full object-cover" />
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <>
                            {isLoading && (
                                <div className="flex h-full flex-col items-center justify-center text-brand-gray dark:text-gray-400">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-8 w-8 rounded-full border-4 border-t-brand-blue border-gray-400"
                                    />
                                    <p className="mt-2 text-sm font-semibold">Generating with AI...</p>
                                </div>
                            )}
                            {error && <ErrorDisplay title="Generation Failed" message={error} onRetry={handleGenerate} />}

                            {!isLoading && images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, i) => (
                                        <motion.button
                                            key={i}
                                            onClick={() => handleSelect(img)}
                                            className="overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-brand-green hover:scale-105 focus:border-brand-green focus:scale-105"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img src={img} alt={`Generated avatar ${i+1}`} className="aspect-square w-full object-cover" />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                             {!isLoading && images.length === 0 && !error && (
                                <div className="flex h-full flex-col items-center justify-center text-brand-gray dark:text-gray-400">
                                    <p>Your generated avatars will appear here.</p>
                                </div>
                             )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AvatarSelectionModal;