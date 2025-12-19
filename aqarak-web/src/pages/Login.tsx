import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GridPattern } from '../components/ui/grid-pattern';
import logo from '../assets/logo.svg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/home';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GridPattern className="opacity-100 text-primary/10" gap={64} lineWidth={1} color="currentColor" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1100px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white/50 flex flex-col lg:flex-row min-h-[650px]"
      >
        
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/60">
          <div className="max-w-sm mx-auto w-full">
            <Link to="/home" className="inline-flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
              <img src={logo} alt="Aqarak" className="h-8 w-auto" />
              <span className="font-bold text-xl tracking-tight text-primary">Aqarak</span>
            </Link>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome back</h1>
              <p className="text-gray-500">Please enter your details to sign in.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Create free account
                </Link>
              </p>
              
              <button 
                onClick={() => navigate('/home')} 
                className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Continue as Guest
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary/5 flex-col justify-end">
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ 
              backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`, 
              backgroundSize: '30px 30px' 
            }} 
          />

          <div className="absolute inset-0 flex items-center justify-center p-8 pb-32 opacity-90">
             <div className="w-full h-full relative">
                <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                   <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                         <stop offset="100%" stopColor="var(--secondary)" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                         <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                         <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                         <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                         </feMerge>
                      </filter>
                   </defs>

                   {[0, 1, 2, 3, 4].map((i) => (
                      <path 
                         key={i} 
                         d={`M 0,${i * 50} H 400`} 
                         stroke="currentColor" 
                         strokeWidth="1" 
                         className="text-gray-200" 
                         strokeDasharray="4 4" 
                      />
                   ))}

                   <motion.path
                      d="M 0,150 C 50,150 100,100 150,110 S 250,50 300,60 S 380,20 400,10 V 200 H 0 Z"
                      fill="url(#areaGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                   />

                   <motion.path
                      d="M 0,150 C 50,150 100,100 150,110 S 250,50 300,60 S 380,20 400,10"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      filter="url(#glow)"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                   />

                   {[150, 300, 400].map((x, i) => (
                      <motion.circle
                         key={i}
                         cx={x}
                         cy={i === 0 ? 110 : i === 1 ? 60 : 10}
                         r="4"
                         fill="white"
                         stroke="var(--secondary)"
                         strokeWidth="2"
                         initial={{ scale: 0 }}
                         animate={{ scale: [0, 1, 1] }}
                         transition={{ delay: 1.5 + (i * 0.5) }}
                      />
                   ))}
                </svg>
             </div>
          </div>
          <motion.div 
             animate={{ y: [0, 15, 0] }}
             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[20%] left-[10%] bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/60 min-w-[200px] z-10"
          >
             <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                   <Home className="w-5 h-5 text-primary" />
                </div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                   <ArrowRight className="w-3 h-3 mr-1 -rotate-45" />
                   +12.5%
                </span>
             </div>
             <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Price</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-bold text-gray-900">125,000</span>
                   <span className="text-xs font-bold text-primary">JOD</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">High confidence prediction</p>
             </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-12 z-10 bg-gradient-to-t from-white/95 via-white/80 to-transparent">
            <h2 className="text-3xl font-bold mb-4 leading-tight text-primary">Your Personal AI Home Finder</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Experience a smarter way to buy and rent with our advanced Price Predictor and intelligent Chatbot Assistant guiding every step.
            </p>
          </div>
        </div>
      </motion.div>

      <footer className="absolute bottom-4 left-0 right-0 text-center z-20">
        <p className="text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} Aqarak Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}