import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Key, Building2, Home, Warehouse, Banknote, LayoutGrid } from 'lucide-react';
import PillNav from '../components/PillNav';
import PropertyListings from '../components/PropertyListings';
import PropertyStats from '../components/PropertyStats';
import SearchBar from '../components/SearchBar';
import QuickFilters from '../components/QuickFilters';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar, { type FilterState } from '../components/FilterSidebar';
import { GridPattern } from '../components/ui/grid-pattern';
import logo from '../assets/logo.svg';

export default function Rent() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState('-id');
  
  const navItems = useMemo(
    () => [
      { label: 'Home', href: '/home', onClick: () => navigate('/home') },
      { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
      { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
      { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
    ],
    [navigate]
  );

  const quickFilters = [
    { label: 'All Properties', value: 'all', icon: LayoutGrid },
    { label: 'Apartments', value: 'apartment', icon: Building2 },
    { label: 'Villas', value: 'villa', icon: Warehouse },
    { label: 'Houses', value: 'house', icon: Home },
    { label: 'Under 500/mo', value: 'under500', icon: Banknote },
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
      case 'under500':
        newFilters = { max_rent: 500 };
        break;
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/10" gap={64} lineWidth={1} color="currentColor" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
      </div>
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/rent"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
            onProfileClick={() => navigate("/profile")}
          />
        </div>
      </header>
      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 mb-8"
          >
            <div className="p-4 bg-secondary/10 rounded-3xl border border-secondary/20">
              <Key className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
              Properties for <span className="text-secondary">Rent</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Find your perfect rental in Jordan's most desirable neighborhoods
          </motion.p>
          <PropertyStats total={89} avgPrice={450} priceLabel="JOD/mo" />
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
              <option value="rent_price">Price: Low to High</option>
              <option value="-rent_price">Price: High to Low</option>
            </select>

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>
        <PropertyListings 
          filterType="rent" 
          onPropertyClick={(id) => navigate(`/property/${id}`)}
          filters={{ ...filters, q: searchQuery }}
          sort={sort}
          view={view}
        />
      </div>
    </div>
  );
}
