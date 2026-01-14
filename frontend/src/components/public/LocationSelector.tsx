import { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { locationsApi } from '../../services/api';
import type { Location } from '../../services/api';

interface LocationSelectorProps {
  selectedLocationId: string | null;
  onLocationChange: (locationId: string) => void;
}

export default function LocationSelector({ selectedLocationId, onLocationChange }: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await locationsApi.getAll();
        setLocations(response.data);
        
        // Auto-select first location if none selected
        if (!selectedLocationId && response.data.length > 0) {
          onLocationChange(response.data[0].id);
        }
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [selectedLocationId, onLocationChange]);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 bg-white border border-gray-200/50 rounded-lg sm:rounded-xl shadow-apple hover:shadow-apple-lg transition-all duration-200"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
              {selectedLocation?.name || 'Select Location'}
            </div>
            {selectedLocation?.address && (
              <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                {selectedLocation.address}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200/50 rounded-xl shadow-apple-xl overflow-hidden"
          >
            {locations.map((location) => (
              <motion.button
                key={location.id}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                onClick={() => {
                  onLocationChange(location.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-semibold text-gray-900">{location.name}</div>
                {location.address && (
                  <div className="text-sm text-gray-500 mt-1">{location.address}</div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

