import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
      navigate('/menu');
    } catch (err: any) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] vintage-paper flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border-2 sm:border-4 border-stone-300 scale-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 float">☕</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2 distressed-text" style={{ letterSpacing: '0.05em' }}>WELCOME BACK</h1>
          <p className="text-stone-600 text-base sm:text-lg font-semibold">Login to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 font-semibold text-sm sm:text-base">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 font-medium text-sm sm:text-base"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 font-medium text-sm sm:text-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full wood-texture text-stone-100 py-3 rounded-xl hover:opacity-90 transition-all font-bold text-base sm:text-lg disabled:opacity-50 transform hover:scale-105 border-2 border-stone-800 shadow-lg"
          >
            {isLoading ? 'Logging in...' : 'Login ✨'}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-stone-700 text-sm sm:text-base font-semibold">
            Don't have an account?{' '}
            <Link to="/register" className="text-stone-900 hover:text-stone-700 font-bold transition-colors underline">
              Register →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
