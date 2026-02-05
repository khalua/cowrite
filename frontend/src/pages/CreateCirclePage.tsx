import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { circleApi } from '../services/api';

export function CreateCirclePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await circleApi.create({ name, description });
      const circle = res.data;

      // Send invitations if emails provided
      const emails = inviteEmails
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter((e) => e);

      for (const email of emails) {
        try {
          await circleApi.invite(circle.id, email);
        } catch {
          console.error(`Failed to invite ${email}`);
        }
      }

      navigate(`/circles/${circle.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create circle';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-yellow-500">
            CoWrite
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/dashboard" className="text-yellow-500 hover:text-yellow-400 mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Circle</h1>
          <p className="text-gray-400 mb-8">
            A circle is your private writing group. Invite friends and start creating stories
            together.
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Circle name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                placeholder="The Storytellers"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition resize-none"
                placeholder="A group for fantasy short stories..."
              />
            </div>

            <div>
              <label htmlFor="invites" className="block text-sm font-medium text-gray-300 mb-2">
                Invite members (optional)
              </label>
              <textarea
                id="invites"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Enter email addresses, separated by commas or new lines"
              />
              <p className="text-sm text-gray-500 mt-2">
                Invitations will be sent via email. You can also invite members later.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Circle'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
