import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { storyApi, contributionApi } from '../services/api';
import { subscribeToStory, unsubscribe, type ContributionData, type Subscription } from '../services/cable';
import { useAuth } from '../contexts/AuthContext';
import { ContributorCard } from '../components/ContributorCard';
import type { Story } from '../types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTimeForDisplay(isoString: string | undefined): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
}

export function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedUserId, setHighlightedUserId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [newContributionFlash, setNewContributionFlash] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  // Super admin impersonation state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);

  const isSuperAdmin = user?.is_super_admin ?? false;

  // Handle new contribution from WebSocket
  const handleNewContribution = useCallback((contribution: ContributionData) => {
    setStory((prevStory) => {
      if (!prevStory) return null;

      // Check if we already have this contribution (e.g., from our own submission)
      if (prevStory.contributions.some((c) => c.id === contribution.id)) {
        return prevStory;
      }

      // Convert ContributionData to Contribution (add missing User fields with defaults)
      const fullContribution = {
        ...contribution,
        user: {
          ...contribution.user,
          is_super_admin: false,
          created_at: contribution.created_at,
        },
      };

      return {
        ...prevStory,
        contributions: [...prevStory.contributions, fullContribution],
        word_count: prevStory.word_count + contribution.word_count,
        contributions_count: prevStory.contributions_count + 1,
      };
    });

    // Flash effect for new contribution
    setNewContributionFlash(contribution.id);
    setTimeout(() => setNewContributionFlash(null), 2000);

    // Scroll to bottom to show new content
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, []);

  // Fetch story data
  useEffect(() => {
    if (!id) return;

    storyApi
      .get(Number(id))
      .then((res) => setStory(res.data))
      .catch((err) => {
        console.error('Failed to load story:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load story');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // Set up WebSocket subscription
  useEffect(() => {
    if (!story || story.status !== 'active') return;

    setConnectionStatus('connecting');

    subscriptionRef.current = subscribeToStory(story.id, {
      onNewContribution: handleNewContribution,
      onConnected: () => setConnectionStatus('connected'),
      onDisconnected: () => setConnectionStatus('disconnected'),
      onRejected: () => setConnectionStatus('disconnected'),
    });

    return () => {
      unsubscribe(subscriptionRef.current);
      subscriptionRef.current = null;
    };
  }, [story?.id, story?.status, handleNewContribution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      let res;

      if (isSuperAdmin && selectedUserId) {
        // Super admin impersonation
        const writtenAt = useCustomDateTime && customDateTime
          ? new Date(customDateTime).toISOString()
          : undefined;
        res = await contributionApi.createAsUser(story.id, newContent, selectedUserId, writtenAt);
      } else {
        // Normal submission
        res = await contributionApi.create(story.id, newContent);
      }

      // The contribution will come through WebSocket, but we also update locally
      // to provide immediate feedback. The WebSocket handler will dedupe.
      setStory({
        ...story,
        contributions: [...story.contributions, res.data],
        word_count: story.word_count + res.data.word_count,
        contributions_count: story.contributions_count + 1,
      });
      setNewContent('');
    } catch (err) {
      console.error('Failed to add contribution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;

  // Contributor card colors matching the Figma design
  const contributorCardColors = [
    'bg-[#d7ecff]', // blue
    'bg-[#d4fde5]', // green
    'bg-[#fff9bb]', // yellow
    'bg-[#e6d7ff]', // purple
    'bg-[#ffd7ec]', // pink
    'bg-[#ffe4d7]', // orange
  ];

  const getContributorCardColor = (userId: number) => {
    return contributorCardColors[userId % contributorCardColors.length];
  };

  const getContributorColor = (userId: number) => {
    const colors = [
      'bg-[#d7ecff] border-blue-300',
      'bg-[#d4fde5] border-green-300',
      'bg-[#fff9bb] border-yellow-300',
      'bg-[#e6d7ff] border-purple-300',
      'bg-[#ffd7ec] border-pink-300',
      'bg-[#ffe4d7] border-orange-300',
    ];
    return colors[userId % colors.length];
  };

  // Calculate contributor stats (word count and session/contribution count)
  // Must be before early returns to satisfy React hooks rules
  const contributorStats = useMemo(() => {
    if (!story) return new Map<number, { wordCount: number; sessionCount: number }>();
    const stats = new Map<number, { wordCount: number; sessionCount: number }>();
    story.contributions.forEach((c) => {
      const existing = stats.get(c.user_id) || { wordCount: 0, sessionCount: 0 };
      stats.set(c.user_id, {
        wordCount: existing.wordCount + c.word_count,
        sessionCount: existing.sessionCount + 1,
      });
    });
    return stats;
  }, [story]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error loading story' : 'Story not found'}
          </h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <Link to="/dashboard" className="text-purple-600 hover:text-purple-800">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const lastContribution = story.contributions[story.contributions.length - 1];
  const uniqueContributors = Array.from(
    new Map(story.contributions.map((c) => [c.user_id, c.user])).values()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-2xl font-bold text-purple-600">
              CoWrite
            </Link>
            {isSuperAdmin && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                SUPER ADMIN
              </span>
            )}
          </div>
          {story.status === 'active' && (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-500">
                {connectionStatus === 'connected'
                  ? 'Live'
                  : connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to={`/circles/${story.circle_id}`}
          className="text-purple-600 hover:text-purple-800 mb-6 inline-block"
        >
          ← Back to circle
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                story.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {story.status}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-500 mb-6">
            <span>{story.contributions_count} contributions</span>
            <span>{story.word_count} words</span>
          </div>

          {/* Contributors */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-900 mb-1.5">Contributors</p>
            <div className="flex flex-wrap gap-5">
              {uniqueContributors.map((contributor) => {
                const stats = contributorStats.get(contributor.id) || { wordCount: 0, sessionCount: 0 };
                return (
                  <ContributorCard
                    key={contributor.id}
                    name={contributor.name.split(' ')[0]}
                    wordCount={stats.wordCount}
                    sessionCount={stats.sessionCount}
                    colorClass={getContributorCardColor(contributor.id)}
                    onClick={() =>
                      setHighlightedUserId(
                        highlightedUserId === contributor.id ? null : contributor.id
                      )
                    }
                    isHighlighted={highlightedUserId === contributor.id}
                  />
                );
              })}
            </div>
            {highlightedUserId && (
              <p className="text-xs text-gray-500 mt-2">
                Click again to clear highlight, or click another name to switch.
              </p>
            )}
          </div>

          {/* Story content */}
          <div ref={contentRef} className="prose prose-lg max-w-none">
            {story.contributions.map((contribution, index) => (
              <span
                key={contribution.id}
                className={`transition-all duration-500 ${
                  newContributionFlash === contribution.id
                    ? 'bg-yellow-200 rounded px-1 -mx-1'
                    : highlightedUserId === contribution.user_id
                    ? `${getContributorColor(contribution.user_id)} rounded px-1 -mx-1`
                    : highlightedUserId
                    ? 'opacity-40'
                    : ''
                }`}
                title={
                  isSuperAdmin && contribution.impersonated
                    ? `Written by ${contribution.written_by?.name} (impersonating ${contribution.user.name})`
                    : contribution.written_at
                    ? `Written at: ${formatDateTimeForDisplay(contribution.written_at)}`
                    : undefined
                }
              >
                {contribution.content}
                {index < story.contributions.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Last contribution info */}
        {lastContribution && (
          <div className={`${getContributorCardColor(lastContribution.user_id)} rounded-lg p-2.5 mb-6`}>
            <p className="text-sm text-black">
              {lastContribution.user.name.split(' ')[0]} wrote the last part ({lastContribution.word_count} words)
              {lastContribution.written_at && (
                <span className="text-gray-600 ml-2">
                  at {formatDateTimeForDisplay(lastContribution.written_at)}
                </span>
              )}
            </p>
            {isSuperAdmin && lastContribution.impersonated && lastContribution.written_by && (
              <p className="text-red-600 text-sm mt-1">
                Actually written by: {lastContribution.written_by.name.split(' ')[0]}
              </p>
            )}
          </div>
        )}

        {/* Add contribution form */}
        {(story.status === 'active' || isSuperAdmin) && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSuperAdmin ? 'Add to the story (Admin Mode)' : 'Add to the story'}
            </h2>

            {/* Super Admin Impersonation Controls */}
            {isSuperAdmin && story.circle_members && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-red-800 mb-3">Super Admin Controls</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* User selection */}
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Write as user:
                    </label>
                    <select
                      value={selectedUserId ?? ''}
                      onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Myself ({user?.name})</option>
                      {story.circle_members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom datetime */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                      <input
                        type="checkbox"
                        checked={useCustomDateTime}
                        onChange={(e) => {
                          setUseCustomDateTime(e.target.checked);
                          if (e.target.checked && !customDateTime) {
                            setCustomDateTime(formatDateTimeLocal(new Date()));
                          }
                        }}
                        className="rounded border-red-300 text-red-600 focus:ring-red-500"
                      />
                      Custom date/time:
                    </label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      disabled={!useCustomDateTime}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <p className="text-xs text-red-600 mt-1">
                      Uses your browser's local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none mb-4"
                placeholder="Continue the story..."
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{wordCount} words</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newContent.trim()}
                  className={`px-6 py-3 font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 ${
                    isSuperAdmin && selectedUserId
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}
                >
                  {isSubmitting
                    ? 'Adding...'
                    : isSuperAdmin && selectedUserId
                    ? `Add as ${story.circle_members?.find((m) => m.id === selectedUserId)?.name.split(' ')[0]}`
                    : 'Add to Story'}
                </button>
              </div>
            </form>
          </div>
        )}

        {story.status === 'completed' && !isSuperAdmin && (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-gray-600">This story has been completed and is read-only.</p>
          </div>
        )}
      </main>
    </div>
  );
}
