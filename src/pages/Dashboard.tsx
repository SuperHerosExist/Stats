import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { userData, logout } = useAuth();
  const isCoach = userData?.role === 'coach';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">WHS Bowling</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Practice Modes */}
          <Link
            to="/practice/spares"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="text-xl font-semibold text-white mb-2">Practice - Spares Only</h2>
            <p className="text-gray-300">Work on specific spare drills and conversions</p>
          </Link>

          <Link
            to="/practice/full"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">🎳</div>
            <h2 className="text-xl font-semibold text-white mb-2">Practice - Full Game</h2>
            <p className="text-gray-300">Bowl a complete 10-frame game</p>
          </Link>

          {/* Match Modes */}
          <Link
            to="/match/traditional"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">👥</div>
            <h2 className="text-xl font-semibold text-white mb-2">Match - Traditional</h2>
            <p className="text-gray-300">5-person team, each bowls full games</p>
          </Link>

          <Link
            to="/match/baker"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">🔄</div>
            <h2 className="text-xl font-semibold text-white mb-2">Match - Baker</h2>
            <p className="text-gray-300">5 players alternate frames</p>
          </Link>

          {/* League Mode */}
          <Link
            to="/league"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h2 className="text-xl font-semibold text-white mb-2">League</h2>
            <p className="text-gray-300">3-game series for league play</p>
          </Link>

          {/* Stats */}
          <Link
            to="/stats"
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="text-3xl mb-3">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">My Stats</h2>
            <p className="text-gray-300">View your performance and analytics</p>
          </Link>

          {/* Coach Only */}
          {isCoach && (
            <>
              <Link
                to="/coach/admin"
                className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
              >
                <div className="text-3xl mb-3">👨‍🏫</div>
                <h2 className="text-xl font-semibold text-white mb-2">Coach Admin</h2>
                <p className="text-gray-200">Manage players, stats, and team settings</p>
              </Link>

              <Link
                to="/coach/roster"
                className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
              >
                <div className="text-3xl mb-3">📋</div>
                <h2 className="text-xl font-semibold text-white mb-2">Manage Roster</h2>
                <p className="text-gray-200">Add/remove players and create teams</p>
              </Link>

              <Link
                to="/coach/notes"
                className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
              >
                <div className="text-3xl mb-3">📝</div>
                <h2 className="text-xl font-semibold text-white mb-2">Coach Notes</h2>
                <p className="text-gray-200">View and manage player notes</p>
              </Link>

              <Link
                to="/coach/team-stats"
                className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
              >
                <div className="text-3xl mb-3">📈</div>
                <h2 className="text-xl font-semibold text-white mb-2">Team Stats</h2>
                <p className="text-gray-200">View team analytics and comparisons</p>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
