import { motion } from "framer-motion";
import { Bot, TrendingUp, Search, BarChart3, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function TechShowcase() {
  const navigate = useNavigate();
  return (
    <section id="tech-showcase" className="w-full bg-gradient-to-b from-background to-muted/30 py-32 px-4 text-foreground overflow-hidden relative">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-primary/10 -translate-x-1/2 z-0" />
      <div className="max-w-7xl mx-auto space-y-32 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6 border border-primary/10"
          >
            <Sparkles size={16} />
            <span>Next-Gen Real Estate</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 text-primary tracking-tight"
          >
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-foreground/60 leading-relaxed"
          >
            Aqarak combines advanced market data with AI intelligence to give you the smartest real estate experience.
          </motion.p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
              <Bot size={40} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Meet Your AI Real Estate Expert</h3>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Stop searching and start asking. Our AI chat assistant understands natural language, helping you find properties, analyze trends, and answer legal questions instantly.
            </p>
            <ul className="space-y-4 pt-4">
              {["Natural language search", "Instant market analysis", "24/7 availability"].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-medium text-foreground/80">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                    <ArrowRight size={16} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="relative rounded-3xl bg-card p-8 shadow-2xl shadow-primary/5 overflow-hidden border border-border">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                <Sparkles size={300} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                    <Bot size={20} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-none p-6 text-foreground/80 max-w-[85%] shadow-sm border border-border/50">
                    <p>I found 3 villas in Abdoun matching your criteria. The average price is 450,000 JOD, which is 5% below the market average.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-6 max-w-[85%] shadow-lg shadow-primary/20">
                    <p>That sounds great. Can you show me the price history for that area?</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                    <Bot size={20} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-none p-6 text-foreground/80 max-w-[85%] shadow-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                      <TrendingUp size={18} />
                      <span>Price Trend: Abdoun</span>
                    </div>
                    <div className="h-32 flex items-end gap-2">
                       {[30, 45, 40, 60, 55, 75, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row-reverse items-center gap-20">
           <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
              <BarChart3 size={40} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Data-Driven Decisions</h3>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Don't guess the price. Know it. Our proprietary AI model analyzes thousands of data points to predict property values with 98% accuracy.
            </p>
             <Button size="xl" variant="secondary" className="mt-4" onClick={() => navigate('/predict')}>
              Try Price Predictor
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
             <div className="relative rounded-3xl bg-card border border-border p-10 shadow-2xl shadow-secondary/5 overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <p className="text-sm text-foreground/40 uppercase tracking-widest font-bold mb-2">Estimated Value</p>
                    <h4 className="text-5xl font-bold text-primary tracking-tight">245,000 JOD</h4>
                  </div>
                  <div className="px-6 py-3 bg-green-500/10 text-green-600 rounded-full font-bold text-sm border border-green-500/20">
                    +12% vs Last Year
                  </div>
                </div>
                <div className="h-80 w-full flex items-end justify-between gap-3">
                  {[35, 42, 45, 40, 55, 58, 62, 60, 75, 82, 85, 90].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-gradient-to-t from-secondary/10 to-secondary rounded-t-lg relative group"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h}k
                      </div>
                    </motion.div>
                  ))}
                </div>
             </div>
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-20">
           <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Search size={40} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Smart Discovery</h3>
            <p className="text-xl text-foreground/60 leading-relaxed">
              More than just a search bar. Filter by commute time, school ratings, and lifestyle preferences to find a home that truly fits your life.
            </p>
            <div className="flex gap-3 flex-wrap">
              {["Commute Time", "School Ratings", "Safety Score", "Future Growth"].map((tag, i) => (
                <span key={i} className="px-6 py-3 rounded-full bg-card border border-border text-sm font-semibold text-foreground/70 shadow-sm hover:shadow-md transition-shadow cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
             <div className="relative rounded-3xl bg-card border border-border p-6 shadow-2xl shadow-primary/5 overflow-hidden h-[500px]">
                <div className="absolute inset-0 bg-muted/30">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="relative group cursor-pointer">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 z-10 relative transition-transform group-hover:scale-110">
                        <MapPin size={32} fill="currentColor" />
                      </div>
                      <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-card px-6 py-3 rounded-2xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-border">
                        <p className="font-bold text-primary text-lg">450K JOD</p>
                        <p className="text-xs text-muted-foreground font-medium">98% Match</p>
                      </div>
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute top-2/3 right-1/4"
                  >
                     <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground shadow-lg shadow-secondary/30">
                        <MapPin size={24} fill="currentColor" />
                      </div>
                  </motion.div>
                   <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute bottom-1/4 left-1/4"
                  >
                     <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground shadow-lg shadow-accent/30">
                        <MapPin size={20} fill="currentColor" />
                      </div>
                  </motion.div>
                </div>
                <div className="absolute bottom-8 left-8 right-8 bg-card/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-bold text-primary">Commute to Work</span>
                    <span className="text-base font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full">15 mins</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[25%] bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
