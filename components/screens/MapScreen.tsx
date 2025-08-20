import React, { useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion';
import { Coords, Amenity, AmenityType } from '../../types';
import InteractiveMap from '../ui/InteractiveMap';
import YandexMap from '../ui/YandexMap';
import { haversineDistance, calculateBearing } from '../../utils/geolocation';
import { speak } from '../../services/ttsService';
import { mapsService } from '../../services/mapsService';
import { useLocation } from '../../hooks/useLocation';
import Card from '../ui/Card';


// Mock amenities around a central point (e.g., San Francisco)
const centerPoint = { latitude: 37.7749, longitude: -122.4194 };
const allAmenities: Amenity[] = [
  { id: 'a1', name: 'Parkside Fountain', type: 'water', coords: { latitude: 37.7755, longitude: -122.4180 } },
  { id: 'a2', name: 'Mike\'s Bikes', type: 'bike_shop', coords: { latitude: 37.7720, longitude: -122.4210 } },
  { id: 'a3', name: 'Civic Center Restrooms', type: 'restroom', coords: { latitude: 37.7790, longitude: -122.4194 } },
  { id: 'a4', name: 'Trailhead Water Spout', type: 'water', coords: { latitude: 37.7710, longitude: -122.4150 } },
  { id: 'a5', name: 'The Bike Doctor', type: 'bike_shop', coords: { latitude: 37.7785, longitude: -122.4250 } },
];

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const MapScreen: React.FC = () => {
    const { position: userPosition, error, loading } = useLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        distanceInterval: 10
    });
    const [activeFilters, setActiveFilters] = useState<Set<AmenityType>>(new Set(['water', 'bike_shop', 'restroom']));
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFilter = (filter: AmenityType) => {
        setActiveFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(filter)) {
                newFilters.delete(filter);
            } else {
                newFilters.add(filter);
            }
            return newFilters;
        });
    };

    const handleAmenitySelect = (amenity: Amenity) => {
        if (!userPosition) return;
        const distanceKm = haversineDistance(userPosition, amenity.coords);
        const distanceMeters = Math.round(distanceKm * 1000);
        const bearing = calculateBearing(userPosition, amenity.coords);
        
        const guidance = `${amenity.name} is about ${distanceMeters} meters to the ${bearing}.`;
        speak(guidance);
    };

    const filteredAmenities = useMemo(() => {
        return allAmenities
            .filter(amenity => activeFilters.has(amenity.type))
            .filter(amenity => 
                amenity.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [activeFilters, searchQuery]);

    return (
        <div>
            <h1 className="mb-4 text-3xl font-bold text-brand-dark dark:text-brand-light">Live Map</h1>
            <Card>
                {error && <p className="mb-4 text-center text-red-500">{error}</p>}
                {loading && (
                    <div className="flex h-80 flex-col items-center justify-center text-brand-gray dark:text-gray-400">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-8 w-8 rounded-full border-4 border-t-brand-blue border-gray-200 dark:border-gray-600"
                        />
                        <p className="mt-4">Acquiring GPS signal...</p>
                    </div>
                )}
                <AnimatePresence>
                    {userPosition && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {Platform.OS === 'web' ? (
                                <InteractiveMap
                                    userPosition={userPosition}
                                    amenities={filteredAmenities}
                                    onAmenitySelect={handleAmenitySelect}
                                />
                            ) : (
                                <YandexMap
                                    userPosition={userPosition}
                                    amenities={filteredAmenities}
                                    onAmenitySelect={handleAmenitySelect}
                                    height={320}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            <div className="mt-6">
                <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">Find Amenities</h2>
                <p className="mb-3 text-sm text-brand-gray dark:text-gray-400">Tap an amenity for voice guidance.</p>
                
                <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-3 pl-10 text-brand-dark dark:text-white shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <FilterButton type="water" label="Water" icon="💧" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                    <FilterButton type="bike_shop" label="Bike Shops" icon="🚲" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                    <FilterButton type="restroom" label="Restrooms" icon="🚻" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                </div>
                
                {filteredAmenities.length === 0 && searchQuery && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center text-brand-gray dark:text-gray-400"
                    >
                        <p>No results found for "{searchQuery}".</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

interface FilterButtonProps {
    type: AmenityType;
    label: string;
    icon: string;
    activeFilters: Set<AmenityType>;
    toggleFilter: (filter: AmenityType) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ type, label, icon, activeFilters, toggleFilter }) => {
    const isActive = activeFilters.has(type);
    return (
        <button
            onClick={() => toggleFilter(type)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                isActive ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-gray-800 text-brand-gray dark:text-gray-300 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );
};

export default MapScreen;