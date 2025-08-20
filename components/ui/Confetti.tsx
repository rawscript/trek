
import React from 'react';
import { motion } from 'framer-motion';

const colors = ['#34D399', '#60A5FA', '#FBBF24', '#F87171'];

const ConfettiPiece = ({ x, y, rotate, color }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
        backgroundColor: color,
        width: 10,
        height: 10,
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{
        x: x,
        y: y,
        opacity: 0,
        rotate: rotate,
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
};

const Confetti: React.FC = () => {
  const pieces = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 100 + Math.random() * 150;
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        rotate: Math.random() * 360,
        color: colors[i % colors.length],
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {pieces.map(piece => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
};

export default Confetti;