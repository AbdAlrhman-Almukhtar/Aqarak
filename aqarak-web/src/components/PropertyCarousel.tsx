import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, MapPin, Bot } from "lucide-react";
import { Button } from "./ui/button";
import villa1 from "../assets/properties/villa1.png";
import apartment1 from "../assets/properties/apartment1.png";
import house1 from "../assets/properties/house1.png";

const properties = [
  {
    id: 1,
    title: "Modern Luxury Villa",
    location: "Abdoun, Amman",
    price: "2,500,000 JOD",
    description: "Experience the epitome of luxury living in this architectural masterpiece.",
    image: villa1,
  },
  {
    id: 2,
    title: "Skyline Penthouse",
    location: "Dabouq, Amman",
    price: "1,200,000 JOD",
    description: "Breathtaking panoramic views of the city from your private terrace.",
    image: apartment1,
  },
  {
    id: 3,
    title: "Contemporary Garden",
    location: "Dead Sea, Jordan",
    price: "450,000 JOD",
    description: "A serene oasis combining modern design with natural beauty.",
    image: house1,
  },
  {
    id: 4,
    title: "Seaside Retreat",
    location: "Aqaba, Jordan",
    price: "850,000 JOD",
    description: "Luxury beachfront living with direct access to the Red Sea.",
    image: villa1,
  },
];

export function PropertyCarousel() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  const x = useTransform(smoothProgress, [0, 1], ["2%", "-75%"]);
  const opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  return (
    <section ref={targetRef} className="relative h-[250vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
      
        <motion.div 
          style={{ opacity, scale }}
          className="absolute top-1/2 -translate-y-1/2 left-8 md:left-20 z-10 max-w-md pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">Premium Collection</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
            Exclusive <br/><span className="text-secondary">Listings</span>
          </h2>
          <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
            Curated selection of Jordan's most prestigious properties, available for immediate viewing.
          </p>
          <div className="pointer-events-auto">
            <Button size="xl" className="group gap-2 rounded-full">
              View All Properties 
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        <motion.div style={{ x }} className="flex gap-10 pl-[45vw] md:pl-[40vw] h-[65vh] items-center">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
          <div 
            onClick={() => {
              document.getElementById('tech-showcase')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative h-full w-[380px] md:w-[480px] flex-shrink-0 overflow-hidden rounded-[2.5rem] bg-[#0B1B34] flex flex-col items-center justify-center cursor-pointer border border-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1B34] to-[#1a2b4a] transition-all duration-500 group-hover:scale-105" />
            
            <div className="relative z-10 flex flex-col items-center justify-center p-8 h-full text-center">
              <div className="mb-6 relative">
                 <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                 <Bot className="w-16 h-16 text-secondary relative z-10 drop-shadow-lg" />
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-none">
                AI Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">Real Estate</span>
              </h3>

              <p className="text-white/60 text-lg mb-8 max-w-[280px] leading-relaxed">
                Experience the next generation of property finding.
              </p>

              <div className="inline-flex items-center gap-2 text-white font-semibold border-b border-secondary/50 pb-0.5 group-hover:border-secondary transition-colors">
                <span>Discover the Magic</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PropertyCard({ property }: { property: (typeof properties)[0] }) {
  return (
    <div className="group relative h-full w-[380px] md:w-[480px] flex-shrink-0 overflow-hidden rounded-[2.5rem] bg-card border border-border/10 shadow-xl cursor-pointer">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 translate-y-2 transition-transform duration-300 ease-out group-hover:translate-y-0">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2 leading-tight">
                {property.title}
              </h3>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="block text-xs uppercase tracking-wider text-white/60 mb-1">Asking Price</span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {property.price}
                </span>
              </div>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
              >
                <ArrowRight className="w-5 h-5 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
