import React from 'react';
import { motion } from 'framer-motion';
import { Coords, Amenity, AmenityType } from '../../types';
import { haversineDistance } from '../../utils/geolocation';

interface InteractiveMapProps {
  userPosition: Coords;
  amenities: Amenity[];
  onAmenitySelect: (amenity: Amenity) => void;
}

// Simple icons for amenities
const AmenityIcon: React.FC<{ type: AmenityType }> = ({ type }) => {
  switch (type) {
    case 'water':
      return <path d="M12 2L6.5 8c-1.5 2-1.5 5 0 7s4.5 2 6 0l5.5-5.5c1.5-2 1.5-5 0-7L12 2z" stroke="#60A5FA" fill="#60A5FA44" strokeWidth="1.5" />;
    case 'bike_shop':
      return <path d="M16 8a4 4 0 10-8 0 4 4 0 008 0zm-4 8a4 4 0 100-8 4 4 0 000 8zm0 0l-4 4h8l-4-4z" stroke="#34D399" fill="#34D39944" strokeWidth="1.5" />;
    case 'restroom':
      return <path d="M8 8v8m4-8v8m-6-4h8M5 3h14v18H5z" stroke="#FBBF24" fill="#FBBF2444" strokeWidth="1.5" />;
    default:
      return <circle cx="12" cy="12" r="6" fill="#9CA3AF" />;
  }
};

// Convert GPS distance (km) to pixels on our map
const kmToPixels = (km: number, scale: number) => km * scale;

const InteractiveMap: React.FC<InteractiveMapProps> = ({ userPosition, amenities, onAmenitySelect }) => {
  const mapSize = 300;
  const mapCenter = mapSize / 2;
  const maxDistanceKm = 1; // Show amenities within a 1km radius
  const mapScale = mapSize / (2 * maxDistanceKm); // Pixels per km

  return (
    <div className="relative h-80 w-full rounded-2xl bg-gray-100 p-2 shadow-inner overflow-hidden">
      <svg viewBox={`0 0 ${mapSize} ${mapSize}`} className="h-full w-full">
        {/* Radar-like background rings */}
        <circle cx={mapCenter} cy={mapCenter} r={mapSize * 0.25} fill="none" stroke="#D1D5DB" strokeWidth="1" />
        <circle cx={mapCenter} cy={mapCenter} r={mapSize * 0.5} fill="none" stroke="#D1D5DB" strokeWidth="1" />
        
        {amenities.map(amenity => {
          const distance = haversineDistance(userPosition, amenity.coords);
          if (distance > maxDistanceKm) return null;

          // Calculate bearing angle
          const dy = userPosition.latitude - amenity.coords.latitude;
          const dx = amenity.coords.longitude - userPosition.longitude;
          const angle = Math.atan2(dy, dx);

          // Position amenity on map
          const pixelDist = kmToPixels(distance, mapScale);
          const x = mapCenter + Math.cos(angle) * pixelDist;
          const y = mapCenter - Math.sin(angle) * pixelDist;

          return (
            <motion.g
              key={amenity.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => onAmenitySelect(amenity)}
              className="cursor-pointer group"
            >
              <circle cx={x} cy={y} r="14" fill="white" className="transition-opacity group-hover:opacity-50" />
              <svg x={x-12} y={y-12} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <AmenityIcon type={amenity.type} />
              </svg>
            </motion.g>
          );
        })}

        {/* User's position marker */}
        <g>
          <motion.circle
            cx={mapCenter} cy={mapCenter} r="10" fill="#3B82F6" stroke="white" strokeWidth="3"
          >
             <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          </motion.circle>
          <text x={mapCenter} y={mapCenter + 24} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">You</text>
        </g>
      </svg>
    </div>
  );
};

export default InteractiveMap;
