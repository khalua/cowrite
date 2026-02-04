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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-purple-600">
            CoWrite
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/dashboard" className="text-purple-600 hover:text-purple-800 mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Circle</h1>
          <p className="text-gray-600 mb-8">
            A circle is your private writing group. Invite friends and start creating stories
            together.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Circle name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="The Storytellers"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                placeholder="A group for fantasy short stories..."
              />
            </div>

            <div>
              <label htmlFor="invites" className="block text-sm font-medium text-gray-700 mb-2">
                Invite members (optional)
              </label>
              <textarea
                id="invites"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Enter email addresses, separated by commas or new lines"
              />
              <p className="text-sm text-gray-500 mt-2">
                Invitations will be sent via email. You can also invite members later.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Circle'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
