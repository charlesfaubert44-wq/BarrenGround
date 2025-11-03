import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { register } from '../api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await register({ email, password, name, phone: phone || undefined });
      authLogin(response.token, response.user);
      navigate('/menu');
    } catch (err: any) {
      setError(err.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] animated-gradient flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-8 border-2 border-amber-100 scale-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 float">🎉</div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-gray-600 text-lg">Join us for faster checkout</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white py-3 rounded-xl hover:shadow-2xl transition-all font-bold text-lg disabled:bg-gray-400 transform hover:scale-105 pulse-glow"
          >
            {isLoading ? 'Creating account...' : 'Create Account ✨'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-700 text-lg">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-900 hover:text-orange-700 font-bold transition-colors">
              Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
