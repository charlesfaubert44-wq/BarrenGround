import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Dark texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.3) 3px)',
      }}></div>

      {/* Wilderness decorative elements */}
      <div className="absolute top-20 right-20 text-9xl opacity-5 float pointer-events-none">🌲</div>
      <div className="absolute bottom-40 left-10 text-8xl opacity-5 float pointer-events-none" style={{ animationDelay: '0.5s' }}>⛰️</div>

      {/* Header */}
      <header className="wood-texture text-white shadow-lg border-b-4 border-amber-800 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">☕</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-wide distressed-text">
                  BARREN GROUND
                </h1>
                <p className="text-xs sm:text-sm text-amber-200 font-semibold tracking-wider">
                  EMPLOYEE DASHBOARD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <p className="text-xs sm:text-sm text-amber-100 font-semibold hidden sm:block">
                  {user.name}
                </p>
              )}
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-stone-900 rounded-lg hover:bg-stone-800 transition font-bold text-xs sm:text-sm uppercase tracking-wide shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-48 sm:w-64 bg-stone-900 shadow-xl min-h-screen border-r-4 border-amber-800">
          <nav className="p-3 sm:p-4 space-y-2">
            <Link
              to="/"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-xs uppercase tracking-wide ${
                isActive('/')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>✓</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm">Order Queue</span>
                  <span className="text-[10px] text-stone-400 normal-case font-normal">Confirmed & Paid</span>
                </div>
              </div>
            </Link>
            <Link
              to="/kitchen"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-xs uppercase tracking-wide ${
                isActive('/kitchen')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🍽️</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm">Kitchen Queue</span>
                  <span className="text-[10px] text-stone-400 normal-case font-normal">Food Items Only</span>
                </div>
              </div>
            </Link>
            <Link
              to="/live-carts"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-xs uppercase tracking-wide ${
                isActive('/live-carts')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm">Live Carts</span>
                  <span className="text-[10px] text-stone-400 normal-case font-normal">Not Ordered Yet</span>
                </div>
              </div>
            </Link>
            <Link
              to="/history"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-sm uppercase tracking-wide ${
                isActive('/history')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              📜 History
            </Link>
            <Link
              to="/analytics"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-sm uppercase tracking-wide ${
                isActive('/analytics')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              📊 Analytics
            </Link>
            <Link
              to="/menu"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-sm uppercase tracking-wide ${
                isActive('/menu')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              📝 Menu
            </Link>
            <Link
              to="/promos"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-sm uppercase tracking-wide ${
                isActive('/promos')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              🎉 Promos
            </Link>
            <Link
              to="/news"
              className={`block px-3 sm:px-4 py-3 rounded-lg transition font-bold text-sm uppercase tracking-wide ${
                isActive('/news')
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              📰 News
            </Link>
          </nav>

          {/* Branding Footer in Sidebar */}
          <div className="p-4 mt-8 border-t border-stone-700">
            <p className="text-xs text-stone-400 text-center font-semibold">
              Northern roasted.
            </p>
            <p className="text-xs text-stone-400 text-center font-semibold">
              Community powered.
            </p>
            <p className="text-xs text-stone-500 text-center mt-2">
              Est. 2017
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
