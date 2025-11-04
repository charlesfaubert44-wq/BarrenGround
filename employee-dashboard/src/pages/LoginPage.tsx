import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      authLogin(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      {/* Wilderness decorative elements */}
      <div className="absolute top-10 left-10 text-9xl opacity-10 float">🌲</div>
      <div className="absolute bottom-20 right-10 text-8xl opacity-10 float" style={{ animationDelay: '0.5s' }}>⛰️</div>
      <div className="absolute top-1/2 left-1/4 text-7xl opacity-5 float" style={{ animationDelay: '1s' }}>🌲</div>

      <div className="max-w-md w-full relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8 fade-in">
          <div className="text-6xl mb-2">☕</div>
          <h1 className="text-4xl font-bold text-stone-100 mb-2 distressed-text drop-shadow-lg">
            BARREN GROUND
          </h1>
          <p className="text-amber-500 font-semibold text-sm tracking-wider">
            EMPLOYEE DASHBOARD
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-stone-800 rounded-xl shadow-2xl p-6 sm:p-8 border-4 border-amber-800/50 scale-in">
          <h2 className="text-2xl font-bold text-stone-100 mb-6 text-center distressed-text">
            Team Login
          </h2>

          {error && (
            <div className="bg-red-900/50 border-2 border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4 font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-stone-200 mb-2 uppercase tracking-wide"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-stone-600 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition bg-stone-900 text-stone-100 font-medium placeholder-stone-500"
                placeholder="your.name@barrenground.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-stone-200 mb-2 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-stone-600 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition bg-stone-900 text-stone-100 font-medium placeholder-stone-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full wood-texture text-white py-3 rounded-lg hover:opacity-90 transition font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-400">
            <p className="font-semibold">Northern roasted. Community powered.</p>
            <p className="text-xs mt-1 text-stone-500">Est. 2017 • Yellowknife, NT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
