import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminUserDetail } from '../../types';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    if (!id) return;

    adminApi
      .getUser(parseInt(id))
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load user'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleImpersonate = async () => {
    if (!user || user.is_super_admin) return;

    try {
      setImpersonating(true);
      const res = await adminApi.impersonateUser(user.id);
      localStorage.setItem('authToken', res.data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to impersonate user');
      setImpersonating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'User not found'}</p>
        <Link to="/admin/users" className="text-purple-600 hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/users" className="text-purple-600 hover:underline text-sm">
          &larr; Back to Users
        </Link>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.is_super_admin ? (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                Super Admin
              </span>
            ) : (
              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                {impersonating ? 'Switching...' : 'Impersonate User'}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Circles</p>
            <p className="font-medium text-gray-900">{user.circles_count}</p>
          </div>
          <div>
            <p className="text-gray-500">Contributions</p>
            <p className="font-medium text-gray-900">{user.contributions_count}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Circles */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Circles ({user.circles.length})
          </h2>

          <div className="space-y-3">
            {user.circles.map((circle) => (
              <Link
                key={circle.id}
                to={`/admin/circles/${circle.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{circle.name}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    circle.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {circle.role}
                </span>
              </Link>
            ))}

            {user.circles.length === 0 && (
              <p className="text-center text-gray-500 py-4">No circles</p>
            )}
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Contributions
          </h2>

          <div className="space-y-3">
            {user.contributions.map((contribution) => (
              <Link
                key={contribution.id}
                to={`/admin/stories/${contribution.story_id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <p className="font-medium text-gray-900">{contribution.story_title}</p>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{contribution.word_count} words</span>
                  <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}

            {user.contributions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No contributions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
