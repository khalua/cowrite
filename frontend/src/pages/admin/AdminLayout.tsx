import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.is_super_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/circles', label: 'Circles' },
    { path: '/admin/stories', label: 'Stories' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold text-yellow-500">
                  CoWrite
                </span>
                <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-semibold rounded">
                  ADMIN
                </span>
              </Link>

              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.path)
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm text-gray-400 hover:text-gray-200"
              >
                Back to App
              </Link>
              <span className="text-sm text-gray-500">{user.name}</span>
              <button
                onClick={() => logout()}
                className="text-sm text-gray-400 hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
