import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminStory } from '../../types';

export function AdminStoriesPage() {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    adminApi
      .listStories()
      .then((res) => setStories(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load stories'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredStories = stories.filter((story) => {
    if (filter === 'all') return true;
    return story.status === filter;
  });

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
        <h1 className="text-3xl font-bold text-white">All Stories</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">{filteredStories.length} stories</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
          >
            <option value="all">All Stories</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Story
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Circle
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Started By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Contributions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Words
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredStories.map((story) => (
              <tr key={story.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/stories/${story.id}`}
                    className="font-medium text-white hover:text-yellow-400"
                  >
                    {story.title}
                  </Link>
                  {story.prompt && (
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {story.prompt}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/circles/${story.circle.id}`}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    {story.circle.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-400">{story.starter.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      story.status === 'active'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {story.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{story.contributions_count}</td>
                <td className="px-6 py-4 text-gray-400">{story.word_count.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(story.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStories.length === 0 && (
          <div className="text-center py-12 text-gray-500">No stories found</div>
        )}
      </div>
    </div>
  );
}
