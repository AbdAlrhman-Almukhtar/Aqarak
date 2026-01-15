import { motion } from 'framer-motion';
import { Home, TrendingUp, MapPin } from 'lucide-react';

interface PropertyStatsProps {
  total: number;
  avgPrice?: number;
  neighborhoods?: number;
  priceLabel?: string;
}

export default function PropertyStats({ total, avgPrice, neighborhoods = 12, priceLabel = 'JOD' }: PropertyStatsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm"
      >
        <div className="p-2 bg-secondary/10 rounded-full">
          <Home className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#0B1B34]">{total.toLocaleString()}</p>
          <p className="text-xs text-[#0B1B34]/60">Properties</p>
        </div>
      </motion.div>

      {avgPrice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm"
        >
          <div className="p-2 bg-accent/10 rounded-full">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0B1B34]">{avgPrice.toLocaleString()}</p>
            <p className="text-xs text-[#0B1B34]/60">Avg. {priceLabel}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm"
      >
        <div className="p-2 bg-primary/10 rounded-full">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#0B1B34]">{neighborhoods}+</p>
          <p className="text-xs text-[#0B1B34]/60">Neighborhoods</p>
        </div>
      </motion.div>
    </div>
  );
}
