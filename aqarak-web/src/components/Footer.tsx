import logo from "../assets/logo.svg";
import { Facebook, Twitter, Instagram, Linkedin,Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-background text-foreground pt-24 pb-12 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <img src={logo} alt="Aqarak" className="h-12 mb-6" />
            <p className="text-foreground/70 mb-6 leading-relaxed">
              The smartest way to buy, rent, and value properties in Jordan. Powered by AI, driven by data.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
              <SocialIcon icon={<Facebook size={20} />} />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-foreground/70">
              <li><Link to="/buy" className="hover:text-accent transition-colors">Buy Property</Link></li>
              <li><Link to="/rent" className="hover:text-accent transition-colors">Rent Property</Link></li>
              <li><Link to="/predict" className="hover:text-accent transition-colors">Price Prediction</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Find an Agent</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-foreground/70">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-foreground/70">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <span>Amman, Jordan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent" />
                <span>+962 6 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent" />
                <span>hello@aqarak.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/50">
          <p>© 2024 Aqarak. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}
