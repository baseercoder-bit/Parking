import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParkingCircle, Loader2 } from 'lucide-react';
import { zonesApi, locationsApi } from '../../services/api';
import type { Zone, LocationStats } from '../../services/api';
import { onParkingUpdate, offParkingUpdate, joinLocation, leaveLocation, connectSocket } from '../../services/socket';
import ZoneCard from './ZoneCard';

interface ParkingDisplayProps {
  locationId: string;
}

export default function ParkingDisplay({ locationId }: ParkingDisplayProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!locationId) return;

      try {
        setLoading(true);
        setError(null);

        // Connect socket and join location room
        connectSocket();
        joinLocation(locationId);

        // Fetch zones and stats
        const [zonesResponse, statsResponse] = await Promise.all([
          zonesApi.getByLocation(locationId),
          locationsApi.getStats(locationId),
        ]);

        setZones(zonesResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        setError('Failed to load parking data');
        console.error('Error fetching parking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time updates
    const handleUpdate = (data: { zone: Zone; type: string }) => {
      if (data.type === 'delete') {
        setZones((prev) => prev.filter((z) => z.id !== data.zone.id));
      } else {
        setZones((prev) => {
          const index = prev.findIndex((z) => z.id === data.zone.id);
          if (index === -1) {
            return [...prev, data.zone];
          }
          return prev.map((z) => (z.id === data.zone.id ? data.zone : z));
        });
      }

      // Refresh stats
      locationsApi.getStats(locationId).then((response) => {
        setStats(response.data);
      });
    };

    onParkingUpdate(handleUpdate);

    return () => {
      offParkingUpdate(handleUpdate);
      leaveLocation(locationId);
    };
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-gray-400"
        >
          <Loader2 className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Total Stats Card */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black rounded-2xl p-4 sm:p-5 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <ParkingCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Parking Overview</h2>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-center">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 font-medium">Available</div>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--primary-blue)' }}>{stats.availableSpots}</div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 font-medium">Occupied</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.occupiedSpots}</div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <div className="text-xs text-gray-500 font-medium">Total</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSpots}</div>
              </div>
              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex flex-col hidden sm:flex">
                <div className="text-xs text-gray-500 font-medium">Zones</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.zones.length}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Zones Grid */}
      <div className="mt-[10px]">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Parking Zones</h3>
        {zones.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-gray-50 rounded-xl border border-gray-200">
            <ParkingCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No zones available for this location</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {zones.map((zone, index) => (
                <ZoneCard key={zone.id} zone={zone} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

