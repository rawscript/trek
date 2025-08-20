import React from 'react';

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message, onRetry }) => {
  return (
    <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-4 text-center dark:bg-red-500/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center">
          <ErrorIcon />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-red-800 dark:text-red-300">{title}</h3>
      <p className="mt-1 text-sm text-red-700 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
