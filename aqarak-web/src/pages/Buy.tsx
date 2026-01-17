import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Building2, Warehouse, Banknote, LayoutGrid } from 'lucide-react';
import PropertyListings from '../components/PropertyListings';
import PropertyStats from '../components/PropertyStats';
import SearchBar from '../components/SearchBar';
import QuickFilters from '../components/QuickFilters';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar, { type FilterState } from '../components/FilterSidebar';
import { GridPattern } from '../components/ui/grid-pattern';
import api from '../lib/api';

interface Stats {
  total: number;
  sale: {
    count: number;
    avg_price: number;
  };
  rent: {
    count: number;
    avg_price: number;
  };
  neighborhoods: number;
}

export default function Buy() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState('-id');
  const [stats, setStats] = useState<Stats>({
    total: 156,
    sale: { count: 156, avg_price: 125000 },
    rent: { count: 89, avg_price: 450 },
    neighborhoods: 12
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<Stats>('/properties/statistics');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };
    fetchStats();
  }, []);


  const combinedFilters = useMemo(() => ({ ...filters, q: searchQuery }), [filters, searchQuery]);

  const quickFilters = [
    { label: 'All Properties', value: 'all', icon: LayoutGrid },
    { label: 'Apartments', value: 'apartment', icon: Building2 },
    { label: 'Villas', value: 'villa', icon: Warehouse },
    { label: 'Under 100K', value: 'under100k', icon: Banknote },
  ];

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleQuickFilterClick = (value: string) => {
    setActiveQuickFilter(value);

    let newFilters: FilterState = {};

    switch (value) {
      case 'all':
        newFilters = {};
        break;
      case 'apartment':
        newFilters = { property_type: 'Apartment' };
        break;
      case 'villa':
        newFilters = { property_type: 'Villa' };
        break;
      case 'house':
        newFilters = { property_type: 'House' };
        break;
      case 'under100k':
        newFilters = { max_price: 100000 };
        break;
    }

    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/10" gap={64} lineWidth={1} color="currentColor" opacity={1} />
      </div>
      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        mode="sale"
      />
      <div className="relative z-10 container mx-auto px-4 pt-52 pb-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 mb-8"
          >
            <div className="p-4 bg-secondary/10 rounded-3xl border border-secondary/20">
              <Building2 className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
              Properties for <span className="text-secondary">Sale</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover your dream property in Jordan's finest locations
          </motion.p>
          <PropertyStats
            total={stats.sale.count}
            avgPrice={stats.sale.avg_price}
            neighborhoods={stats.neighborhoods}
            priceLabel="JOD"
          />
          <SearchBar onSearch={setSearchQuery} placeholder="Search by location, property type..." />
          <QuickFilters
            filters={quickFilters}
            activeFilter={activeQuickFilter}
            onFilterClick={handleQuickFilterClick}
          />
        </div>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setFilterSidebarOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-card/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all border border-border hover:border-secondary/30"
          >
            <SlidersHorizontal className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-primary">Filters</span>
          </button>

          <div className="flex items-center gap-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-5 py-3 bg-card/80 backdrop-blur-sm rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-border appearance-none cursor-pointer font-medium text-primary"
            >
              <option value="-id">Sort: Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>
        <PropertyListings
          filterType="sale"
          onPropertyClick={(id) => navigate(`/property/${id}`)}
          filters={combinedFilters}
          sort={sort}
          view={view}
        />
      </div>
    </div>
  );
}
