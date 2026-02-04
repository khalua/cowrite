import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import type { AdminUser, AdminStory } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    circles: 0,
    stories: 0,
    activeStories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentStories, setRecentStories] = useState<AdminStory[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, circlesRes, storiesRes] = await Promise.all([
          adminApi.listUsers(),
          adminApi.listCircles(),
          adminApi.listStories(),
        ]);

        setStats({
          users: usersRes.data.length,
          circles: circlesRes.data.length,
          stories: storiesRes.data.length,
          activeStories: storiesRes.data.filter((s) => s.status === 'active').length,
        });

        setRecentUsers(usersRes.data.slice(0, 5));
        setRecentStories(storiesRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
        </Link>

        <Link
          to="/admin/circles"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500 mb-1">Total Circles</p>
          <p className="text-3xl font-bold text-gray-900">{stats.circles}</p>
        </Link>

        <Link
          to="/admin/stories"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500 mb-1">Total Stories</p>
          <p className="text-3xl font-bold text-gray-900">{stats.stories}</p>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Active Stories</p>
          <p className="text-3xl font-bold text-green-600">{stats.activeStories}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <Link
                key={user.id}
                to={`/admin/users/${user.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {user.is_super_admin && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Admin
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Stories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Stories</h2>
            <Link to="/admin/stories" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentStories.map((story) => (
              <Link
                key={story.id}
                to={`/admin/stories/${story.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{story.title}</p>
                    <p className="text-sm text-gray-500">in {story.circle.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      story.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {story.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
