import PillNav from '../components/PillNav';
import PropertyListings from '../components/PropertyListings';
import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function BuyOld() {
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
    <div className="min-h-screen bg-[#F4F1E8]">
      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/buy"
            baseColor="#0B1B34"
            pillColor="#F4F1E8"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#0B1B34"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-48 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0B1B34]">
            Properties for <span className="text-secondary">Sale</span>
          </h1>
          <p className="text-xl text-[#0B1B34]/70 max-w-2xl mx-auto">
            Discover your dream property in Jordan's finest locations
          </p>
        </div>

        <PropertyListings 
          filterType="sale" 
          onPropertyClick={(id) => navigate(`/property/${id}`)}
        />
      </div>
    </div>
  );
}
