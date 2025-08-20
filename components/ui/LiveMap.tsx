import React from 'react';
import { motion } from 'framer-motion';
import { Coords } from '../../types';

interface LiveMapProps {
  path: Coords[];
}

const normalizePath = (path: Coords[], width: number, height: number, padding: number) => {
  if (path.length < 2) {
    return path.map(() => ({ x: width / 2, y: height / 2 }));
  }

  const lats = path.map(p => p.latitude);
  const longs = path.map(p => p.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...longs);
  const maxLon = Math.max(...longs);

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  const scaleX = (width - 2 * padding) / (lonRange || 1);
  const scaleY = (height - 2 * padding) / (latRange || 1);
  const scale = Math.min(scaleX, scaleY);

  return path.map(p => {
    const x = ((p.longitude - minLon) * scale) + padding;
    const y = ((maxLat - p.latitude) * scale) + padding;
    return { x, y };
  });
};

const LiveMap: React.FC<LiveMapProps> = ({ path }) => {
  const width = 300;
  const height = 200;
  const padding = 20;

  const normalizedPoints = normalizePath(path, width, height, padding);
  const pathData = normalizedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const startPoint = normalizedPoints[0];
  const currentPoint = normalizedPoints[normalizedPoints.length - 1];

  return (
    <div className="rounded-xl bg-gray-200 p-2 shadow-inner">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        {path.length > 0 && (
          <motion.path
            d={pathData}
            fill="none"
            stroke="rgba(96, 165, 250, 0.7)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        )}
        {startPoint && (
          <motion.circle
            cx={startPoint.x}
            cy={startPoint.y}
            r="5"
            fill="#34D399"
            stroke="white"
            strokeWidth="2"
          />
        )}
        {currentPoint && (
           <motion.circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r="6"
            fill="#60A5FA"
            stroke="white"
            strokeWidth="2"
          >
            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
          </motion.circle>
        )}
      </svg>
    </div>
  );
};

export default LiveMap;
