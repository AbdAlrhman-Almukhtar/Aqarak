import { motion } from "framer-motion";
import { Check, Crown, Shield, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GridPattern } from "./ui/grid-pattern";

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full py-20 bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/5" gap={64} lineWidth={1} color="currentColor" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold tracking-wide uppercase">Unlock Premium Features</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight"
          >
            Choose Your Plan
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            Start free, upgrade when you need advanced tools
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Standard</h3>
                <p className="text-xs text-gray-500">Free forever</p>
              </div>
            </div>
            
            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Basic Property Search</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Standard Listings</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Limited AI Features</span>
              </li>
            </ul>
          </motion.div>

          {/* Plus Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Aqarak Plus</h3>
                    <p className="text-xs text-white/70">For professionals</p>
                  </div>
                </div>
                <span className="bg-secondary text-primary text-[9px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
                  Popular
                </span>
              </div>

              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">6.99</span>
                <span className="text-sm text-white/80">JOD/mo</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-white/95">Verified Gold Badge</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-white/95">Monthly Listing Boosts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-white/95">Unlimited AI Predictions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-white/95">Unlimited Chatbot</span>
                </li>
              </ul>

              <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-3 rounded-lg bg-secondary text-primary font-bold hover:bg-secondary/90 transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
