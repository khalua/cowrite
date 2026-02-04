import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storyApi } from '../services/api';

const storyPrompts = [
  'The letter arrived exactly 50 years late...',
  'She found the key under the welcome mat, but the door was already open.',
  'The last human on Earth sat alone in a room. There was a knock on the door.',
  "When I was born, I was given one year to live. That was 100 years ago.",
  'The time traveler appeared in front of me, handed me a photograph, and whispered...',
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-purple-600">
            CoWrite
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to={`/circles/${circleId}`}
          className="text-purple-600 hover:text-purple-800 mb-6 inline-block"
        >
          ← Back to circle
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a New Story</h1>
          <p className="text-gray-600 mb-8">
            Choose a prompt or write your own opening to begin your collaborative story.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Story title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
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
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-600'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Use a Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setUsePrompt(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    !usePrompt
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-600'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
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
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-gray-800 italic">"{prompt}"</p>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Write the opening of your story..."
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Start Story'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
