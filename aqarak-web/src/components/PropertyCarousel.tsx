import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    image: villa1,
  },
  {
    id: 2,
    title: "Skyline Penthouse",
    location: "Dabouq, Amman",
    price: "1,200,000 JOD",
    image: apartment1,
  },
  {
    id: 3,
    title: "Contemporary Garden Home",
    location: "Dead Sea, Jordan",
    price: "450,000 JOD",
    image: house1,
  },
  {
    id: 4,
    title: "Seaside Retreat",
    location: "Aqaba, Jordan",
    price: "850,000 JOD",
    image: villa1,
  },
];

export function PropertyCarousel() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-55%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute top-10 left-10 z-10 max-w-md">
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Exclusive Listings
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Explore our curated selection of premium properties available for
            immediate viewing.
          </p>
          <Button size="xl" variant="secondary" className="gap-2">
            View All Properties <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <motion.div style={{ x }} className="flex gap-8 pl-[40vw]">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PropertyCard({ property }: { property: (typeof properties)[0] }) {
  return (
    <div className="group relative h-[600px] w-[450px] overflow-hidden rounded-3xl bg-primary shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl border border-border/10">
      <div className="absolute inset-0 z-0">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
      </div>
      <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex flex-col justify-end h-full bg-gradient-to-t from-primary/90 via-transparent to-transparent">
        <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
          <h3 className="text-3xl font-light text-primary-foreground mb-2 tracking-tight leading-tight">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-primary-foreground/80 mb-6">
            <span className="inline-block w-1 h-1 rounded-full bg-primary-foreground/50" />
            <p className="text-lg font-light tracking-wide">{property.location}</p>
          </div>
          <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-6">
            <span className="text-2xl font-medium text-primary-foreground tracking-tight">
              {property.price}
            </span>
            <Button
              size="icon"
              className="rounded-full bg-background text-foreground hover:bg-background/90 h-12 w-12 transition-transform duration-300 group-hover:scale-110"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
