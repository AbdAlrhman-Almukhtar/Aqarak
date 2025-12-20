import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import api from '../lib/api';

interface PriceAnalysisProps {
  property: {
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    property_type: string;
    furnished: boolean;
    floor: number;
    building_age: number;
    city: string;
    neighborhood: string;
    price?: number;
    rent_price?: number;
    is_for_sale: boolean;
    is_for_rent: boolean;
  };
}

interface PredictionResponse {
  price_jod: number;
}

export default function PriceAnalysisGauge({ property }: PriceAnalysisProps) {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!property.neighborhood || property.neighborhood === '') {
          setError('Property neighborhood is required for price analysis');
          setLoading(false);
          return;
        }

        if (!property.area_sqm || property.area_sqm <= 0) {
          setError('Property area is required for price analysis');
          setLoading(false);
          return;
        }

        const payload = {
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area_sqm: property.area_sqm,
          property_type: property.property_type || 'Apartment',
          furnished: property.furnished || false,
          floor: property.floor || 0,
          building_age: property.building_age || 0,
          city: property.city || 'Amman',
          neighborhood: property.neighborhood,
        };

        console.log('Sending price prediction request with payload:', payload);
        const { data } = await api.post<PredictionResponse>('/ml/price/predict', payload);
        console.log('Received prediction response:', data);
        setPrediction(data);
      } catch (err: any) {
        console.error('Failed to get price prediction:', err);
        console.error('Error response:', err?.response?.data);
        console.error('Error status:', err?.response?.status);
        const errorMsg = err?.response?.data?.detail || 'Unable to analyze pricing';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [property]);

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error || 'Price analysis unavailable'}</p>
        </div>
      </div>
    );
  }

  const actualPrice = property.is_for_sale ? property.price : property.rent_price;
  if (!actualPrice) return null;

  const predictedPrice = prediction.price_jod;
  const difference = ((actualPrice - predictedPrice) / predictedPrice) * 100;
  
  let statusText: string;
  
  if (difference < -10) {
    statusText = 'Exceptional Deal';
  } else if (difference < -3) {
    statusText = 'Great Value';
  } else if (difference > 3) {
    statusText = 'Above Market Average';
  } else {
    statusText = 'Fair Market Price';
  }

  const barPosition = Math.min(100, Math.max(0, ((difference + 25) / 50) * 100)); // Normalized to -25% to +25% range

  return (
    <div className="bg-card rounded-[2rem] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#0B1B34] flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-[#0B1B34] uppercase tracking-widest">Market Valuation</h3>
        </div>

        <div className="bg-[#0B1B34]/5 rounded-2xl p-6 mb-8 border border-[#0B1B34]/5">
          <p className="text-[#0B1B34]/40 text-[10px] font-bold uppercase tracking-widest mb-1">Analysis Summary</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#0B1B34] tracking-tight">{statusText}</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#0B1B34]/10 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${Math.abs(difference) <= 10 ? 'bg-[#FFA04F]' : 'bg-[#0B1B34]'}`} />
                <span className="text-[10px] font-black text-[#0B1B34] uppercase">{difference.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-[#0B1B34]/60">
              The property is {Math.abs(difference).toFixed(1)}% {difference > 0 ? 'more expensive' : 'cheaper'} than our AI estimate.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-[#0B1B34]/40 uppercase tracking-widest mb-1">Listed Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#0B1B34]">{actualPrice.toLocaleString()}</span>
                <span className="text-xs font-bold text-[#0B1B34]/40">JOD</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#0B1B34]/40 uppercase tracking-widest mb-1">AI Estimate</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-[#FFA04F]">{Math.round(predictedPrice).toLocaleString()}</span>
                <span className="text-xs font-bold text-[#FFA04F]/40">JOD</span>
              </div>
            </div>
          </div>

          <div className="relative pt-4 pb-2">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] font-bold text-[#0B1B34]/30 uppercase tracking-widest">Low Value</span>
              <span className="text-[9px] font-bold text-[#0B1B34]/30 uppercase tracking-widest text-center">Market Average</span>
              <span className="text-[9px] font-bold text-[#0B1B34]/30 uppercase tracking-widest">High Value</span>
            </div>
            <div className="h-1.5 w-full bg-[#0B1B34]/5 rounded-full relative">
              {/* Reference Points */}
              <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#0B1B34]/10" />
              
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${barPosition}%` }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              >
                <div className="h-4 w-4 bg-white border-4 border-[#FFA04F] rounded-full shadow-lg" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#0B1B34]/5">
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-[#0B1B34] text-white shadow-xl shadow-[#0B1B34]/10">
            <div className="w-12 h-12 rounded-xl bg-[#FFA04F] flex items-center justify-center text-[#0B1B34] flex-shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
            <p className="text-sm leading-relaxed text-white/80 font-medium">
              This property is listed <span className="text-[#FFA04F] font-bold">{Math.abs(difference).toFixed(1)}% {difference > 0 ? 'higher' : 'lower'}</span> than the calculated neighborhood average.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
