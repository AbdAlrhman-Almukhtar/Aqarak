import PillNav from '../components/PillNav';
import PropertyListings from '../components/PropertyListings';
import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function RentOld() {
  const navigate = useNavigate();
  
  const navItems = useMemo(
    () => [
      { label: 'Home', href: '/', onClick: () => navigate('/') },
      { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
      { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
      { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/rent"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-48 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            Properties for <span className="text-secondary">Rent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find your perfect rental in Jordan's most desirable neighborhoods
          </p>
        </div>

        <PropertyListings 
          filterType="rent" 
          onPropertyClick={(id) => navigate(`/property/${id}`)}
        />
      </div>
    </div>
  );
}
