import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Check } from 'lucide-react';
import PillNav from '../components/PillNav';
import logo from '../assets/logo.svg';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const AMMAN_NEIGHBORHOODS = [
  "Abdoun", "Dabouq", "Khalda", "Sweifieh", "Jubaiha", "Tla Ali", 
  "Mecca St", "Medina St", "Gardens", "Al Rabiah", "Um Uthaiena", 
  "Deir Ghbar", "Sweileh", "Abu Nseir", "Shafa Badran", "Marj El Hamam",
  "Shmaisani", "Jabal Amman", "Jabal Al Hussain", "Jabal Al-Lweibdeh",
  "Jabal Al-Taj", "Jabal Al Nuzha", "Jabal Al Zohor", "Al Bayader",
  "Al Bnayyat", "Al Jandaweel", "Al Kursi", "Al Rawnaq", "Al Ridwan",
  "Al Urdon Street", "Al Yadudah", "Al Ashrafyeh", "Al Muqabalain",
  "Al Qwaismeh", "Dahiet Al-Nakheel", "Dahiet Al-Rawda", "Daheit Al Yasmeen",
  "Daheit Al Rasheed", "Hai Nazzal", "Tabarboor", "Al Kamaliya",
  "University District", "7th Circle"
].sort();

export default function ListProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_for_sale: true,
    is_for_rent: false,
    price: '',
    rent_price: '',
    city: '',
    neighborhood: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    property_type: 'Apartment',
    furnished: false,
    floor: '',
    building_age: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // If we removed the cover, reset cover to 0/adjust
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.is_for_sale && !formData.is_for_rent) {
        throw new Error('Property must be for sale or rent');
      }
      if (formData.is_for_sale && !formData.price) {
        throw new Error('Price is required for sale listings');
      }
      if (formData.is_for_rent && !formData.rent_price) {
        throw new Error('Rent price is required for rental listings');
      }

      // Create property
      const propertyPayload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        rent_price: formData.rent_price ? parseFloat(formData.rent_price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        property_type: formData.property_type,
        furnished: formData.furnished,
        floor: formData.floor ? parseInt(formData.floor) : null,
        building_age: formData.building_age ? parseInt(formData.building_age) : null,
        owner_id: user?.id,
      };

      const { data: property } = await api.post('/properties', propertyPayload);
      console.log('Property created:', property);

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const formData = new FormData();
          formData.append('file', images[i]);
          
          await api.post(`/properties/${property.id}/images`, formData, {
            params: {
              is_cover: i === coverIndex,
              sort_order: i,
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/buy');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
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
            activeHref="/list-property"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
            onProfileClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-52 pb-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              List Your <span className="text-secondary">Property</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Reach thousands of potential buyers and tenants by listing your property details and high-quality photos.
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center"
            >
              <h3 className="text-lg font-bold text-green-900 mb-2">Property Listed Successfully!</h3>
              <p className="text-green-800">Redirecting to listings...</p>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Basic Information</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                  placeholder="e.g., Modern Apartment in Abdoun"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                  placeholder="Describe your property..."
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Listing Type</h2>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_for_sale"
                    checked={formData.is_for_sale}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-primary font-medium">For Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_for_rent"
                    checked={formData.is_for_rent}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-primary font-medium">For Rent</span>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Pricing</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.is_for_sale && (
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Sale Price (JOD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required={formData.is_for_sale}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                      placeholder="150000"
                    />
                  </div>
                )}
                {formData.is_for_rent && (
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Monthly Rent (JOD) *
                    </label>
                    <input
                      type="number"
                      name="rent_price"
                      value={formData.rent_price}
                      onChange={handleInputChange}
                      required={formData.is_for_rent}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                      placeholder="500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="Amman"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Neighborhood</label>
                  <select
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    required
                  >
                    <option value="" disabled>Select Neighborhood</option>
                    {AMMAN_NEIGHBORHOODS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Property Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary"
                  >
                    {['Apartment', 'House', 'Townhouse', 'Villa', 'Farm'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="furnished"
                      checked={formData.furnished}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                    />
                    <span className="text-primary font-medium">Furnished</span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="3"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="2"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Area (sqm)</label>
                  <input
                    type="number"
                    name="area_sqm"
                    value={formData.area_sqm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="150"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Floor Number</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="e.g. 2 (0 for Ground)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Building Age (Years)</label>
                  <input
                    type="number"
                    name="building_age"
                    value={formData.building_age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary placeholder:text-muted-foreground"
                    placeholder="e.g. 5"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Photos (Max 10)</h2>
              
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background/50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <span className="text-primary font-semibold mb-2">
                    Click to upload images
                  </span>
                  <span className="text-sm text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB each
                  </span>
                </label>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-40 object-cover rounded-xl border-2 ${index === coverIndex ? 'border-secondary' : 'border-transparent'}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                          title="Remove Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index !== coverIndex && (
                          <button
                            type="button"
                            onClick={() => setCoverIndex(index)}
                            className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90"
                          >
                            Set Cover
                          </button>
                        )}
                      </div>
                      
                      {index === coverIndex && (
                        <div className="absolute bottom-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                          <Check className="w-3 h-3" /> Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/buy')}
                className="flex-1 px-6 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
