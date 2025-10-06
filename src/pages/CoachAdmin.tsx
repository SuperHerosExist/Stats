import { useAuth } from '../contexts/AuthContext';
import { usePlayers } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import type { Player } from '../types';

export function CoachAdmin() {
  const { userData, logout } = useAuth();
  const { data: players, loading, error } = usePlayers(userData?.programId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Coach Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-200">
              {userData?.displayName} ({userData?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-white hover:text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-sm font-medium text-gray-300">Total Players</h3>
            <p className="text-3xl font-bold text-white mt-2">{players.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">🎳</div>
            <h3 className="text-sm font-medium text-gray-300">Total Games</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {players.reduce((sum, p: Player) => sum + (p.gamesPlayed || 0), 0)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-sm font-medium text-gray-300">Team Average</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {players.length > 0
                ? Math.round(
                    players.reduce((sum, p: Player) => sum + (p.averageScore || 0), 0) /
                      players.length
                  )
                : 0}
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">All Players</h2>
          </div>

          {loading && (
            <div className="p-8 text-center text-gray-300">Loading players...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-300">
              Error loading players: {error.message}
            </div>
          )}

          {!loading && !error && players.length === 0 && (
            <div className="p-8 text-center text-gray-300">
              No players found. Players will appear here when they sign up for your program.
            </div>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Games Played
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {players.map((player: Player) => (
                    <tr key={player.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {player.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {player.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {player.gamesPlayed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {player.averageScore ? player.averageScore.toFixed(1) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/coach/notes?playerId=${player.id}`}
                          className="text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          View Notes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
