import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import type { Zone } from '../../services/api';

interface ZoneCardProps {
  zone: Zone;
  index: number;
}

export default function ZoneCard({ zone, index }: ZoneCardProps) {
  const availableSpots = zone.totalSpots - zone.occupiedSpots;
  const percentage = zone.totalSpots > 0 ? (availableSpots / zone.totalSpots) * 100 : 0;

  const getStatusColors = () => {
    if (percentage >= 70) {
      return {
        borderColor: 'var(--primary-blue)',
        bgColor: 'var(--white)',
        iconBg: 'var(--primary-blue)',
        iconColor: 'var(--white)',
        textColor: '#1f2937',
        numberColor: 'var(--primary-blue)',
        badgeBg: 'var(--primary-blue)',
        badgeColor: 'var(--white)'
      };
    }
    if (percentage >= 30) {
      return {
        borderColor: '#f59e0b',
        bgColor: 'var(--white)',
        iconBg: '#f59e0b',
        iconColor: 'var(--white)',
        textColor: '#1f2937',
        numberColor: '#f59e0b',
        badgeBg: '#f59e0b',
        badgeColor: 'var(--white)'
      };
    }
    return {
      borderColor: '#ef4444',
      bgColor: 'var(--white)',
      iconBg: '#ef4444',
      iconColor: 'var(--white)',
      textColor: '#1f2937',
      numberColor: '#ef4444',
      badgeBg: '#ef4444',
      badgeColor: 'var(--white)'
    };
  };

  const colors = getStatusColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 shadow-apple hover:shadow-apple-lg transition-all duration-300"
      style={{ backgroundColor: colors.bgColor, borderColor: colors.borderColor }}
    >
      <div className="flex items-center justify-center mb-4 sm:mb-5 relative px-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center px-2">{zone.name}</h3>
        <div className="absolute right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.iconBg }}>
          <Car className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.iconColor }} />
        </div>
      </div>

      {zone.description && (
        <div className="mb-5 sm:mb-6 text-sm text-gray-700 italic px-3 py-2 bg-white/60 rounded-lg mx-1">
          {zone.description}
        </div>
      )}

      <div className="space-y-4 px-2">
        <div className="flex items-baseline justify-center gap-2 py-2">
          <span className="text-4xl sm:text-5xl font-bold px-1" style={{ color: colors.numberColor }}>{availableSpots}</span>
          <span className="text-gray-600 text-sm font-medium px-1">/ {zone.totalSpots} spots</span>
        </div>

        <div className="flex items-center justify-between px-1 py-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.badgeBg, color: colors.badgeColor }}>
            {percentage >= 70 ? '✓ Good Availability' : percentage >= 30 ? '⚠ Limited' : '✗ Almost Full'}
          </span>
          <span className="text-sm font-medium text-gray-600 px-2">{zone.occupiedSpots} occupied</span>
        </div>
      </div>
    </motion.div>
  );
}

