import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ParkingCircle, Loader2 } from 'lucide-react';
import { zonesApi, locationsApi } from '../services/api';
import type { Zone, LocationStats, Location } from '../services/api';
import { connectSocket, disconnectSocket, onParkingUpdate, offParkingUpdate, joinLocation, leaveLocation } from '../services/socket';
import ZoneManager from '../components/admin/ZoneManager';
import SpotCounter from '../components/admin/SpotCounter';
import ImageUpload from '../components/admin/ImageUpload';

export default function AdminDashboard() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const adminData = localStorage.getItem('adminData');
  const locationId = adminData ? JSON.parse(adminData).locationId : null;

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token || !locationId) {
      navigate('/admin/login');
      return;
    }

    // Connect socket
    connectSocket();
    joinLocation(locationId);

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [zonesResponse, statsResponse, locationResponse] = await Promise.all([
          zonesApi.getByLocation(locationId),
          locationsApi.getStats(locationId),
          locationsApi.getById(locationId),
        ]);

        setZones(zonesResponse.data);
        setStats(statsResponse.data);
        setLocation(locationResponse.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/admin/login');
        } else {
          setError('Failed to load dashboard data');
          console.error('Error fetching dashboard data:', err);
        }
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
      disconnectSocket();
    };
  }, [locationId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    disconnectSocket();
    navigate('/admin/login');
  };

  const handleZoneUpdate = (updatedZones: Zone[]) => {
    setZones(updatedZones);
    // Refresh stats
    locationsApi.getStats(locationId).then((response) => {
      setStats(response.data);
    });
  };

  const handleSpotUpdate = (updatedZone: Zone) => {
    setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
    // Refresh stats
    locationsApi.getStats(locationId).then((response) => {
      setStats(response.data);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-islamic-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-islamic-600 text-white rounded-xl font-semibold hover:bg-islamic-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminInfo = adminData ? JSON.parse(adminData) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--white)' }}>
      {/* Header */}
      <header className="backdrop-blur-md shadow-lg sticky top-0 z-40" style={{ backgroundColor: 'var(--primary-blue)', borderBottom: '1px solid var(--primary-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--white)' }}>Admin Dashboard</h1>
              {adminInfo && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Location: {adminInfo.locationName}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-500/90 hover:bg-red-600 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 sm:p-8 shadow-xl mb-8 border-2"
          style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)', borderColor: 'var(--primary-blue)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ParkingCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Parking Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm opacity-90 mb-2 font-medium">Total Spots</div>
                <div className="text-3xl sm:text-4xl font-bold">{stats.totalSpots}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm opacity-90 mb-2 font-medium">Available</div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--white)' }}>{stats.availableSpots}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm opacity-90 mb-2 font-medium">Occupied</div>
                <div className="text-3xl sm:text-4xl font-bold text-red-300">{stats.occupiedSpots}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm opacity-90 mb-2 font-medium">Zones</div>
                <div className="text-3xl sm:text-4xl font-bold">{stats.zones.length}</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Zone Management */}
          <section>
            <ZoneManager
              zones={zones}
              locationId={locationId}
              onZoneUpdate={handleZoneUpdate}
            />
          </section>

          {/* Spot Counters */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Update Spot Counts</h2>
            {zones.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                <ParkingCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No zones available. Create a zone first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone, index) => (
                  <SpotCounter
                    key={zone.id}
                    zone={zone}
                    onUpdate={handleSpotUpdate}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Image Upload */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Parking Lot Image</h2>
            <p className="text-sm text-slate-600 mb-4">
              Upload an image of your parking lot showing the zones. This will be displayed on the public view.
            </p>
            {location && (
              <ImageUpload
                locationId={locationId}
                currentImageUrl={location.imageUrl}
                onImageUpdate={(imageUrl) => {
                  setLocation({ ...location, imageUrl });
                }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

