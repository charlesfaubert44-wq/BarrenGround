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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-amber-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee Dashboard</h1>
              {user && <p className="text-sm text-amber-200">Welcome, {user.name}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-amber-800 rounded hover:bg-amber-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="p-4 space-y-2">
            <Link
              to="/"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive('/')
                  ? 'bg-amber-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Order Queue
            </Link>
            <Link
              to="/history"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive('/history')
                  ? 'bg-amber-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Order History
            </Link>
            <Link
              to="/analytics"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive('/analytics')
                  ? 'bg-amber-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Analytics
            </Link>
            <Link
              to="/menu"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive('/menu')
                  ? 'bg-amber-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Menu Management
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
