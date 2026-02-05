import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { invitationApi } from '../services/api';

interface InvitationInfo {
  email: string;
  circle_name: string;
  inviter_name: string;
}

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      try {
        const response = await invitationApi.get(token);
        setInvitation(response.data);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          setError(axiosError.response?.data?.error || 'Invalid or expired invitation');
        } else {
          setError('Invalid or expired invitation');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setIsAccepting(true);
    try {
      const response = await invitationApi.accept(token);
      navigate(`/circles/${response.data.id}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setError(axiosError.response?.data?.error || 'Failed to accept invitation');
      } else {
        setError('Failed to accept invitation');
      }
      setIsAccepting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-8">
        <div className="w-16 h-16 bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          You're Invited!
        </h1>
        <p className="text-gray-400 text-center mb-6">
          <span className="font-semibold text-gray-300">{invitation.inviter_name}</span> has invited you to join
        </p>

        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-6 text-center">
          <p className="text-xl font-bold text-yellow-400">{invitation.circle_name}</p>
        </div>

        {isAuthenticated ? (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isAccepting ? 'Joining...' : 'Accept Invitation'}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Create an account or log in to join this circle.
            </p>
            <Link
              to={`/register?invitation=${token}`}
              className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition text-center"
            >
              Create Account
            </Link>
            <Link
              to={`/login?invitation=${token}`}
              className="block w-full py-3 border-2 border-yellow-500 text-yellow-500 font-semibold rounded-lg hover:bg-yellow-500/10 transition text-center"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
