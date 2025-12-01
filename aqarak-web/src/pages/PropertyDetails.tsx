import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Bed, Bath, Maximize, Check, ArrowLeft, Heart } from 'lucide-react';
import PillNav from '../components/PillNav';
import logo from '../assets/logo.svg';
import api from '../lib/api';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  rent_price: number;
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  is_for_sale: boolean;
  is_for_rent: boolean;
  property_type: string;
  furnished: boolean;
  floor: number;
  building_age: number;
  cover_image: string;
  images: string[];
  owner_id: number;
  is_favorited?: boolean;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openChat } = useChat();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!property) return;

    try {
      if (property.is_favorited) {
        await api.delete(`/favorites/${property.id}`);
        setProperty(prev => prev ? ({ ...prev, is_favorited: false }) : null);
      } else {
        await api.post(`/favorites/${property.id}`);
        setProperty(prev => prev ? ({ ...prev, is_favorited: true }) : null);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1B34]"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#F4F1E8] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-xl">{error || 'Property not found'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-[#0B1B34] underline hover:text-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const allImages = [property.cover_image, ...(property.images || [])].filter(Boolean);
  const displayPrice = property.is_for_sale ? property.price : property.rent_price;
  const priceLabel = property.is_for_sale ? 'JOD' : 'JOD/mo';

  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'}${path}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F1E8]">
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref={property.is_for_sale ? '/buy' : '/rent'}
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#0B1B34]/60 hover:text-[#0B1B34] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to listings
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden relative group">
              {allImages.length > 0 ? (
                <img 
                  src={getImageUrl(allImages[activeImage])} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Maximize className="w-16 h-16" />
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-secondary' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#0B1B34] mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-[#0B1B34]/60">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span className="text-lg">{property.neighborhood}, {property.city}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full shadow-sm hover:shadow-md transition ${
                      property.is_favorited 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-white text-[#0B1B34] hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${property.is_favorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-secondary">
                  {displayPrice?.toLocaleString()}
                </span>
                <span className="text-xl text-[#0B1B34]/60 font-medium">
                  {priceLabel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#0B1B34]/10">
                <div className="flex flex-col items-center gap-1 text-center p-3 bg-white rounded-xl">
                  <Bed className="w-6 h-6 text-secondary mb-1" />
                  <span className="font-bold text-[#0B1B34]">{property.bedrooms}</span>
                  <span className="text-xs text-[#0B1B34]/60">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center p-3 bg-white rounded-xl">
                  <Bath className="w-6 h-6 text-secondary mb-1" />
                  <span className="font-bold text-[#0B1B34]">{property.bathrooms}</span>
                  <span className="text-xs text-[#0B1B34]/60">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center p-3 bg-white rounded-xl">
                  <Maximize className="w-6 h-6 text-secondary mb-1" />
                  <span className="font-bold text-[#0B1B34]">{property.area_sqm}</span>
                  <span className="text-xs text-[#0B1B34]/60">Sqm</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0B1B34] mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center justify-between border-b border-[#0B1B34]/5 pb-2">
                  <span className="text-[#0B1B34]/60">Type</span>
                  <span className="font-medium text-[#0B1B34]">{property.property_type || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#0B1B34]/5 pb-2">
                  <span className="text-[#0B1B34]/60">Status</span>
                  <span className="font-medium text-[#0B1B34]">
                    {property.is_for_sale ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#0B1B34]/5 pb-2">
                  <span className="text-[#0B1B34]/60">Furnished</span>
                  <div className="flex items-center gap-2 font-medium text-[#0B1B34]">
                    {property.furnished ? (
                      <><Check className="w-4 h-4 text-green-500" /> Yes</>
                    ) : (
                      'No'
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-[#0B1B34]/5 pb-2">
                  <span className="text-[#0B1B34]/60">Floor</span>
                  <span className="font-medium text-[#0B1B34]">
                    {property.floor !== null ? property.floor : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#0B1B34]/5 pb-2">
                  <span className="text-[#0B1B34]/60">Building Age</span>
                  <span className="font-medium text-[#0B1B34]">
                    {property.building_age ? `${property.building_age} Years` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0B1B34] mb-4">Description</h3>
              <p className="text-[#0B1B34]/70 leading-relaxed whitespace-pre-line">
                {property.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => openChat(`Hi, I'm interested in ${property.title} in ${property.neighborhood}. Is it still available?`)}
                className="w-full bg-[#0B1B34] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0B1B34]/90 transition shadow-lg shadow-[#0B1B34]/20"
              >
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
