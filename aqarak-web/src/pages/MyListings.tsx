import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Trash2, Plus, Edit } from 'lucide-react';
import PillNav from '../components/PillNav';
import PropertyCard, { type PropertyCardProps } from '../components/PropertyCard';
import logo from '../assets/logo.svg';
import api from '../lib/api';

export default function MyListings() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const { data } = await api.get<PropertyCardProps[]>('/properties/me');
      const mappedProperties = data.map((prop: any) => ({
        ...prop,
        coverImage: prop.cover_image || prop.coverImage,
      }));

      setProperties(mappedProperties);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
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
            activeHref="/my-listings"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
            onProfileClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-48 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              My <span className="text-secondary">Listings</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage the properties you've listed for sale or rent
            </p>
          </div>
          <button
            onClick={() => navigate('/list-property')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </button>
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
              <Plus className="w-10 h-10 text-primary/20" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-8">
              You haven't listed any properties yet. Start selling or renting today!
            </p>
            <button
              onClick={() => navigate('/list-property')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition"
            >
              List a Property
            </button>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="relative group">
                <PropertyCard
                  {...property}
                  onClick={(id) => navigate(`/property/${id}`)}
                />
                <button
                  onClick={(e) => handleDelete(property.id, e)}
                  disabled={deletingId === property.id}
                  className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Listing"
                >
                  {deletingId === property.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-property/${property.id}`);
                  }}
                  className="absolute top-4 right-16 z-10 bg-card text-primary p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                  title="Edit Listing"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
