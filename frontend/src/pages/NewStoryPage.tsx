import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storyApi } from '../services/api';

const storyPrompts = [
  'One day I woke up and realized all the hair on my bald head had grown back. ',
  'She found the key under the welcome mat, but the door was already open.',
  "Roland was a shy middle-shool kid who loved tinkering with his dad's humanoid.",
  "It was cold backstage on the first evening I slipped on my sparkly wrestling unitard.",
  'We lost the internet for 4 days, and everything changed.',
];

export function NewStoryPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [usePrompt, setUsePrompt] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleId) return;

    setError('');
    setIsLoading(true);

    const prompt = usePrompt ? selectedPrompt : undefined;
    const initialContent = usePrompt ? selectedPrompt : customContent;

    if (!initialContent.trim()) {
      setError('Please select a prompt or write the beginning of your story');
      setIsLoading(false);
      return;
    }

    try {
      const res = await storyApi.create(Number(circleId), {
        title,
        prompt,
        initialContent,
      });
      navigate(`/stories/${res.data.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story';
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
        <Link
          to={`/circles/${circleId}`}
          className="text-yellow-500 hover:text-yellow-400 mb-6 inline-block"
        >
          ← Back to circle
        </Link>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Start a New Story</h1>
          <p className="text-gray-400 mb-8">
            Choose a prompt or write your own opening to begin your collaborative story.
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Story title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                placeholder="The Mysterious Letter"
                required
              />
            </div>

            <div>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUsePrompt(true)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    usePrompt
                      ? 'bg-yellow-900/50 text-yellow-400 border-2 border-yellow-500'
                      : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                  }`}
                >
                  Use a Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setUsePrompt(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    !usePrompt
                      ? 'bg-yellow-900/50 text-yellow-400 border-2 border-yellow-500'
                      : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                  }`}
                >
                  Write My Own
                </button>
              </div>

              {usePrompt ? (
                <div className="space-y-3">
                  {storyPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedPrompt(prompt)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedPrompt === prompt
                          ? 'border-yellow-500 bg-yellow-900/30'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <p className="text-gray-300 italic">"{prompt}"</p>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Write the opening of your story..."
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Start Story'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
