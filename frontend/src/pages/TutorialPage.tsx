import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tutorialSteps = [
  {
    title: 'Welcome to CoWrite!',
    description: 'CoWrite is a collaborative storytelling platform where you and your friends take turns writing parts of a story.',
    icon: '👋',
  },
  {
    title: 'Create a Circle',
    description: 'Start by creating a "Circle" - a private group for you and your writing partners. You can invite friends via email.',
    icon: '🔮',
  },
  {
    title: 'Start a Story',
    description: 'Anyone in the circle can start a new story. Write a prompt or the first paragraph to kick things off.',
    icon: '📝',
  },
  {
    title: 'Take Turns Writing',
    description: 'Members take turns adding to the story. You can see who wrote each part and how many words they contributed.',
    icon: '✍️',
  },
  {
    title: 'Watch Your Story Grow',
    description: 'As each person adds their part, the story evolves in unexpected and delightful ways. That\'s the magic of collaborative writing!',
    icon: '🌱',
  },
];

export function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/create-circle');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg p-8 text-center">
        <div className="flex justify-center gap-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentStep ? 'bg-yellow-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="text-6xl mb-6">{step.icon}</div>

        <h1 className="text-2xl font-bold text-white mb-4">{step.title}</h1>
        <p className="text-gray-400 mb-8 text-lg">{step.description}</p>

        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Create Your First Circle'}
          </button>
        </div>
      </div>
    </div>
  );
}
