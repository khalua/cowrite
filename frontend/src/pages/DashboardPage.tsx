import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { circleApi } from '../services/api';
import type { Circle } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    circleApi
      .list()
      .then((res) => setCircles(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-yellow-500">
            CoWrite
          </Link>
          <div className="flex items-center gap-4">
            {user?.is_super_admin && (
              <Link
                to="/admin"
                className="px-3 py-1 bg-red-900/50 text-red-400 text-sm font-medium rounded hover:bg-red-900/70 transition"
              >
                Admin
              </Link>
            )}
            <span className="text-gray-400">Hi, {user?.name}</span>
            <button
              onClick={() => logout()}
              className="text-gray-400 hover:text-gray-200"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Circles</h1>
          <Link
            to="/create-circle"
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Create Circle
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-white mb-2">No circles yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first circle and invite friends to start writing together.
            </p>
            <Link
              to="/create-circle"
              className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Create Your First Circle
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <Link
                key={circle.id}
                to={`/circles/${circle.id}`}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition"
              >
                <h2 className="text-xl font-bold text-white mb-2">{circle.name}</h2>
                {circle.description && (
                  <p className="text-gray-400 mb-4 line-clamp-2">{circle.description}</p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{circle.members.length} members</span>
                  <span>{circle.stories_count} stories</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
