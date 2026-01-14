import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { openNavigation } from '../../services/navigation';

interface NavigationButtonProps {
  address: string;
  latitude?: number;
  longitude?: number;
}

export default function NavigationButton({ address, latitude, longitude }: NavigationButtonProps) {
  const handleNavigation = () => {
    if (address || (latitude && longitude)) {
      openNavigation(address || '', latitude, longitude);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleNavigation}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-apple hover:shadow-apple-lg hover:bg-gray-800 transition-all duration-200"
    >
      <MapPin className="w-4 h-4" />
      <span>Get Directions</span>
    </motion.button>
  );
}

