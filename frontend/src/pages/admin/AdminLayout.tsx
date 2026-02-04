import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  CoWrite
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
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
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
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
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to App
              </Link>
              <span className="text-sm text-gray-500">{user.name}</span>
              <button
                onClick={() => logout()}
                className="text-sm text-gray-600 hover:text-gray-900"
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
