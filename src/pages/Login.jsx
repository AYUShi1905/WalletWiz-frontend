import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Load and initialize Google Identity Services
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '259367468165-dummy.apps.googleusercontent.com', // Fallback placeholder if not set
          callback: async (response) => {
            setError('');
            setSubmitting(true);
            try {
              await loginWithGoogle(response.credential);
              navigate('/');
            } catch (err) {
              setError(err.detail || err.message || 'Google authentication failed.');
            } finally {
              setSubmitting(false);
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { 
            theme: 'filled_black', 
            size: 'large', 
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%',
          }
        );
      }
    };

    const scriptExists = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!scriptExists) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      const timer = setTimeout(initializeGoogle, 200);
      return () => clearTimeout(timer);
    }
  }, [loginWithGoogle, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.detail || err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-brand-dark px-4 overflow-hidden">
      {/* Background visual gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-accent to-cyan-400 bg-clip-text text-transparent">
            WalletWiz
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Welcome back! Manage your transactions with ease.</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all duration-300 text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all duration-300 text-slate-100 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-brand-accent to-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-brand-accent/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader className="animate-spin h-5 w-5 mr-2" /> : null}
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full"></div>
            <span className="absolute px-3 bg-[#111625] text-xs font-medium text-slate-400">
              or continue with
            </span>
          </div>

          {/* Google Sign In Container */}
          <div className="flex justify-center">
            <div id="googleSignInDiv" className="w-full"></div>
          </div>

          {/* Form Footer */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-accent hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
