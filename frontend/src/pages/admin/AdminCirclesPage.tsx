import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminCircle } from '../../types';

export function AdminCirclesPage() {
  const [circles, setCircles] = useState<AdminCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listCircles()
      .then((res) => setCircles(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load circles'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Circles</h1>
        <span className="text-gray-500">{circles.length} circles</span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="grid gap-4">
        {circles.map((circle) => (
          <Link
            key={circle.id}
            to={`/admin/circles/${circle.id}`}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{circle.name}</h3>
                {circle.description && (
                  <p className="text-gray-600 mt-1">{circle.description}</p>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                Created by {circle.creator.name}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Members:</span>{' '}
                <span className="font-medium text-gray-900">{circle.members_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Stories:</span>{' '}
                <span className="font-medium text-gray-900">{circle.stories_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>{' '}
                <span className="text-gray-700">
                  {new Date(circle.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Member avatars */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Members:</span>
              <div className="flex -space-x-2">
                {circle.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={member.user.name}
                  >
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {circle.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                    +{circle.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {circles.length === 0 && (
          <div className="text-center py-12 text-gray-500">No circles found</div>
        )}
      </div>
    </div>
  );
}
