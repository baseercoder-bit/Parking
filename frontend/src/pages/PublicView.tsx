import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Loader2, Shield } from 'lucide-react';
import ParkingDisplay from '../components/public/ParkingDisplay';
import { locationsApi } from '../services/api';
import type { Location } from '../services/api';
import { connectSocket } from '../services/socket';

export default function PublicView() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect socket on mount
    connectSocket();

    const fetchLocations = async () => {
      try {
        setError(null);
        const response = await locationsApi.getAll();
        if (response.data.length > 0) {
          // Auto-select first location
          const firstLocation = response.data[0];
          setSelectedLocationId(firstLocation.id);
          // Fetch full location details with zones
          try {
            const locationDetails = await locationsApi.getById(firstLocation.id);
            setSelectedLocation(locationDetails.data);
          } catch (err) {
            // If getById fails, use basic location data
            setSelectedLocation(firstLocation);
          }
        } else {
          setError('No locations available. Please contact the administrator.');
        }
      } catch (err: any) {
        console.error('Error fetching locations:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load locations';
        const statusCode = err.response?.status;
        
        if (statusCode === 0 || err.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Please make sure the backend is running.');
        } else if (statusCode === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to load locations: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-indigo-600"
        >
          <Loader2 className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border-2 border-red-200 shadow-xl"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Locations</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Retry
              </button>
              <p className="text-xs text-gray-500">
                Make sure the backend server is running on port 3001
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="backdrop-blur-xl border-b sticky top-0 z-40 shadow-lg" style={{ backgroundColor: 'var(--primary-blue)', borderBottomColor: 'var(--primary-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center mb-8 relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--white)' }}>
                Parking Availability
              </h1>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Real-time parking information</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute right-0"
            >
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm sm:text-base backdrop-blur-sm rounded-xl transition-all duration-200 font-semibold"
                style={{ color: 'var(--white)', backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </motion.div>
          </div>

          {/* Location Info */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/50 shadow-apple hover:shadow-apple-lg transition-all duration-300"
            >
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedLocation.name}</div>
                  {selectedLocation.address && (
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{selectedLocation.address}</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {selectedLocationId ? (
          <>
            <ParkingDisplay locationId={selectedLocationId} />
            
            {/* Parking Lot Image */}
            {selectedLocation?.imageUrl && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 sm:mt-16"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Parking Lot Map</h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/50 shadow-apple-lg overflow-hidden">
                  <img
                    src={selectedLocation.imageUrl}
                    alt="Parking lot map showing zones"
                    className="w-full h-auto rounded-xl shadow-md max-h-[600px] object-contain bg-gray-50"
                  />
                </div>
              </motion.section>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Please select a location</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 sm:mt-16 lg:mt-24 py-8 sm:py-12 border-t border-indigo-200/50 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-700 font-medium">
            Real-time parking availability for mosques and religious institutions
          </p>
        </div>
      </footer>
    </div>
  );
}

