import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminCircle } from '../../types';

export function AdminCircleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<AdminCircle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!circle) return;

    try {
      setIsDeleting(true);
      await adminApi.deleteCircle(circle.id);
      navigate('/admin/circles');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete circle');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    adminApi
      .getCircle(parseInt(id))
      .then((res) => setCircle(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load circle'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Circle not found'}</p>
        <Link to="/admin/circles" className="text-green-500 hover:text-green-400">
          Back to Circles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/circles" className="text-green-500 hover:text-green-400 text-sm">
          &larr; Back to Circles
        </Link>
      </div>

      {/* Circle Info */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{circle.name}</h1>
            {circle.description && (
              <p className="text-gray-400">{circle.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"
          >
            Delete Circle
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Created by</p>
            <Link
              to={`/admin/users/${circle.creator.id}`}
              className="font-medium text-green-500 hover:text-green-400"
            >
              {circle.creator.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium text-white">
              {new Date(circle.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Stats</p>
            <p className="text-white">
              {circle.members_count} members &middot; {circle.stories_count} stories
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Members ({circle.members.length})
          </h2>

          <div className="space-y-3">
            {circle.members.map((member) => (
              <Link
                key={member.id}
                to={`/admin/users/${member.user_id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white font-medium">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    member.role === 'admin'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {member.role}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stories */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Stories ({circle.stories.length})
          </h2>

          <div className="space-y-3">
            {circle.stories.map((story) => (
              <Link
                key={story.id}
                to={`/admin/stories/${story.id}`}
                className="block p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{story.title}</p>
                    <p className="text-sm text-gray-500">
                      {story.contributions_count} contributions
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      story.status === 'active'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {story.status}
                  </span>
                </div>
              </Link>
            ))}

            {circle.stories.length === 0 && (
              <p className="text-center text-gray-500 py-4">No stories yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Circle</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{circle.name}</strong>? This will also delete all stories and contributions in this circle. This action cannot be undone.
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
                {isDeleting ? 'Deleting...' : 'Delete Circle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
