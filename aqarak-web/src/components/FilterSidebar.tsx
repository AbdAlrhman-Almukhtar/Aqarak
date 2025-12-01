import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, DollarSign, Bed, Maximize, MapPin, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  q?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_rent?: number;
  max_rent?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  area_min?: number;
  area_max?: number;
  property_type?: string;
  furnished?: boolean;
  floor_min?: number;
  floor_max?: number;
  age_min?: number;
  age_max?: number;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export default function FilterSidebar({ isOpen, onClose, onApplyFilters, initialFilters = {} }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-secondary" />
                  <h2 className="text-xl font-bold text-[#0B1B34]">Filter Results</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <MapPin className="w-4 h-4 text-secondary" />
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Amman"
                    value={filters.city || ''}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <DollarSign className="w-4 h-4 text-secondary" />
                    Price (JOD)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price || ''}
                      onChange={(e) => updateFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price || ''}
                      onChange={(e) => updateFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <Bed className="w-4 h-4 text-secondary" />
                    Bedrooms
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.bedrooms_min || ''}
                      onChange={(e) => updateFilter('bedrooms_min', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.bedrooms_max || ''}
                      onChange={(e) => updateFilter('bedrooms_max', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                {/* Type & Furnished */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Type</label>
                    <select
                      value={filters.property_type || ''}
                      onChange={(e) => updateFilter('property_type', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                    >
                      <option value="">Any</option>
                      {['Apartment', 'House', 'Townhouse', 'Villa', 'Farm'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.furnished || false}
                        onChange={(e) => updateFilter('furnished', e.target.checked || undefined)}
                        className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                      />
                      <span className="text-[#0B1B34] font-medium text-sm">Furnished Only</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <Layers className="w-4 h-4 text-secondary" />
                    Floor
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.floor_min || ''}
                      onChange={(e) => updateFilter('floor_min', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.floor_max || ''}
                      onChange={(e) => updateFilter('floor_max', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Building Age (Years)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.age_min || ''}
                      onChange={(e) => updateFilter('age_min', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.age_max || ''}
                      onChange={(e) => updateFilter('age_max', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0B1B34] mb-3">
                    <Maximize className="w-4 h-4 text-secondary" />
                    Area (sqm)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.area_min || ''}
                      onChange={(e) => updateFilter('area_min', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.area_max || ''}
                      onChange={(e) => updateFilter('area_max', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-200 text-[#0B1B34] font-medium hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-3 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/90 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}