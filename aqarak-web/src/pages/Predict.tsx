import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import PillNav from '../components/PillNav';
import { GridPattern } from '../components/ui/grid-pattern';
import logo from '../assets/logo.svg';
import ConciergePredict from '../components/predict/ConciergePredict';

export default function Predict() {
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/home", onClick: () => navigate("/home") },
      { label: "Buy", href: "/buy", onClick: () => navigate("/buy") },
      { label: "Rent", href: "/rent", onClick: () => navigate("/rent") },
      { label: "Predict", href: "/predict", onClick: () => navigate("/predict") },
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/10" gap={64} lineWidth={1} color="currentColor" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
      </div>
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/predict"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
            onProfileClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 pt-52 pb-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 mb-8"
          >
            <div className="p-4 bg-secondary/10 rounded-3xl border border-secondary/20">
              <TrendingUp className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
              AI Price <span className="text-secondary">Estimator</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Get an instant, data-driven valuation for your property in Amman
          </motion.p>
        </div>
        
        <div className="w-full max-w-4xl mx-auto">
          <ConciergePredict />
        </div>
      </div>
    </div>
  );
}