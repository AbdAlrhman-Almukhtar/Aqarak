import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PropertyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  showRentFilters?: boolean;
}

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

export default function PropertyFilters({ onFilterChange, showRentFilters = false }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by location, neighborhood..."
          value={filters.q || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-[#0B1B34]/10 rounded-xl text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
        />
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[#0B1B34] text-white rounded-xl mb-4"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <X className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-45'}`} />
      </button>
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border border-[#0B1B34]/10 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0B1B34]">Filter Results</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-secondary hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">City</label>
              <input
                type="text"
                placeholder="e.g., Amman"
                value={filters.city || ''}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">
                {showRentFilters ? 'Monthly Rent (JOD)' : 'Price (JOD)'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters[showRentFilters ? 'min_rent' : 'min_price'] || ''}
                  onChange={(e) => updateFilter(showRentFilters ? 'min_rent' : 'min_price', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters[showRentFilters ? 'max_rent' : 'max_price'] || ''}
                  onChange={(e) => updateFilter(showRentFilters ? 'max_rent' : 'max_price', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 bg-[#F4F1E8] border border-[#0B1B34]/10 rounded-lg text-[#0B1B34] placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Bedrooms</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Type</label>
                <div className="relative">
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
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1B34]/50 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.furnished || false}
                    onChange={(e) => updateFilter('furnished', e.target.checked || undefined)}
                    className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-[#0B1B34] font-medium">Furnished Only</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Floor</label>
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
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Building Age (Years)</label>
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
              <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Area (sqm)</label>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
