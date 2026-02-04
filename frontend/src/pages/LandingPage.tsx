import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">CoWrite</h1>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-purple-200 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-purple-900 rounded-full font-semibold hover:bg-purple-100 transition"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <main className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Write Stories
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
              Together
            </span>
          </h2>
          <p className="text-xl text-purple-200 mb-12 max-w-2xl mx-auto">
            Create collaborative stories with your friends. Take turns adding to the narrative
            and watch your story unfold in unexpected ways.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full font-bold text-lg hover:opacity-90 transition shadow-lg"
            >
              Start Writing
            </Link>
            <Link
              to="/how-it-works"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition"
            >
              How It Works
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <FeatureCard
              icon="🔮"
              title="Create Circles"
              description="Invite friends to join your writing circle and collaborate on stories together."
            />
            <FeatureCard
              icon="✍️"
              title="Take Turns"
              description="Each member adds their part to the story. Watch it grow with every contribution."
            />
            <FeatureCard
              icon="📖"
              title="Read & Share"
              description="See who wrote what and share your completed stories with the world."
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-200">{description}</p>
    </div>
  );
}
