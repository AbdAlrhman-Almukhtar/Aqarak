import { Heart, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PropertyCardProps {
  id: number;
  title: string;
  description?: string;
  price?: number;
  rent_price?: number;
  city?: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  is_for_sale: boolean;
  is_for_rent: boolean;
  is_favorited?: boolean;
  coverImage?: string;
  onFavoriteToggle?: (id: number) => void;
  onClick?: (id: number) => void;
}

export default function PropertyCard({
  id,
  title,
  description,
  price,
  rent_price,
  city,
  neighborhood,
  bedrooms,
  bathrooms,
  area_sqm,
  is_for_sale,
  is_for_rent,
  is_favorited = false,
  coverImage,
  onFavoriteToggle,
  onClick,
}: PropertyCardProps) {
  const displayPrice = is_for_sale ? price : rent_price;
  const priceLabel = is_for_sale ? 'JOD' : 'JOD/mo';
  const location = [neighborhood, city].filter(Boolean).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl overflow-hidden border border-border shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      <div className="relative h-56 bg-muted overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage.startsWith('http') ? coverImage : `${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'}${coverImage}`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Maximize className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-all shadow-lg hover:scale-110 duration-300"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              is_favorited ? 'fill-secondary text-secondary' : 'text-primary'
            }`}
          />
        </button>
        <div className="absolute top-4 left-4 flex gap-2">
          {is_for_sale && (
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              For Sale
            </span>
          )}
          {is_for_rent && (
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              For Rent
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {displayPrice ? displayPrice.toLocaleString() : 'N/A'}{' '}
            <span className="text-base text-secondary font-semibold">{priceLabel}</span>
          </p>
        </div>
        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        {location && (
          <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="text-sm font-medium">{location}</span>
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{description}</p>
        )}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-primary/50" />
              <span className="text-sm font-semibold text-primary">{bedrooms}</span>
            </div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-primary/50" />
              <span className="text-sm font-semibold text-primary">{bathrooms}</span>
            </div>
          )}
          {area_sqm !== undefined && area_sqm !== null && (
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-primary/50" />
              <span className="text-sm font-semibold text-primary">{area_sqm} sqm</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
