import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

export default function Signup() {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otp);
      navigate('/home');
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      const errorMsg = err?.response?.data?.detail || 'Invalid code';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length >= 8 ? (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) ? 'strong' : 'medium') : 'weak';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, phone, name);
      setSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Response data:', err?.response?.data);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Registration failed';
      setError(errorMsg);
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
            <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join Aqarak to find your dream property</p>
          </div>

          {!success ? (
            <>
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
                  <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
                      placeholder="079 123 4567"
                    />
                  </div>
                </div>

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
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${passwordStrength === 'strong' ? 'bg-green-500 w-full' :
                            passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                              'bg-red-500 w-1/3'
                            }`}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${passwordStrength === 'strong' ? 'text-green-600' :
                        passwordStrength === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {passwordStrength}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary transition-colors"
                      placeholder="••••••••"
                    />
                    {confirmPassword && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {password === confirmPassword ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verify your email</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                We've sent a 6-digit code to <span className="font-semibold text-primary">{email}</span>.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-left"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-xs">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center text-3xl tracking-[1em] font-bold py-4 bg-card border border-border rounded-xl text-primary focus:outline-none focus:border-secondary transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </button>
              </form>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Start Your Property Journey
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Join thousands of users who trust Aqarak for their real estate needs.
          </p>
        </div>
      </div>
    </div>
  );
}
