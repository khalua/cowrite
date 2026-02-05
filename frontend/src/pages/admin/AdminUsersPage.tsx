import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AdminUser } from '../../types';

export function AdminUsersPage() {
  useAuth(); // Ensure user is authenticated
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [impersonating, setImpersonating] = useState<number | null>(null);

  useEffect(() => {
    adminApi
      .listUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load users'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleImpersonate = async (user: AdminUser) => {
    if (user.is_super_admin) {
      alert('Cannot impersonate another super admin');
      return;
    }

    try {
      setImpersonating(user.id);
      const res = await adminApi.impersonateUser(user.id);
      localStorage.setItem('authToken', res.data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to impersonate user');
      setImpersonating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">All Users</h1>
        <span className="text-gray-400">{users.length} users</span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Circles
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Contributions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <Link to={`/admin/users/${user.id}`} className="block">
                    <p className="font-medium text-white hover:text-yellow-400">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {user.is_super_admin ? (
                    <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-semibold rounded">
                      Super Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs font-semibold rounded">
                      User
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400">{user.circles_count}</td>
                <td className="px-6 py-4 text-gray-400">{user.contributions_count}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {!user.is_super_admin && (
                    <button
                      onClick={() => handleImpersonate(user)}
                      disabled={impersonating === user.id}
                      className="px-3 py-1 text-sm bg-yellow-900/50 text-yellow-400 rounded hover:bg-yellow-900 disabled:opacity-50"
                    >
                      {impersonating === user.id ? 'Switching...' : 'Impersonate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
