import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi, contributionApi } from '../../services/api';
import type { AdminStoryDetail } from '../../types';

interface EditingContribution {
  id: number;
  content: string;
  user_id: number;
  written_at: string;
}

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

  // Edit/Delete contribution state
  const [editingContribution, setEditingContribution] = useState<EditingContribution | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingContributionId, setDeletingContributionId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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

  const handleEditContribution = (contribution: AdminStoryDetail['contributions'][0]) => {
    setEditingContribution({
      id: contribution.id,
      content: contribution.content,
      user_id: contribution.user.id,
      written_at: '',
    });
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContribution || !story) return;

    setIsEditSubmitting(true);
    setEditError('');

    try {
      await adminApi.updateContribution(editingContribution.id, {
        content: editingContribution.content,
        user_id: editingContribution.user_id,
        written_at: editingContribution.written_at || undefined,
      });

      // Refresh story data
      const res = await adminApi.getStory(story.id);
      setStory(res.data);
      setEditingContribution(null);
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Failed to update contribution');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteContribution = async (contributionId: number) => {
    if (!story) return;

    setDeletingContributionId(contributionId);

    try {
      await adminApi.deleteContribution(contributionId);

      // Refresh story data
      const res = await adminApi.getStory(story.id);
      setStory(res.data);
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete contribution');
    } finally {
      setDeletingContributionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Story not found'}</p>
        <Link to="/admin/stories" className="text-yellow-500 hover:text-yellow-400">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/stories" className="text-yellow-500 hover:text-yellow-400 text-sm">
          &larr; Back to Stories
        </Link>
      </div>

      {/* Story Info */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{story.title}</h1>
            {story.prompt && (
              <p className="text-gray-400 mt-2 italic">"{story.prompt}"</p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded ${
              story.status === 'active'
                ? 'bg-yellow-900/50 text-yellow-400'
                : 'bg-gray-700 text-gray-400'
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
              className="font-medium text-yellow-500 hover:text-yellow-400"
            >
              {story.circle.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-500">Started by</p>
            <p className="font-medium text-white">{story.starter.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Stats</p>
            <p className="text-white">
              {story.contributions_count} contributions &middot; {story.word_count.toLocaleString()} words
            </p>
          </div>
        </div>
      </div>

      {/* Write Contribution as User */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Write Contribution as User
        </h2>

        <form onSubmit={handleSubmitContribution} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Write as User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom Date/Time (optional)
              </label>
              <input
                type="datetime-local"
                value={writtenAt}
                onChange={(e) => setWrittenAt(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use current time
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
              placeholder="Write the contribution content..."
              required
            />
          </div>

          {submitError && (
            <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedUserId || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Contribution'}
          </button>
        </form>
      </div>

      {/* Contributions */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
        <h2 className="text-xl font-bold text-white mb-6">
          Contributions ({story.contributions.length})
        </h2>

        <div className="space-y-6">
          {story.contributions.map((contribution, index) => (
            <div
              key={contribution.id}
              className={`p-4 rounded-lg ${
                contribution.impersonation ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center text-white text-sm font-medium">
                    {contribution.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-white">
                      {contribution.user.name}
                    </span>
                    {contribution.impersonation && (
                      <span className="ml-2 text-xs text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded">
                        Written by {contribution.impersonation.written_by.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditContribution(contribution)}
                      className="px-2 py-1 text-xs bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(contribution.id)}
                      disabled={deletingContributionId === contribution.id}
                      className="px-2 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 disabled:opacity-50"
                    >
                      {deletingContributionId === contribution.id ? 'Deleting...' : 'Delete'}
                    </button>
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
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{contribution.content}</p>
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

      {/* Edit Contribution Modal */}
      {editingContribution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Contribution</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Attributed to User
                  </label>
                  <select
                    value={editingContribution.user_id}
                    onChange={(e) => setEditingContribution({
                      ...editingContribution,
                      user_id: parseInt(e.target.value)
                    })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  >
                    {story.circle.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New Timestamp (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingContribution.written_at}
                    onChange={(e) => setEditingContribution({
                      ...editingContribution,
                      written_at: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current timestamp
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={editingContribution.content}
                  onChange={(e) => setEditingContribution({
                    ...editingContribution,
                    content: e.target.value
                  })}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              {editError && (
                <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingContribution(null)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Contribution</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this contribution? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingContributionId !== null}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContribution(showDeleteConfirm)}
                disabled={deletingContributionId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingContributionId !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
