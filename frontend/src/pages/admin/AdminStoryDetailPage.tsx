import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi, contributionApi } from '../../services/api';
import type { AdminStoryDetail } from '../../types';

export function AdminStoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<AdminStoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Contribution form state
  const [content, setContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [writtenAt, setWrittenAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!id) return;

    adminApi
      .getStory(parseInt(id))
      .then((res) => {
        setStory(res.data);
        // Default to first member
        if (res.data.circle.members.length > 0) {
          setSelectedUserId(res.data.circle.members[0].id);
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load story'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !selectedUserId || !content.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await contributionApi.createAsUser(
        story.id,
        content.trim(),
        selectedUserId as number,
        writtenAt || undefined
      );

      // Refresh story data
      const res = await adminApi.getStory(story.id);
      setStory(res.data);

      // Clear form
      setContent('');
      setWrittenAt('');
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to create contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
        <Link to="/admin/stories" className="text-purple-600 hover:underline">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/stories" className="text-purple-600 hover:underline text-sm">
          &larr; Back to Stories
        </Link>
      </div>

      {/* Story Info */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            {story.prompt && (
              <p className="text-gray-600 mt-2 italic">"{story.prompt}"</p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded ${
              story.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {story.status}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Circle</p>
            <Link
              to={`/admin/circles/${story.circle.id}`}
              className="font-medium text-purple-600 hover:underline"
            >
              {story.circle.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-500">Started by</p>
            <p className="font-medium text-gray-900">{story.starter.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Stats</p>
            <p className="text-gray-900">
              {story.contributions_count} contributions &middot; {story.word_count.toLocaleString()} words
            </p>
          </div>
        </div>
      </div>

      {/* Write Contribution as User */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Write Contribution as User
        </h2>

        <form onSubmit={handleSubmitContribution} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Write as User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select a user...</option>
                {story.circle.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Date/Time (optional)
              </label>
              <input
                type="datetime-local"
                value={writtenAt}
                onChange={(e) => setWrittenAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use current time
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              placeholder="Write the contribution content..."
              required
            />
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedUserId || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Contribution'}
          </button>
        </form>
      </div>

      {/* Contributions */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Contributions ({story.contributions.length})
        </h2>

        <div className="space-y-6">
          {story.contributions.map((contribution, index) => (
            <div
              key={contribution.id}
              className={`p-4 rounded-lg ${
                contribution.impersonation ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                    {contribution.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      {contribution.user.name}
                    </span>
                    {contribution.impersonation && (
                      <span className="ml-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                        Written by {contribution.impersonation.written_by.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>#{index + 1}</div>
                  <div>
                    {new Date(
                      contribution.impersonation?.written_at || contribution.created_at
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{contribution.content}</p>
              <div className="mt-2 text-xs text-gray-500">
                {contribution.word_count} words
              </div>
            </div>
          ))}

          {story.contributions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No contributions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
