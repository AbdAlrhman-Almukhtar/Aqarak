export type PropertyOut = {
  id: number;
  title: string;
  description?: string | null;
  is_for_sale: boolean;
  price?: number | null;
  is_for_rent: boolean;
  rent_price?: number | null;
  city?: string | null;
  neighborhood?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  is_active: boolean;
  owner_id: number;
  is_favorited?: boolean | null;
  image_urls?: string[];
};