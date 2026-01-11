import { useState, useEffect } from 'react';
import { MapPin, Home, Building2, Check, Loader2, Bed, Maximize2, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Stepper, { Step } from '../ui/Stepper';

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

export default function ConciergePredict() {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [stepperKey, setStepperKey] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 150,
    floor: 2,
    total_floors: 2,
    building_age: 5,
    city: 'Amman',
    neighborhood: '',
    property_type: 'Apartment',
    furnished: true,
  });
  useEffect(() => {
    if (currentStep === 3 && price === null && !loading) {
      const fetchPrice = async () => {
        setLoading(true);

        try {
          const payload = { ...form };
          if (form.property_type !== 'Apartment') {
            delete (payload as any).floor;
          } else {
            delete (payload as any).total_floors;
          }

          const { data } = await api.post('/ml/price/predict', payload);
          setPrice(data.price_jod);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      fetchPrice();
    }
  }, [currentStep, price, loading, form]);

  const handleReset = () => {
    setPrice(null);
    setLoading(false);
    setCurrentStep(1);
    setForm({
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 150,
      floor: 2,
      total_floors: 2,
      building_age: 5,
      city: 'Amman',
      neighborhood: '',
      property_type: 'Apartment',
      furnished: true,
    });
    setStepperKey(prev => prev + 1);
  };

  return (
    <Stepper
      key={stepperKey}
      initialStep={currentStep}
      onStepChange={(step) => setCurrentStep(step)}
      onFinalStepCompleted={handleReset}
      backButtonText="Back"
      nextButtonText={currentStep === 2 ? "Estimate" : "Next"}
      finalButtonText="New Estimate"
      stepCircleContainerClassName="bg-card/80 backdrop-blur-xl"
      disableStepIndicators={false}
    >
      <Step>
        <div className="text-center space-y-4 py-2">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold text-primary">Where is the property located?</h2>

          <div className="relative max-w-md mx-auto">
            <select
              value={form.neighborhood}
              onChange={e => setForm({ ...form, neighborhood: e.target.value })}
              className="w-full appearance-none bg-transparent border-b-2 border-border text-2xl text-center py-4 text-primary focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              <option value="" disabled>Select Neighborhood</option>
              {AMMAN_NEIGHBORHOODS.map(n => (
                <option key={n} value={n} className="text-lg">{n}</option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </Step>
      <Step>
        <div className="text-center space-y-4 py-2">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold text-primary">Tell us about the property</h2>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="relative col-span-2 md:col-span-1">
              <select
                value={form.property_type}
                onChange={e => setForm({ ...form, property_type: e.target.value })}
                className="w-full appearance-none bg-muted border border-border rounded-xl px-4 py-4 text-lg text-primary focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                {['Apartment', 'Villa'].map(t => (
                  <option key={t} value={t} className="bg-card">{t}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="relative col-span-2 md:col-span-1">
              <input
                type="number"
                value={form.area_sqm}
                onChange={e => setForm({ ...form, area_sqm: Number(e.target.value) })}
                className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-lg text-primary focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Area"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">sqm</span>
            </div>

            <div className="relative col-span-2 md:col-span-1">
              {form.property_type === 'Apartment' ? (
                <>
                  <input
                    type="number"
                    value={form.floor}
                    onChange={e => setForm({ ...form, floor: Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-lg text-primary focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Floor Number"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">Floor</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={form.total_floors}
                    onChange={e => setForm({ ...form, total_floors: Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-lg text-primary focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Total Floors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">Floors</span>
                </>
              )}
            </div>

            <div className="relative col-span-2 md:col-span-1">
              <input
                type="number"
                value={form.building_age}
                onChange={e => setForm({ ...form, building_age: Number(e.target.value) })}
                className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-lg text-primary focus:outline-none focus:border-secondary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Age"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">Years</span>
            </div>

            <div className="col-span-2 flex justify-center gap-6 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bedrooms</label>
                <div className="flex items-center gap-3 bg-muted rounded-full p-2 border border-border">
                  <button onClick={() => setForm({ ...form, bedrooms: Math.max(0, form.bedrooms - 1) })} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">-</button>
                  <span className="w-4 text-center text-primary font-medium">{form.bedrooms}</span>
                  <button onClick={() => setForm({ ...form, bedrooms: form.bedrooms + 1 })} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">+</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bathrooms</label>
                <div className="flex items-center gap-3 bg-muted rounded-full p-2 border border-border">
                  <button onClick={() => setForm({ ...form, bathrooms: Math.max(0, form.bathrooms - 1) })} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">-</button>
                  <span className="w-4 text-center text-primary font-medium">{form.bathrooms}</span>
                  <button onClick={() => setForm({ ...form, bathrooms: form.bathrooms + 1 })} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">+</button>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-center gap-3 pt-2">
              <label className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Furnished</label>
              <div
                onClick={() => setForm({ ...form, furnished: !form.furnished })}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${form.furnished ? 'bg-secondary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${form.furnished ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>
      </Step>
      <Step>
        {price ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20">
              <Check className="w-12 h-12 text-green-500" />
            </div>

            <p className="text-muted-foreground text-lg mb-2">The estimated value is</p>

            <div className="relative inline-block mb-2">
              <div className="absolute -inset-4 bg-secondary/20 blur-2xl rounded-full opacity-50 pulse" />
              <h1 className="relative text-6xl md:text-7xl font-bold text-primary tracking-tight">
                {Math.round(price).toLocaleString()} <span className="text-3xl text-secondary">JOD</span>
              </h1>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <div className="px-4 py-2 bg-muted rounded-2xl flex items-center gap-2 border border-border">
                <Bed className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-primary">{form.bedrooms} Beds</span>
              </div>
              <div className="px-4 py-2 bg-muted rounded-2xl flex items-center gap-2 border border-border">
                <Maximize2 className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-primary">{form.area_sqm} sqm</span>
              </div>
              <div className="px-4 py-2 bg-muted rounded-2xl flex items-center gap-2 border border-border">
                <Tag className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-primary">{Math.round(price / form.area_sqm)} JOD/m²</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              for a {form.bedrooms}bd {form.property_type} in {form.neighborhood}
            </p>

            <div className="pt-4 flex flex-col items-center gap-2">
              <button
                onClick={() => navigate('/list-property')}
                className="text-primary font-bold hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                Want to sell? List this property
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <ArrowRight className="w-3 h-3 text-secondary" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-secondary" />
            </div>
            <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Calculating your property valuation...</p>
            <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
          </div>
        )}
      </Step>
    </Stepper>
  );
}
