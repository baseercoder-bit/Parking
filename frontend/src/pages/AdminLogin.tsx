import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16" style={{ backgroundColor: 'var(--white)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 border border-white/60">
          <div className="text-center mb-10 sm:mb-12 login-header-container">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg login-header-icon" style={{ backgroundColor: 'var(--primary-blue)' }}>
              <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Admin Login</h1>
            <p className="text-gray-600 text-base font-medium">Sign in to manage parking spots</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 login-form-container">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-center login-form-row">
              <div className="w-full max-w-xs">
                <label htmlFor="username" className="text-sm sm:text-base font-semibold text-gray-800 cursor-pointer block">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full min-h-[52px] px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 active:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 text-base touch-manipulation"
                  style={{ caretColor: '#3b82f6', WebkitTapHighlightColor: 'transparent' }}
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-center login-form-row">
              <div className="w-full max-w-xs">
                <label htmlFor="password" className="text-sm sm:text-base font-semibold text-gray-800 cursor-pointer block">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full min-h-[52px] px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 active:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 text-base touch-manipulation"
                  style={{ caretColor: '#3b82f6', WebkitTapHighlightColor: 'transparent' }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="min-h-[56px] py-5 px-6 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 login-sign-in-button touch-manipulation"
              style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)' }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 active:text-indigo-800 text-sm font-semibold transition-all duration-200 inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-lg hover:bg-indigo-50 active:bg-indigo-100 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ← Back to Public View
          </a>
        </div>
      </motion.div>
    </div>
  );
}

