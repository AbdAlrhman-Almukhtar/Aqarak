import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Heart, Home, Share2, Bot } from 'lucide-react';
import PillNav from '../components/PillNav';
import PriceAnalysisGauge from '../components/PriceAnalysisGauge';
import { GridPattern } from '../components/ui/grid-pattern';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-xl">{error || 'Property not found'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-primary underline hover:text-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const allImages = Array.from(new Set([property.cover_image, ...(property.images || [])])).filter(Boolean);
  const displayPrice = property.is_for_sale ? property.price : property.rent_price;
  const priceLabel = property.is_for_sale ? 'JOD' : 'JOD/mo';

  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'}${path}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-50 text-primary/5" gap={64} lineWidth={1} color="currentColor" opacity={0.5} />
      </div>

      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref={property.is_for_sale ? '/buy' : '/rent'}
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to listings
        </button>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="aspect-[16/10] bg-muted rounded-3xl overflow-hidden relative group shadow-xl">
                  {allImages.length > 0 ? (
                    <img 
                      src={getImageUrl(allImages[activeImage])} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-24 h-24 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  {allImages.length > 0 && (
                    <>
                      <div className="absolute top-6 right-6 flex gap-3 z-20">
                        <button 
                          onClick={toggleFavorite}
                          className={`p-4 rounded-full shadow-2xl backdrop-blur-xl transition-all hover:scale-110 active:scale-95 ${
                            property.is_favorited 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/95 text-[#0B1B34] hover:text-red-500 border border-[#0B1B34]/10'
                          }`}
                        >
                          <Heart className={`w-6 h-6 ${property.is_favorited ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-4 rounded-full bg-white/95 text-[#0B1B34] hover:bg-white shadow-2xl backdrop-blur-xl transition-all hover:scale-110 active:scale-95 border border-[#0B1B34]/10">
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="absolute bottom-6 right-6 bg-[#0B1B34]/80 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] z-20 border border-white/10 shadow-2xl">
                        {activeImage + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="grid grid-cols-6 gap-3">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === idx 
                            ? 'border-secondary ring-2 ring-secondary/20 scale-105' 
                            : 'border-border opacity-60 hover:opacity-100 hover:border-secondary/50'
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
              <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-border/50 relative overflow-hidden">
                <div className="relative z-10 space-y-12">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${
                        property.is_for_sale 
                          ? 'bg-[#FFA04F] text-[#0B1B34]' 
                          : 'bg-[#0B1B34] text-white'
                      }`}>
                        {property.is_for_sale ? 'For Sale' : 'For Rent'}
                      </span>
                      {property.furnished && (
                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-[#0B1B34]/5 text-[#0B1B34] border border-[#0B1B34]/10">
                          Furnished
                        </span>
                      )}
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-[#0B1B34]/5 text-[#0B1B34]/40 border border-[#0B1B34]/10">
                        Verified Listing
                      </span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                      <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B1B34] tracking-tight leading-[1.1]">
                          {property.title}
                        </h1>
                        <div className="flex items-center gap-2 text-[#0B1B34]/40">
                          <MapPin className="w-5 h-5 text-[#FFA04F]" />
                          <span className="text-xl font-medium tracking-tight">
                            {property.neighborhood}, {property.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start lg:items-end flex-shrink-0 bg-[#0B1B34]/5 p-6 rounded-3xl border border-[#0B1B34]/5">
                        <span className="text-[10px] font-black text-[#0B1B34]/30 uppercase tracking-[0.2em] mb-1">Market Listing</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-5xl lg:text-6xl font-bold text-[#FFA04F] tracking-tighter">
                            {displayPrice?.toLocaleString()}
                          </span>
                          <span className="text-xl text-[#0B1B34] font-bold">
                            {priceLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-border/50">
                    {[
                      { icon: <Bed className="w-6 h-6" />, value: property.bedrooms, label: "Bedrooms" },
                      { icon: <Bath className="w-6 h-6" />, label: "Bathrooms", value: property.bathrooms },
                      { icon: <Maximize className="w-6 h-6" />, value: property.area_sqm, label: "Area", unit: "m²" },
                      { icon: <Home className="w-6 h-6" />, value: property.property_type, label: "Property Type" }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFA04F]/10 flex items-center justify-center text-[#FFA04F] border border-[#FFA04F]/10">
                          {stat.icon}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-2xl font-bold text-[#0B1B34]">{stat.value}</span>
                            {stat.unit && <span className="text-xs font-bold text-[#0B1B34]/30 uppercase ml-0.5">{stat.unit}</span>}
                          </div>
                          <div className="text-[10px] font-black text-[#0B1B34]/30 uppercase tracking-[0.1em]">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-12">
                    {[
                      { label: "FLOOR LEVEL", value: property.floor !== null ? `${property.floor}` : 'Ground' },
                      { label: "PROPERTY AGE", value: property.building_age ? `${property.building_age} Years` : 'Brand New' },
                      { label: "FURNISHING STATUS", value: property.furnished ? 'Fully Furnished' : 'Unfurnished' }
                    ].map((feature, i) => (
                      <div key={i} className="space-y-3">
                        <span className="text-[11px] font-black text-[#0B1B34]/20 uppercase tracking-[0.1em]">{feature.label}</span>
                        <p className="text-2xl font-bold text-[#0B1B34]">{feature.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-[2.5rem] p-10 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-[#FFA04F] rounded-full"></div>
                    <h2 className="text-3xl font-bold text-[#0B1B34] tracking-tight">Property Description</h2>
                  </div>
                  <div className="prose prose-xl max-w-none text-[#0B1B34]/70 leading-relaxed font-normal whitespace-pre-line">
                    {property.description || 'No detailed description provided for this premium listing.'}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-[#0B1B34] rounded-[2rem] p-10 shadow-2xl text-white relative overflow-hidden group border border-[#FFA04F]/20">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFA04F] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#FFA04F] rounded-2xl flex items-center justify-center text-[#0B1B34] mb-6 shadow-lg shadow-[#FFA04F]/20">
                      <Bot className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">AI Concierge</h3>
                    <p className="text-white/60 mb-10 text-base leading-relaxed">
                      Instant answers about legal structure, neighborhood data, and property history.
                    </p>
                    <button 
                      onClick={() => openChat(`I'm interested in viewing "${property.title}" in ${property.neighborhood}. Can you tell me more about its features?`)}
                      className="w-full bg-[#FFA04F] text-[#0B1B34] py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#FFA04F]/90 transition-all shadow-xl shadow-[#FFA04F]/20"
                    >
                      Start Consultation
                    </button>
                  </div>
                </div>
                <PriceAnalysisGauge property={property} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
