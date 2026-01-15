import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import PropertyCard, { type PropertyCardProps } from './PropertyCard';
import { type FilterState } from './FilterSidebar';
import api from '../lib/api';

interface PropertyListingsProps {
  filterType: 'sale' | 'rent';
  onPropertyClick?: (id: number) => void;
  filters?: FilterState;
  sort?: string;
  view?: 'grid' | 'list';
}

interface SearchResponse {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  stats: {
    sale: { count: number; avg_price?: number; min_price?: number; max_price?: number };
    rent: { count: number; avg_rent?: number; min_rent?: number; max_rent?: number };
  };
  data: PropertyCardProps[];
}

export default function PropertyListings({
  filterType,
  onPropertyClick,
  filters: externalFilters = {},
  sort = '-id',
  view = 'grid'
}: PropertyListingsProps) {
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        page_size: 12,
        sort,
        ...(filterType === 'sale' ? { is_for_sale: true } : { is_for_rent: true }),
        ...externalFilters,
      };
      const { data } = await api.get<SearchResponse>('/properties/search', { params });
      const mappedProperties = data.data.map((prop: any) => ({
        ...prop,
        coverImage: prop.cover_image || prop.coverImage,
      }));

      setProperties(mappedProperties);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, externalFilters, filterType, sort]);

  const handleFavoriteToggle = async (id: number) => {
    try {
      const property = properties.find(p => p.id === id);
      if (!property) return;

      if (property.is_favorited) {
        await api.delete(`/favorites/${id}`);
      } else {
        await api.post(`/favorites/${id}`);
      }
      setProperties(prev =>
        prev.map(p => (p.id === id ? { ...p, is_favorited: !p.is_favorited } : p))
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <div className="w-full">
      <main className="flex-1">
        {loading && properties.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <p className="text-xl text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}

        {properties.length > 0 && (
          <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
            <div className={`grid gap-6 ${view === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              } mb-8`}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  onClick={() => onPropertyClick?.(property.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-card border border-border rounded-full font-semibold text-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Previous
                </button>

                <span className="px-6 py-3 text-primary font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-card border border-border rounded-full font-semibold text-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

