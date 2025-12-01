import type { PropertyOut } from "../types/property";

const FALLBACKS = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1430285561322-7808604715df?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c52f?q=80&w=1600&auto=format&fit=crop",
];

export function toPlaceCard(p: PropertyOut) {
  const images =
    (p.image_urls && p.image_urls.length ? p.image_urls : [FALLBACKS[p.id % FALLBACKS.length]]) as string[];

  const tags = [
    p.is_for_sale ? "For sale" : null,
    p.is_for_rent ? "For rent" : null,
    p.city || null,
    p.neighborhood || null,
    p.bedrooms != null ? `${p.bedrooms} BR` : null,
    p.area_sqm != null ? `${p.area_sqm} m²` : null,
  ].filter(Boolean) as string[];

  const price = p.is_for_rent ? Number(p.rent_price ?? 0) : Number(p.price ?? 0);

  return {
    images,
    tags,
    rating: 4.8,
    title: p.title,
    dateRange: "",
    hostType: p.is_for_sale ? "For Sale • Owner" : p.is_for_rent ? "For Rent • Owner" : "Owner",
    isTopRated: !!p.is_favorited,
    description: p.description ?? "",
    pricePerNight: price,
  };
}