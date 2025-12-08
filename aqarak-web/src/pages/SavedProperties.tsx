import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import PillNav from '../components/PillNav';
import PropertyCard, { type PropertyCardProps } from '../components/PropertyCard';
import logo from '../assets/logo.svg';
import api from '../lib/api';

export default function SavedProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get<PropertyCardProps[]>('/favorites');
      const mappedProperties = data.map((prop: any) => ({
        ...prop,
        coverImage: prop.cover_image || prop.coverImage,
        is_favorited: true,
      }));

      setProperties(mappedProperties);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (id: number) => {
    try {
      await api.delete(`/favorites/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-secondary/20 opacity-20 blur-[100px]"></div>
      </div>

      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/saved"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-48 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Saved <span className="text-secondary">Properties</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal collection of dream homes
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary/20" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground mb-8">
              Start exploring and save your favorite properties to see them here.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition shadow-lg"
            >
              Explore Properties
            </button>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={(id) => navigate(`/property/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
