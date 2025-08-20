import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScreenName, User } from '../../types';
import { useFundraiser } from '../../hooks/useFundraiser';
import { useAuth } from '../../hooks/useAuth';
import { generateCampaignImage } from '../../services/geminiService';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ImageGeneratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);


interface CreateFundraiserScreenProps {
  setActiveScreen: (screen: ScreenName) => void;
}

const CreateFundraiserScreen: React.FC<CreateFundraiserScreenProps> = ({ setActiveScreen }) => {
  const { addFundraiser } = useFundraiser();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState(1000);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Auto-update image prompt from title
  useEffect(() => {
    if (title.length > 5) {
        setImagePrompt(title);
    }
  }, [title]);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    setImageUrl('');
    try {
        const generatedUrl = await generateCampaignImage(imagePrompt);
        setImageUrl(generatedUrl);
    } catch (error) {
        setImageError('Could not generate image. Please try a different prompt.');
        console.error(error);
    } finally {
        setIsGeneratingImage(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user || !imageUrl) return;
    addFundraiser({
      creator: user as User,
      title,
      description,
      goal,
      imageUrl,
    });
    setActiveScreen('FundraiserList');
  };

  const isFormValid = title.trim() && description.trim() && goal > 0 && !!imageUrl;

  return (
    <div>
        <div className="mb-6 flex items-center gap-4">
            <button onClick={() => setActiveScreen('FundraiserList')} className="text-brand-dark dark:text-brand-light">
                <ArrowLeftIcon />
            </button>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">New Campaign</h1>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Campaign Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Cycle for Charity"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-3 text-brand-dark dark:text-gray-200 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Tell Your Story</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Why are you raising funds?"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-3 text-brand-dark dark:text-gray-200 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50"
            required
          />
        </div>
        
        {/* Image Generation Section */}
        <div>
            <label htmlFor="imagePrompt" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Campaign Image</label>
            <p className="text-xs text-brand-gray dark:text-gray-500 mb-2">Describe the image you want for your campaign banner.</p>

            <motion.div layout className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
                <div className="relative flex h-48 items-center justify-center bg-gray-200 dark:bg-gray-700">
                    {isGeneratingImage && (
                         <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center text-brand-gray dark:text-gray-400"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-8 w-8 rounded-full border-4 border-t-brand-blue border-gray-400"
                            />
                            <p className="mt-2 text-sm font-semibold">Generating with AI...</p>
                        </motion.div>
                    )}
                    {imageUrl && !isGeneratingImage && (
                        <motion.img
                            src={imageUrl}
                            alt="Generated campaign image"
                            className="h-full w-full object-cover"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        />
                    )}
                    {!imageUrl && !isGeneratingImage && (
                         <div className="text-center text-brand-gray dark:text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <p className="mt-1 text-sm">Image will appear here</p>
                         </div>
                    )}
                </div>
                <div className="p-3">
                    <div className="flex gap-2">
                        <input
                            id="imagePrompt"
                            type="text"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="e.g., A runner on a mountain peak at sunrise"
                            className="flex-grow rounded-md border-gray-300 bg-white p-2 text-sm text-brand-dark shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !imagePrompt.trim()}
                            className="flex shrink-0 items-center rounded-md bg-brand-blue px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            <ImageGeneratorIcon />
                            Generate
                        </button>
                    </div>
                     {imageError && <p className="mt-2 text-xs text-center text-red-500">{imageError}</p>}
                </div>
            </motion.div>
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-brand-gray dark:text-gray-400">Goal Amount ($)</label>
          <input
            id="goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-3 text-brand-dark dark:text-gray-200 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/50"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-dark py-3 font-bold text-white shadow-md transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          disabled={!isFormValid || isGeneratingImage}
        >
          {isGeneratingImage ? 'Generating Image...' : 'Launch Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateFundraiserScreen;