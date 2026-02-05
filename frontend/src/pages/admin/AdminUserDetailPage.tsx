import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminUserDetail } from '../../types';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await adminApi.deleteUser(user.id);
      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'User not found'}</p>
        <Link to="/admin/users" className="text-yellow-500 hover:text-yellow-400">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/users" className="text-yellow-500 hover:text-yellow-400 text-sm">
          &larr; Back to Users
        </Link>
      </div>

      {/* User Info */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.is_super_admin ? (
              <span className="px-3 py-1 bg-red-900/50 text-red-400 text-sm font-semibold rounded">
                Super Admin
              </span>
            ) : (
              <>
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="px-4 py-2 bg-yellow-900/50 text-yellow-400 rounded-lg hover:bg-yellow-900 disabled:opacity-50"
                >
                  {impersonating ? 'Switching...' : 'Impersonate User'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"
                >
                  Delete User
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Circles</p>
            <p className="font-medium text-white">{user.circles_count}</p>
          </div>
          <div>
            <p className="text-gray-500">Contributions</p>
            <p className="font-medium text-white">{user.contributions_count}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Circles */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Circles ({user.circles.length})
          </h2>

          <div className="space-y-3">
            {user.circles.map((circle) => (
              <Link
                key={circle.id}
                to={`/admin/circles/${circle.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <span className="font-medium text-white">{circle.name}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    circle.role === 'admin'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-gray-700 text-gray-400'
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
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Recent Contributions
          </h2>

          <div className="space-y-3">
            {user.contributions.map((contribution) => (
              <Link
                key={contribution.id}
                to={`/admin/stories/${contribution.story_id}`}
                className="block p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <p className="font-medium text-white">{contribution.story_title}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete User</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{user.name}</strong>? This will also delete all their contributions and remove them from all circles. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
