import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-32 px-4 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-accent/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 text-primary-foreground/90 text-sm font-medium mb-8 backdrop-blur-md border border-background/10"
        >
          <Sparkles size={16} className="text-secondary" />
          <span>Join the Future of Real Estate</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight"
        >
          Ready to find your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-foreground via-primary-foreground to-primary-foreground/50">
            dream property?
          </span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl text-primary-foreground/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Join thousands of users making smarter, data-driven real estate decisions with Aqarak today.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link to="/buy">
            <Button size="xl" variant="secondary" className="border-0 h-16 px-10 text-lg rounded-2xl shadow-xl shadow-secondary/10 hover:shadow-2xl">
              Start Browsing <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <Link to="/list-property">
            <Button size="xl" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-16 px-10 text-lg rounded-2xl backdrop-blur-sm transition-all duration-200">
              List Your Property
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
