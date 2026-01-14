import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { zonesApi } from '../../services/api';
import type { Zone } from '../../services/api';

interface SpotCounterProps {
  zone: Zone;
  onUpdate: (updatedZone: Zone) => void;
}

type InputMode = 'occupied' | 'available';

export default function SpotCounter({ zone, onUpdate }: SpotCounterProps) {
  const [inputMode, setInputMode] = useState<InputMode>('occupied');
  const [occupiedSpots, setOccupiedSpots] = useState(zone.occupiedSpots);
  const [availableSpots, setAvailableSpots] = useState(zone.totalSpots - zone.occupiedSpots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleIncrement = () => {
    if (inputMode === 'occupied') {
      if (occupiedSpots < zone.totalSpots) {
        setOccupiedSpots(prev => prev + 1);
      }
    } else {
      if (availableSpots < zone.totalSpots) {
        setAvailableSpots(prev => prev + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (inputMode === 'occupied') {
      if (occupiedSpots > 0) {
        setOccupiedSpots(prev => prev - 1);
      }
    } else {
      if (availableSpots > 0) {
        setAvailableSpots(prev => prev - 1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (inputMode === 'occupied') {
      if (value >= 0 && value <= zone.totalSpots) {
        setOccupiedSpots(value);
      }
    } else {
      if (value >= 0 && value <= zone.totalSpots) {
        setAvailableSpots(value);
      }
    }
  };

  // Auto-save when values change
  useEffect(() => {
    // Calculate new occupied spots based on current input mode
    const newOccupiedSpots = inputMode === 'occupied' 
      ? occupiedSpots 
      : zone.totalSpots - availableSpots;

    // Only save if value has changed from original
    if (newOccupiedSpots === zone.occupiedSpots) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`[SpotCounter] Auto-updating zone ${zone.id} with ${newOccupiedSpots} occupied spots`);
        const response = await zonesApi.updateSpots(zone.id, newOccupiedSpots);
        console.log(`[SpotCounter] Auto-update response:`, response.data);
        
        if (response.data && response.data.occupiedSpots !== undefined) {
          onUpdate(response.data);
          // Sync local state after successful update
          setOccupiedSpots(response.data.occupiedSpots);
          setAvailableSpots(response.data.totalSpots - response.data.occupiedSpots);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err: any) {
        console.error('[SpotCounter] Auto-update error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to update spots';
        setError(errorMessage);
        // Reset to original values on error
        setOccupiedSpots(zone.occupiedSpots);
        setAvailableSpots(zone.totalSpots - zone.occupiedSpots);
      } finally {
        setLoading(false);
      }
    }, 800); // 800ms debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [occupiedSpots, availableSpots, inputMode, zone.id, zone.occupiedSpots, zone.totalSpots, onUpdate]);

  const handleModeToggle = () => {
    const newMode = inputMode === 'occupied' ? 'available' : 'occupied';
    setInputMode(newMode);
    
    // Sync values when switching modes
    if (newMode === 'available') {
      setAvailableSpots(zone.totalSpots - occupiedSpots);
    } else {
      setOccupiedSpots(zone.totalSpots - availableSpots);
    }
    setError(null);
  };

  // Calculate current values based on input mode
  const currentOccupiedSpots = inputMode === 'occupied' 
    ? occupiedSpots 
    : zone.totalSpots - availableSpots;
  const currentAvailableSpots = inputMode === 'available'
    ? availableSpots
    : zone.totalSpots - occupiedSpots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{zone.name}</h3>
        <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">Total: {zone.totalSpots}</span>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Mode Toggle - Segmented Control (iOS style) */}
        <div className="relative flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              if (inputMode !== 'occupied') {
                const newMode: InputMode = 'occupied';
                setInputMode(newMode);
                setOccupiedSpots(zone.totalSpots - availableSpots);
                setError(null);
              }
            }}
            disabled={loading}
            className={`flex-1 py-3 sm:py-2 min-h-[52px] sm:min-h-[44px] rounded-lg font-semibold text-base sm:text-sm transition-all duration-200 relative z-10 shadow-sm disabled:opacity-50 touch-manipulation ${
              inputMode === 'occupied' ? '' : 'hover:opacity-80'
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              ...(inputMode === 'occupied' 
                ? { backgroundColor: 'var(--white)', color: '#ef4444' }
                : { color: '#666666' })
            }}
          >
            Occupied
          </button>
          <button
            onClick={() => {
              if (inputMode !== 'available') {
                const newMode: InputMode = 'available';
                setInputMode(newMode);
                setAvailableSpots(zone.totalSpots - occupiedSpots);
                setError(null);
              }
            }}
            disabled={loading}
            className={`flex-1 py-3 sm:py-2 min-h-[52px] sm:min-h-[44px] rounded-lg font-semibold text-base sm:text-sm transition-all duration-200 relative z-10 shadow-sm disabled:opacity-50 touch-manipulation ${
              inputMode === 'available' ? '' : 'hover:opacity-80'
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              ...(inputMode === 'available' 
                ? { backgroundColor: 'var(--white)', color: 'var(--primary-blue)' }
                : { color: '#666666' })
            }}
          >
            Available
          </button>
        </div>

        {/* Input Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={
              (inputMode === 'occupied' ? occupiedSpots === 0 : availableSpots === 0) || loading
            }
            className="min-w-[56px] min-h-[56px] sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              backgroundColor: inputMode === 'occupied' ? '#ef4444' : 'var(--primary-blue)',
              color: 'var(--white)'
            }}
          >
            <Minus className="w-6 h-6 sm:w-5 sm:h-5" />
          </motion.button>

          <div className="flex-1 text-center space-y-2">
            <input
              type="number"
              min="0"
              max={zone.totalSpots}
              value={inputMode === 'occupied' ? occupiedSpots : availableSpots}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full max-w-[120px] sm:w-24 px-4 py-3 sm:py-2 text-3xl sm:text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none touch-manipulation"
              style={{ caretColor: '#111827', WebkitTapHighlightColor: 'transparent' }}
            />
            <div             className="text-xs sm:text-sm font-medium"
            style={{ color: inputMode === 'occupied' ? '#ef4444' : 'var(--primary-blue)' }}
          >
              {inputMode === 'occupied' ? 'occupied' : 'available'}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={
              (inputMode === 'occupied' 
                ? occupiedSpots >= zone.totalSpots 
                : availableSpots >= zone.totalSpots) || loading
            }
            className="min-w-[56px] min-h-[56px] sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              backgroundColor: inputMode === 'occupied' ? '#ef4444' : 'var(--primary-blue)',
              color: 'var(--white)'
            }}
          >
            <Plus className="w-6 h-6 sm:w-5 sm:h-5" />
          </motion.button>
        </div>

        {/* Display Other Value */}
        <div className="text-center p-4 rounded-xl border-2" style={{ 
          backgroundColor: 'var(--white)',
          borderColor: inputMode === 'occupied' ? 'var(--primary-blue)' : '#ef4444'
        }}>
          <div className="text-sm font-semibold mb-1" style={{ 
            color: inputMode === 'occupied' ? 'var(--primary-blue)' : '#ef4444'
          }}>
            {inputMode === 'occupied' ? 'Available Spots' : 'Occupied Spots'}
          </div>
          <div className="text-3xl font-bold" style={{ 
            color: inputMode === 'occupied' ? 'var(--primary-blue)' : '#ef4444'
          }}>
            {inputMode === 'occupied' ? currentAvailableSpots : currentOccupiedSpots}
          </div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

