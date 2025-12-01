import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { Button } from "./button";
import { GridPattern } from "./grid-pattern";
import PillNav from "../PillNav";
import logo from "../../assets/logo.svg";
import { useAuth } from "../../contexts/AuthContext";

export function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Aqarak", "Listing", "Buying", "Price Prediction", "AI Assistant"],
    []
  );
  
  const navItems = useMemo(
    () => [
      { label: "Home", href: "/", onClick: () => navigate("/") },
      { label: "Buy", href: "/buy", onClick: () => navigate("/buy") },
      { label: "Rent", href: "/rent", onClick: () => navigate("/rent") },
      { label: "Predict", href: "/predict", onClick: () => navigate("/predict") },
    ],
    [navigate]
  );

  useEffect(() => {
    const id = setTimeout(
      () => setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1)),
      2000
    );
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <section className="relative w-full overflow-hidden bg-background min-h-[70vh]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/10" gap={64} lineWidth={1} color="currentColor" opacity={1} />
        <div className="absolute inset-0 bg-background/40" />
      </div>
      
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="#buy"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <div className="flex gap-8 pt-32 pb-20 lg:pt-48 lg:pb-32 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-7xl md:text-9xl max-w-4xl tracking-tighter text-center font-normal text-primary">
              <span className="text-primary">Welcome to</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-2xl md:text-3xl leading-relaxed tracking-tight text-foreground/70 max-w-4xl text-center">
              Aqarak is your destination for listing and buying properties. Experience our
              advanced price prediction mode and AI assistant chat bot powered by the
              Gemini API.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/signup">
                  <Button size="xl" variant="secondary" className="gap-4">
                    Get Started <MoveRight className="w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="xl" className="gap-4 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary" variant="outline">
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/buy">
                  <Button size="xl" variant="secondary" className="gap-4">
                    Browse Properties <MoveRight className="w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/list-property">
                  <Button size="xl" className="gap-4">
                    List Your Property
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}