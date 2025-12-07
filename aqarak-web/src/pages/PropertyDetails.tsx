import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Bed, Bath, Maximize, Check, ArrowLeft, Heart, Home, Calendar, Layers, Share2 } from 'lucide-react';
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

  const allImages = [property.cover_image, ...(property.images || [])].filter(Boolean);
  const displayPrice = property.is_for_sale ? property.price : property.rent_price;
  const priceLabel = property.is_for_sale ? 'JOD' : 'JOD/mo';

  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'}${path}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
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
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to listings
        </button>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
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
                  
                  {/* Image Counter */}
                  {allImages.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                      {activeImage + 1} / {allImages.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
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

              {/* Property Header */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        property.is_for_sale 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {property.is_for_sale ? 'For Sale' : 'For Rent'}
                      </span>
                      {property.furnished && (
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
                          Furnished
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5 text-secondary" />
                      <span className="text-lg font-medium">{property.neighborhood}, {property.city}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-secondary">
                        {displayPrice?.toLocaleString()}
                      </span>
                      <span className="text-2xl text-muted-foreground font-medium">
                        {priceLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleFavorite}
                      className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all ${
                        property.is_favorited 
                          ? 'bg-red-500 text-white' 
                          : 'bg-card text-primary hover:bg-red-50 hover:text-red-500 border border-border'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${property.is_favorited ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 rounded-full bg-card text-primary hover:bg-muted border border-border shadow-lg hover:shadow-xl transition-all">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Bed className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{property.bedrooms}</div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Bath className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{property.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Maximize className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{property.area_sqm}</div>
                      <div className="text-sm text-muted-foreground">Sqm</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  Property Features
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Property Type</div>
                      <div className="font-semibold text-primary text-lg">{property.property_type || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Floor</div>
                      <div className="font-semibold text-primary text-lg">
                        {property.floor !== null ? `Floor ${property.floor}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Building Age</div>
                      <div className="font-semibold text-primary text-lg">
                        {property.building_age ? `${property.building_age} Years` : 'New'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Furnished</div>
                      <div className="font-semibold text-primary text-lg">
                        {property.furnished ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-secondary rounded-full"></div>
                  About this property
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                  {property.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Contact Card */}
                <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 shadow-2xl text-primary-foreground">
                  <h3 className="text-2xl font-bold mb-2">Interested?</h3>
                  <p className="text-primary-foreground/90 mb-6 text-sm">
                    Contact our agent to schedule a viewing or get more information about this property.
                  </p>
                  <button 
                    onClick={() => openChat(`Hi, I'm interested in ${property.title} in ${property.neighborhood}. Is it still available?`)}
                    className="w-full bg-white text-primary py-4 rounded-xl font-bold text-lg hover:bg-white/95 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Contact Agent
                  </button>
                </div>

                {/* Price Analysis */}
                <PriceAnalysisGauge property={property} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
