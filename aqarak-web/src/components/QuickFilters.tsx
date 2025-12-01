import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface QuickFilter {
  label: string;
  value: string;
  icon?: LucideIcon;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  activeFilter?: string;
  onFilterClick: (value: string) => void;
}

export default function QuickFilters({ filters, activeFilter, onFilterClick }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {filters.map((filter, index) => {
        const isActive = activeFilter === filter.value;
        const Icon = filter.icon;
        return (
          <motion.button
            key={filter.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onFilterClick(filter.value)}
            className={`
              px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2
              ${isActive 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30' 
                : 'bg-white/80 backdrop-blur-sm text-[#0B1B34] hover:bg-white hover:shadow-md'
              }
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}
