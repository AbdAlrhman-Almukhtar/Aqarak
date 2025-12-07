import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Loader2, User, Lock, Save, AlertCircle, CheckCircle2, Camera, 
  Home, Heart, LayoutList, Clock, ArrowRight, Mail, Shield, Phone
} from 'lucide-react';
import PillNav from '../components/PillNav';
import { GridPattern } from '../components/ui/grid-pattern';
import logo from '../assets/logo.svg';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const navItems = [
    { label: 'Home', href: '/', onClick: () => navigate('/') },
    { label: 'Buy', href: '/buy', onClick: () => navigate('/buy') },
    { label: 'Rent', href: '/rent', onClick: () => navigate('/rent') },
    { label: 'Predict', href: '/predict', onClick: () => navigate('/predict') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/me', {
        name: name || undefined,
        phone: phone || undefined,
        password: password || undefined,
      });
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err?.response?.data?.detail || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'List Property', icon: Home, onClick: () => navigate('/list-property'), color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'My Listings', icon: LayoutList, onClick: () => navigate('/my-listings'), color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Saved Properties', icon: Heart, onClick: () => navigate('/saved'), color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-50 text-primary/5" gap={64} lineWidth={1} color="currentColor" opacity={0.5} />
      </div>

      <header className="fixed z-[1000] inset-x-0 top-0 pt-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="Aqarak"
            items={navItems}
            activeHref="/profile"
            baseColor="var(--primary)"
            pillColor="var(--background)"
            hoveredPillTextColor="#ffffff"
            pillTextColor="var(--primary)"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <User className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and settings</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card & Actions */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
                
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center text-4xl font-bold text-primary mb-4 relative group cursor-pointer">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-primary mb-1">{user?.name || 'User'}</h2>
                  <p className="text-muted-foreground mb-6">{user?.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-2 px-4 rounded-full mx-auto w-fit">
                    <Clock className="w-4 h-4" />
                    <span>Member since {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
                <h3 className="text-lg font-bold text-primary mb-4 px-2">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all group text-left border border-transparent hover:border-border"
                    >
                      <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-primary flex-1">{action.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl p-8 md:p-10 shadow-xl border border-border">
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal details and password</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 ${
                        message.type === 'success' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm font-medium">{message.text}</p>
                    </motion.div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-secondary transition-colors" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-primary mb-3">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-secondary transition-colors" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-2 text-primary font-bold border-b border-border pb-2">
                      <Lock className="w-4 h-4" />
                      <h3>Change Password</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">New Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-secondary transition-colors" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Confirm Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-secondary transition-colors" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
