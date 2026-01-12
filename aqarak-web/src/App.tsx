import StaggeredMenu, { type StaggeredMenuItem } from "./components/StaggeredMenu";
import { Routes, Route } from "react-router-dom";
import { Hero } from "./components/ui/animated-hero"; 
import { PropertyCarousel } from "./components/PropertyCarousel";
import { TechShowcase } from "./components/TechShowcase";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import Predict from "./pages/Predict";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ListProperty from "./pages/ListProperty";
import PropertyDetails from "./pages/PropertyDetails";
import EditProperty from "./pages/EditProperty";
import SavedProperties from "./pages/SavedProperties";
import MyListings from "./pages/MyListings";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import ChatWidget from "./components/ChatWidget";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider} from "./contexts/ChatContext";
import ProtectedRoute from "./components/ProtectedRoute";
import logo from "./assets/logo.svg";

function MainLayout() {

  const sideMenuItems: StaggeredMenuItem[] = [
  { label: "Saved",ariaLabel: "Saved Properties",link:"/saved" },
  { label: "My Listings", ariaLabel: "My Listings",link:"/my-listings" },
  { label: "List Property", ariaLabel: "List Property",link:"/list-property" },
  { label: "Subscription", ariaLabel: "Subscription", link: "/subscription" },
  { label: "Profile", ariaLabel: "Profile",link:"/profile" },
  ];
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <StaggeredMenu
        position="right"
        items={sideMenuItems}
        displaySocials={false}
        displayItemNumbering={false}
        logoUrl={logo}
        isFixed={true}
        changeMenuColorOnOpen={false}
      />
      
      <main>
        <Routes>
          <Route
            path="/home"
            element={
              <>
                <Hero />
                <PropertyCarousel />
                <TechShowcase />
                <CTASection />
              </>
            }
          />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/list-property" element={
            <ProtectedRoute>
              <ListProperty />
            </ProtectedRoute>
          } />
          <Route path="/edit-property/:id" element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/saved" element={<SavedProperties />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <MainLayout />
      </ChatProvider>
    </AuthProvider>
  );
}