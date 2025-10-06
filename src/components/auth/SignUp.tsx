import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

// Available schools/programs
const SCHOOLS = [
  { id: 'willard-hs', name: 'Willard High School' },
  // Add more schools here in the future
];

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [programId, setProgramId] = useState('willard-hs'); // Default to Willard
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password, displayName, role, programId);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else {
        setError('Failed to create account');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded backdrop-blur-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-200">
                Full Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-white/30 bg-white/5 placeholder-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-white/30 bg-white/5 placeholder-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-white/30 bg-white/5 placeholder-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-200">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
              >
                <option value="player" className="bg-gray-800">Player</option>
                <option value="coach" className="bg-gray-800">Coach</option>
              </select>
            </div>
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-200">
                School
              </label>
              <select
                id="school"
                name="school"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent sm:text-sm backdrop-blur-sm"
              >
                {SCHOOLS.map((school) => (
                  <option key={school.id} value={school.id} className="bg-gray-800">
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-purple-300 hover:text-purple-200 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
