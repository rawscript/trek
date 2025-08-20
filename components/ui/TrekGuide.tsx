
import React from 'react';
import { motion } from 'framer-motion';

interface TrekGuideProps {
  progress: number;
}

const TrekGuide: React.FC<TrekGuideProps> = ({ progress }) => {
  return (
    <motion.div
      className="absolute top-1/2 h-32 w-32"
      // Center the guide on the progress point
      style={{ x: '-50%', y: '-50%' }}
      animate={{ 
        left: `${progress * 100}%`,
        // Add a subtle vertical bounce to keep it lively
        y: ['-50%', '-60%', '-50%'],
      }}
      transition={{ 
        left: { type: 'spring', damping: 20, stiffness: 150 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Frame */}
        <path d="M40 50 L60 25 L85 25" stroke="#34D399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M78 50 L60 25" stroke="#34D399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 50 L78 50" stroke="#34D399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Seat */}
        <path d="M30 48 L42 48" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
        <line x1="40" y1="50" x2="40" y2="45" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        {/* Handlebars */}
        <line x1="85" y1="25" x2="95" y2="18" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        <line x1="92" y1="18" x2="100" y2="20" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        
        {/* Back Wheel */}
        <g transform="translate(40, 50)">
          <motion.g style={{ transformOrigin: 'center' }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <circle r="20" stroke="#6B7280" strokeWidth="3" fill="white"/>
            {/* Spokes */}
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-14.14" y1="-14.14" x2="14.14" y2="14.14" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-14.14" y1="14.14" x2="14.14" y2="-14.14" stroke="#9CA3AF" strokeWidth="1"/>
            <circle r="3" fill="#1F2937"/>
          </motion.g>
        </g>
        
        {/* Front Wheel */}
        <g transform="translate(95, 50)">
          <motion.g style={{ transformOrigin: 'center' }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <circle r="20" stroke="#6B7280" strokeWidth="3" fill="white"/>
            {/* Spokes */}
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-14.14" y1="-14.14" x2="14.14" y2="14.14" stroke="#9CA3AF" strokeWidth="1"/>
            <line x1="-14.14" y1="14.14" x2="14.14" y2="-14.14" stroke="#9CA3AF" strokeWidth="1"/>
            <circle r="3" fill="#1F2937"/>
          </motion.g>
        </g>
        
        {/* Pedals */}
        <g transform="translate(68, 50)">
            <motion.g style={{ transformOrigin: 'center' }} animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <circle r="6" stroke="#1F2937" strokeWidth="2" fill="none"/>
                <line x1="0" y1="0" x2="0" y2="10" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
                <line x1="-3" y1="10" x2="3" y2="10" stroke="#1F2937" strokeWidth="4" strokeLinecap="round"/>
            </motion.g>
        </g>
      </svg>
    </motion.div>
  );
};

export default TrekGuide;
