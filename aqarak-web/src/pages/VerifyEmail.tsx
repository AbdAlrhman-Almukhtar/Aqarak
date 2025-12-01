import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Verifying...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Email Verified!</h2>
            <p className="text-gray-600 mt-2">Your account has been successfully verified.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Verification Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-black transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
