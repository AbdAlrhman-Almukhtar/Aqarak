import { motion } from "framer-motion";
import { Bot, TrendingUp, Search, BarChart3, ArrowRight, MapPin, Terminal, Cpu, Activity, ShieldCheck, User } from "lucide-react";
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
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 relative">
              <Bot size={40} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-[-10px] inset-y-[-10px] border-2 border-dashed border-secondary/20 rounded-[2rem]"
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Meet Your AI Real Estate Expert</h3>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Stop searching and start asking. Our AI chat assistant understands natural language, helping you find properties, analyze trends, and answer legal questions instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Terminal size={18} />, text: "Neural NLP Processing", sub: "Natural language understanding", color: "text-accent" },
                { icon: <Activity size={18} />, text: "Real-time Analytics", sub: "Instant market snapshots", color: "text-secondary" },
                { icon: <Cpu size={18} />, text: "Vector Search", sub: "Semantically aware results", color: "text-primary" },
                { icon: <ShieldCheck size={18} />, text: "Legal Verification", sub: "Automated legal checking", color: "text-accent" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className={`${item.color} mt-1`}>{item.icon}</div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full grid grid-cols-1 gap-4"
          >
            <div className="relative rounded-3xl bg-card p-6 shadow-2xl border border-border overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary">
                <Bot size={200} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 text-sm text-foreground/80 max-w-[85%] border border-border/50">
                    <p>I found 3 villas in Abdoun. The average price is 450,000 JOD, which is 5% below market.</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex-shrink-0 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 text-sm max-w-[85%] shadow-lg shadow-primary/20">
                    <p>Can you show me the price history for that area?</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 text-foreground/80 max-w-[85%] border border-border/50">
                    <div className="flex items-center gap-2 mb-3 text-secondary font-semibold text-xs uppercase tracking-wider">
                      <TrendingUp size={14} />
                      <span>Price Trend: Abdoun</span>
                    </div>
                    <div className="h-24 flex items-end gap-1.5">
                      {[30, 45, 40, 60, 55, 75, 80].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="flex-1 bg-secondary/30 rounded-t-sm hover:bg-secondary/50 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0B1B34] border border-white/10 p-4 shadow-xl overflow-hidden group">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                  </div>
                  <span className="text-[10px] font-mono text-white/40 ml-2 uppercase tracking-widest leading-none">System Reasoning Log</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-secondary animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  LIVE_KERNEL
                </div>
              </div>
              <div className="font-mono text-[11px] space-y-1.5">
                {[
                  { label: "INPUT", text: "query_vector_matching...", color: "text-secondary" },
                  { label: "CACHE", text: "neighborhood_data_hit: ABDOUN", color: "text-accent" },
                  { label: "MODEL", text: "running_inference_v3.4.1 [42ms]", color: "text-white" },
                  { label: "LOGIC", text: "filtering_outliers(price < 2M)", color: "text-white/60" },
                  { label: "EXEC", text: "generating_natural_response...", color: "text-secondary" }
                ].map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-3"
                  >
                    <span className={`font-bold min-w-[50px] ${log.color}`}>[{log.label}]</span>
                    <span className="text-white/80">{log.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-xl shadow-accent/5">
              <BarChart3 size={40} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Data-Driven Decisions</h3>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Don't guess the price. Know it. Our proprietary AI model analyzes thousands of data points to predict property values with 98% accuracy.
            </p>

            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest mb-4">Model Performance Metrics</p>
                <div className="space-y-4">
                  {[
                    { label: "Model Accuracy", value: 83, color: "bg-secondary" },
                    { label: "Dataset Size", value: 100, labelValue: "8,000+", color: "bg-accent" },
                    { label: "Inference Time", value: 95, labelValue: "< 50ms", color: "bg-primary" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-foreground/60">{stat.label}</span>
                        <span className="text-primary">{stat.labelValue || `${stat.value}%`}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.value}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full ${stat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button size="xl" variant="secondary" className="w-full sm:w-auto h-16 px-10 rounded-2xl shadow-xl shadow-secondary/20 text-lg group bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => navigate('/predict')}>
                Try Price Predictor
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="relative rounded-[2.5rem] bg-primary border border-white/5 p-1 p-10 shadow-2xl overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 blur-[100px] rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/10">
                      <Activity size={12} className="text-secondary" />
                      AI Real-time Valuation
                    </div>
                    <h4 className="text-6xl font-bold text-white tracking-tighter">245,000 <span className="text-2xl text-white/40 font-normal">JOD</span></h4>
                  </div>
                  <div className="text-right">
                    <p className="text-secondary font-bold text-lg font-mono">+12.4%</p>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Annual Growth</p>
                  </div>
                </div>

                <div className="h-64 w-full flex items-end justify-between gap-2 mb-8">
                  {[35, 42, 45, 40, 55, 58, 62, 60, 75, 82, 85, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-gradient-to-t from-white/5 to-white/20 rounded-t-sm relative group/bar hover:to-secondary/50 transition-colors"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.5 + i * 0.05 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40"
                      >
                        {h * 3}k
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                  {[
                    { l: "Neighborhood", v: "+15.2%", c: "text-secondary" },
                    { l: "Property Age", v: "-2.4%", c: "text-red-400" },
                    { l: "Floor Lev.", v: "+4.1%", c: "text-accent" }
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">{item.l}</p>
                      <p className={`font-mono font-bold ${item.c}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-20">
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
                <span key={i} className="px-6 py-3 rounded-full bg-card border border-border text-sm font-semibold text-foreground/70 shadow-sm hover:shadow-md transition-shadow cursor-default flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
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
            <div className="relative rounded-[2.5rem] bg-card border border-border p-6 shadow-2xl overflow-hidden h-[500px]">
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
              <div className="absolute bottom-8 left-8 right-8 bg-card/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-extrabold text-primary">Lifestyle Compatibility Portfolio</span>
                  <span className="text-base font-bold text-accent bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">98.2% Match</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                      <span>Commute Efficiency</span>
                      <span className="text-primary">15 mins</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 1 }} className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(var(--brand-purple-rgb),0.3)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}