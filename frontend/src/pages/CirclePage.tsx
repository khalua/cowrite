import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { circleApi, storyApi } from '../services/api';
import type { Circle, Story } from '../types';

export function CirclePage() {
  const { id } = useParams<{ id: string }>();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!id) return;

    Promise.all([circleApi.get(Number(id)), storyApi.list(Number(id))])
      .then(([circleRes, storiesRes]) => {
        setCircle(circleRes.data);
        setStories(storiesRes.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle) return;

    setInviteStatus('loading');
    try {
      await circleApi.invite(circle.id, inviteEmail);
      setInviteStatus('success');
      setInviteEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteStatus('idle');
      }, 2000);
    } catch {
      setInviteStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Circle not found</h1>
          <Link to="/dashboard" className="text-yellow-500 hover:text-yellow-400">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-yellow-500">
            CoWrite
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Link to="/dashboard" className="text-yellow-500 hover:text-yellow-400 mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{circle.name}</h1>
              {circle.description && <p className="text-gray-400">{circle.description}</p>}
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition"
            >
              + Invite Member
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {circle.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300">{member.user.name}</span>
                {member.role === 'admin' && (
                  <span className="text-xs text-yellow-500">(admin)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Stories</h2>
          <Link
            to={`/circles/${circle.id}/new-story`}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            + Start New Story
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-white mb-2">No stories yet</h3>
            <p className="text-gray-400 mb-6">Start the first story in this circle!</p>
            <Link
              to={`/circles/${circle.id}/new-story`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Start a Story
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{story.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      story.status === 'active'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {story.status}
                  </span>
                </div>
                {story.prompt && (
                  <p className="text-gray-400 mb-4 line-clamp-2">{story.prompt}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{story.contributions_count} contributions</span>
                  <span>{story.word_count} words</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Invite a member</h2>

            {inviteStatus === 'success' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✉️</div>
                <p className="text-yellow-400 font-semibold">Invitation sent!</p>
              </div>
            ) : (
              <form onSubmit={handleInvite}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition mb-4"
                  placeholder="friend@example.com"
                  required
                />
                {inviteStatus === 'error' && (
                  <p className="text-red-400 text-sm mb-4">Failed to send invitation</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteStatus === 'loading'}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {inviteStatus === 'loading' ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
