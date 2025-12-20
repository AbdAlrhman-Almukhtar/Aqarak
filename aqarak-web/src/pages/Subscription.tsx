import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Check, Crown, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { GridPattern } from "../components/ui/grid-pattern";
import PillNav from "../components/PillNav";
import logo from "../assets/logo.svg";

export default function Subscription() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navItems = [
    { label: "Home", href: "/home", onClick: () => navigate("/home") },
    { label: "Buy", href: "/buy", onClick: () => navigate("/buy") },
    { label: "Rent", href: "/rent", onClick: () => navigate("/rent") },
    { label: "Predict", href: "/predict", onClick: () => navigate("/predict") },
  ];

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
            activeHref="/subscription"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
            onProfileClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block"
          >
             <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold tracking-wide uppercase mb-6 inline-block">
               Simple Pricing
             </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
          >
            Upgrade to <span className="text-primary">Professional</span> Real Estate Tools
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500"
          >
            Choose the package that fits your needs. 
            <br className="hidden md:block" />
            Zero hidden fees. Cancel anytime.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-white rounded-[2rem] p-8 border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="mb-8">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-gray-500 text-sm">Essential tools for browsing.</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900">Free</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-600 font-medium">Basic Property Search</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-600 font-medium">Standard Listing Visibility</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-600 font-medium">Limited Chatbot Assistance</span>
              </li>
            </ul>

            <button 
              className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-colors border border-gray-200"
              onClick={() => navigate('/home')}
            >
              Continue with Free
            </button>
          </motion.div>

          {/* Plus Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group bg-gray-900 text-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col"
          >
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 border border-gray-700">
                     <Crown className="w-6 h-6 text-secondary" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Aqarak Plus</h3>
                   <p className="text-gray-400 text-sm">For serious sellers & investors.</p>
                </div>
                <span className="bg-secondary text-primary text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wide">
                  Recommended
                </span>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">6.99</span>
                <span className="text-lg text-gray-400">JOD</span>
                <span className="text-sm text-gray-500 ml-2">/ month</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-gray-200 font-medium">Verified Gold Badge</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-gray-200 font-medium">Monthly Listing Boosts</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-gray-200 font-medium">Unlimited AI Predictions</span>
                </li>
                 <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 bg-secondary rounded-full">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-gray-200 font-medium">Unlimited Chatbot Assistant</span>
                </li>
              </ul>

              <button className="w-full py-3.5 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary/90 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                Upgrade to Plus
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
