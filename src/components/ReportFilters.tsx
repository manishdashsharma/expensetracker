'use client';

import { motion } from 'framer-motion';

interface ReportFiltersProps {
  filterDays: number;
  onFilterChange: (days: number) => void;
}

const filterOptions = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 365, label: '1 Year' },
];

export default function ReportFilters({ filterDays, onFilterChange }: ReportFiltersProps) {
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filterOptions.map(({ value, label }, index) => (
        <motion.button
          key={value}
          onClick={() => onFilterChange(value)}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            filterDays === value
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/30'
          }`}
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
}