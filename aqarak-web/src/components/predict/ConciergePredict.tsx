import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Home, ArrowRight, Check, Loader2 } from 'lucide-react';
import api from '../../lib/api';

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  
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

  const totalSteps = 4;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async () => {
    setLoading(true);
    setPrice(null);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const payload = { ...form };
      if (form.property_type !== 'Apartment') {
        delete (payload as any).floor;
      } else {
        delete (payload as any).total_floors;
      }

      const { data } = await api.post('/ml/price/predict', payload);
      setPrice(data.price_jod);
      nextStep();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="w-full min-h-[600px] bg-card rounded-3xl overflow-hidden border border-border shadow-2xl relative flex flex-col items-center justify-center p-8">
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <motion.div 
          className="h-full bg-secondary"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait" custom={step}>
          
          {step === 1 && (
            <motion.div
              key="step1"
              custom={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Where is the property located?</h2>
              
              <div className="relative max-w-md mx-auto">
                <select
                  value={form.neighborhood}
                  onChange={e => setForm({ ...form, neighborhood: e.target.value })}
                  className="w-full appearance-none bg-transparent border-b-2 border-border text-3xl text-center py-4 text-primary focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Neighborhood</option>
                  {AMMAN_NEIGHBORHOODS.map(n => (
                    <option key={n} value={n} className="text-lg">{n}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!form.neighborhood}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    {['Apartment', 'House', 'Townhouse', 'Villa', 'Farm'].map(t => (
                      <option key={t} value={t} className="bg-card">{t}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={prevStep} className="text-muted-foreground hover:text-primary transition-colors">Back</button>
                <button
                  onClick={nextStep}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Final Details</h2>
              
              <div className="flex justify-center gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Bedrooms</label>
                    <div className="flex items-center gap-3 bg-muted rounded-full p-2 border border-border">
                        <button onClick={() => setForm({...form, bedrooms: Math.max(0, form.bedrooms - 1)})} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">-</button>
                        <span className="w-4 text-center text-primary font-medium">{form.bedrooms}</span>
                        <button onClick={() => setForm({...form, bedrooms: form.bedrooms + 1})} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">+</button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Bathrooms</label>
                    <div className="flex items-center gap-3 bg-muted rounded-full p-2 border border-border">
                        <button onClick={() => setForm({...form, bathrooms: Math.max(0, form.bathrooms - 1)})} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">-</button>
                        <span className="w-4 text-center text-primary font-medium">{form.bathrooms}</span>
                        <button onClick={() => setForm({...form, bathrooms: form.bathrooms + 1})} className="w-8 h-8 rounded-full bg-card shadow-sm hover:bg-muted text-primary">+</button>
                    </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                 <label className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Furnished</label>
                 <div 
                    onClick={() => setForm({ ...form, furnished: !form.furnished })}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${form.furnished ? 'bg-secondary' : 'bg-muted'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${form.furnished ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button onClick={prevStep} className="text-muted-foreground hover:text-primary transition-colors">Back</button>
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-secondary/90 transition-colors flex items-center gap-2 shadow-lg shadow-secondary/25"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Reveal Valuation'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && price && (
            <motion.div
              key="step4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/20">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-lg mb-2">The estimated value is</p>
                <h1 className="text-6xl font-bold text-primary mb-2 tracking-tight">
                  {price.toLocaleString()} <span className="text-3xl text-secondary">JOD</span>
                </h1>
                <p className="text-sm text-muted-foreground">for a {form.bedrooms}bd {form.property_type} in {form.neighborhood}</p>
              </div>
              
              <button
                onClick={() => setStep(1)}
                className="mt-8 text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
              >
                Start New Estimate
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
