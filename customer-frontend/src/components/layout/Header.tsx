import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import PointsDisplay from '../PointsDisplay';

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="wood-texture text-stone-100 shadow-2xl sticky top-0 z-50 border-b-4 border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="hover:opacity-80 transition flex-shrink-0"
            onClick={closeMobileMenu}
          >
            {/* Mobile: Show "BARREN GROUND" only */}
            <span className="sm:hidden text-xl font-bold distressed-text" style={{ letterSpacing: '0.1em' }}>
              BARREN GROUND
            </span>
            {/* Desktop: Show full name */}
            <span className="hidden sm:inline text-xl sm:text-2xl font-bold distressed-text" style={{ letterSpacing: '0.1em' }}>
              BARREN GROUND COFFEE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/menu" className="hover:text-stone-300 transition font-bold tracking-wider text-sm" style={{ letterSpacing: '0.08em' }}>
              MENU
            </Link>
            <Link to="/membership" className="hover:text-stone-300 transition font-bold tracking-wider text-sm" style={{ letterSpacing: '0.08em' }}>
              ☕ MEMBERSHIP
            </Link>
            {isAuthenticated && <PointsDisplay />}
            <Link to="/cart" className="relative hover:text-stone-300 transition font-bold tracking-wider text-sm" style={{ letterSpacing: '0.08em' }}>
              CART
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-green-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-stone-100">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/account" className="hover:text-stone-300 transition font-bold tracking-wider text-sm" style={{ letterSpacing: '0.08em' }}>
                  {user?.name.toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="vintage-paper text-stone-900 hover:bg-stone-200 px-4 py-2 rounded-md transition font-bold border-2 border-stone-800 text-sm tracking-wider"
                  style={{ letterSpacing: '0.08em' }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="vintage-paper text-stone-900 hover:bg-stone-200 px-4 py-2 rounded-md transition font-bold border-2 border-stone-800 text-sm tracking-wider"
                style={{ letterSpacing: '0.08em' }}
              >
                LOGIN
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-stone-700 transition border-2 border-stone-600"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-800 border-t-4 border-stone-900">
          <nav className="px-4 py-4 space-y-3">
            <Link
              to="/menu"
              onClick={closeMobileMenu}
              className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
              style={{ letterSpacing: '0.08em' }}
            >
              MENU
            </Link>
            <Link
              to="/membership"
              onClick={closeMobileMenu}
              className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
              style={{ letterSpacing: '0.08em' }}
            >
              MEMBERSHIP
            </Link>
            {isAuthenticated && (
              <Link
                to="/loyalty"
                onClick={closeMobileMenu}
                className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
                style={{ letterSpacing: '0.08em' }}
              >
                ⭐ LOYALTY REWARDS
              </Link>
            )}
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm flex items-center justify-between border-2 border-stone-700"
              style={{ letterSpacing: '0.08em' }}
            >
              <span>CART</span>
              {itemCount > 0 && (
                <span className="bg-green-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-stone-100">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
                  style={{ letterSpacing: '0.08em' }}
                >
                  ACCOUNT ({user?.name.toUpperCase()})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
                  style={{ letterSpacing: '0.08em' }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block py-3 px-4 hover:bg-stone-700 rounded-md transition font-bold tracking-wider text-sm border-2 border-stone-700"
                style={{ letterSpacing: '0.08em' }}
              >
                LOGIN
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
