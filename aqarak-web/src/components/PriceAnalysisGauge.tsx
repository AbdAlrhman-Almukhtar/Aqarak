import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, AlertCircle, Sparkles } from 'lucide-react';
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
  
  let status: 'underpriced' | 'fair' | 'overpriced';
  let statusColor: string;
  let statusBg: string;
  let statusIcon: any;
  let statusText: string;
  
  if (difference < -10) {
    status = 'underpriced';
    statusColor = 'text-emerald-600';
    statusBg = 'bg-emerald-50 border border-emerald-200';
    statusIcon = TrendingDown;
    statusText = 'Great Deal';
  } else if (difference > 10) {
    status = 'overpriced';
    statusColor = 'text-orange-600';
    statusBg = 'bg-orange-50 border border-orange-200';
    statusIcon = TrendingUp;
    statusText = 'Above Market';
  } else {
    status = 'fair';
    statusColor = 'text-secondary';
    statusBg = 'bg-secondary/10 border border-secondary/20';
    statusIcon = Minus;
    statusText = 'Fair Price';
  }

  const StatusIcon = statusIcon;
  const barPosition = Math.min(100, Math.max(0, ((difference + 30) / 60) * 100));

  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
      <h3 className="text-2xl font-bold text-primary mb-6">AI Price Analysis</h3>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${statusBg} rounded-2xl p-6 mb-6`}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${statusColor}`}>
            <StatusIcon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className={`font-bold text-2xl ${statusColor}`}>
              {statusText}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on AI market analysis
            </p>
          </div>
        </div>
      </motion.div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-background rounded-2xl">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Listed Price</p>
            <p className="text-2xl font-bold text-primary">
              {actualPrice.toLocaleString()} JOD
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border border-secondary/20">
          <div>
            <p className="text-sm text-muted-foreground mb-1">AI Market Estimate</p>
            <p className="text-2xl font-bold text-secondary">
              {Math.round(predictedPrice).toLocaleString()} JOD
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Value Rating</span>
          <span className={`text-lg font-bold ${statusColor}`}>
            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-3 bg-gradient-to-r from-emerald-100 via-secondary/30 to-orange-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${barPosition}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-6 bg-primary rounded-full shadow-lg"
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Great Deal</span>
          <span className="font-medium">Fair</span>
          <span className="font-medium">High</span>
        </div>
      </div>
      <div className="bg-background rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground mb-2">Price Difference</p>
        <div className="flex items-center justify-center gap-2">
          <p className={`text-4xl font-bold ${statusColor}`}>
            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {difference < 0 ? 'Below' : difference > 0 ? 'Above' : 'At'} market estimate
        </p>
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>Powered by AI price prediction model</span>
        </div>
      </div>
    </div>
  );
}
