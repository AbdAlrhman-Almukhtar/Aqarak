import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

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
    <div className="min-h-screen bg-background flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <img src={logo} alt="Aqarak" className="h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-secondary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Find Your Perfect Property
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Access exclusive listings, save your favorites, and get personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}