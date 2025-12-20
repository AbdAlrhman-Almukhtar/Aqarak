import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Loader2 } from 'lucide-react';
import PillNav from '../components/PillNav';
import logo from '../assets/logo.svg';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface PropertyImage {
  id: number;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export default function EditProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data } = await api.get(`/properties/${id}`);
      if (user && data.owner_id !== user.id) {
        console.warn('Ownership mismatch:', { owner: data.owner_id, user: user.id });
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        is_for_sale: data.is_for_sale,
        is_for_rent: data.is_for_rent,
        price: data.price?.toString() || '',
        rent_price: data.rent_price?.toString() || '',
        city: data.city || '',
        neighborhood: data.neighborhood || '',
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        area_sqm: data.area_sqm?.toString() || '',
        property_type: data.property_type || 'Apartment',
        furnished: data.furnished || false,
        floor: data.floor?.toString() || '',
        building_age: data.building_age?.toString() || '',
      });
      const { data: images } = await api.get(`/properties/${id}/images`);
      setExistingImages(images);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

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
    if (files.length + existingImages.length + newImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setNewImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imgId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await api.delete(`/properties/${id}/images/${imgId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imgId));
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError('Failed to delete image');
    }
  };

  const setCoverImage = async (imgId: number) => {
    try {
      await api.patch(`/properties/${id}/images/${imgId}`, { is_cover: true });
      const { data: images } = await api.get(`/properties/${id}/images`);
      setExistingImages(images);
    } catch (err) {
      console.error('Failed to set cover image:', err);
      setError('Failed to set cover image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!formData.is_for_sale && !formData.is_for_rent) {
        throw new Error('Property must be for sale or rent');
      }
      if (formData.is_for_sale && !formData.price) {
        throw new Error('Price is required for sale listings');
      }
      if (formData.is_for_rent && !formData.rent_price) {
        throw new Error('Rent price is required for rental listings');
      }
      const propertyPayload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        rent_price: formData.rent_price ? parseFloat(formData.rent_price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        building_age: formData.building_age ? parseInt(formData.building_age) : null,
      };

      await api.patch(`/properties/${id}`, propertyPayload);
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const formData = new FormData();
          formData.append('file', newImages[i]);
          
          await api.post(`/properties/${id}/images`, formData, {
            params: {
              sort_order: existingImages.length + i,
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);

    } catch (err: any) {
      console.error('Error updating property:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F4F1E8]">
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

      <div className="container mx-auto px-4 pt-52 pb-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0B1B34]">
              Edit <span className="text-secondary">Property</span>
            </h1>
            <p className="text-xl text-[#0B1B34]/70">
              Update your property details and images
            </p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center"
            >
              <h3 className="text-lg font-bold text-green-900 mb-2">Property Updated Successfully!</h3>
              <p className="text-green-800">Redirecting to your listings...</p>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Basic Information</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0B1B34] mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0B1B34] mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Listing Type</h2>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_for_sale"
                    checked={formData.is_for_sale}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-[#0B1B34] font-medium">For Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_for_rent"
                    checked={formData.is_for_rent}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-[#0B1B34] font-medium">For Rent</span>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Pricing</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.is_for_sale && (
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1B34] mb-2">
                      Sale Price (JOD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required={formData.is_for_sale}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                )}
                {formData.is_for_rent && (
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1B34] mb-2">
                      Monthly Rent (JOD) *
                    </label>
                    <input
                      type="number"
                      name="rent_price"
                      value={formData.rent_price}
                      onChange={handleInputChange}
                      required={formData.is_for_rent}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Neighborhood</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Property Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
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
                    <span className="text-[#0B1B34] font-medium">Furnished</span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Area (sqm)</label>
                  <input
                    type="number"
                    name="area_sqm"
                    value={formData.area_sqm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Floor Number</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1B34] mb-2">Building Age (Years)</label>
                  <input
                    type="number"
                    name="building_age"
                    value={formData.building_age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0B1B34] mb-4">Photos (Max 5)</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'}${img.url}`}
                      alt="Property"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        title="Delete Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {!img.is_cover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(img.id)}
                          className="bg-secondary text-white px-3 py-1 rounded-full text-xs hover:opacity-90"
                        >
                          Set Cover
                        </button>
                      )}
                    </div>
                    {img.is_cover && (
                      <span className="absolute bottom-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                
                {newPreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`New Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl border-2 border-secondary"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>

              {existingImages.length + newImages.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
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
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-[#0B1B34] font-semibold mb-2">
                      Click to upload images
                    </span>
                    <span className="text-sm text-gray-500">
                      PNG, JPG, WEBP up to 10MB each
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="flex-1 px-6 py-4 border-2 border-[#0B1B34] text-[#0B1B34] font-semibold rounded-xl hover:bg-[#0B1B34] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-secondary text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
