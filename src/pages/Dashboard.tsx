import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useDashboardData, fetchPlayerStats } from '../hooks/useDashboardData';
import { useAvailablePlayers } from '../hooks/useAvailablePlayers';
import { StatCard } from '../components/dashboard/StatCard';
import { ScoreTrendChart } from '../components/dashboard/ScoreTrendChart';
import { GamesList } from '../components/dashboard/GamesList';
import { PlayerComparison } from '../components/dashboard/PlayerComparison';

type GameLimit = 30 | 60 | 90 | 'all';

export function Dashboard() {
  const { userData, logout } = useAuth();
  const isCoach = userData?.role === 'coach';
  const [gameLimit, setGameLimit] = useState<GameLimit>(30);

  // Fetch dashboard data
  const { stats, games, loading, error } = useDashboardData(
    userData?.uid,
    gameLimit === 'all' ? 1000 : gameLimit
  );

  // Fetch available players for comparison
  const { players: availablePlayers } = useAvailablePlayers(
    userData?.programId,
    userData?.uid
  );

  const handleComparePlayer = async (playerId: string) => {
    return await fetchPlayerStats(playerId, gameLimit === 'all' ? 1000 : gameLimit);
  };

  const GameLimitButton = ({ value, label }: { value: GameLimit; label: string }) => (
    <button
      onClick={() => setGameLimit(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        gameLimit === value
          ? 'bg-blue-500 text-white'
          : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">WHS Bowling</h1>
            <p className="text-sm text-gray-200">{userData?.displayName}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full">
              {userData?.role}
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
        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Stats</h2>
            <div className="flex gap-2">
              <GameLimitButton value={30} label="Last 30" />
              <GameLimitButton value={60} label="Last 60" />
              <GameLimitButton value={90} label="Last 90" />
              <GameLimitButton value="all" label="All Time" />
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-300">
              Loading your stats...
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Average" value={stats.averageScore.toFixed(1)} color="blue" />
                <StatCard label="High Score" value={stats.highGame} color="green" />
                <StatCard
                  label="1st Ball Avg"
                  value={stats.firstBallAverage.toFixed(2)}
                  color="purple"
                />
                <StatCard
                  label="Clean %"
                  value={`${(100 - stats.openFramesPercentage).toFixed(1)}%`}
                  color="indigo"
                />
              </div>

              {/* Score Trend Chart */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Score</h3>
                  <span className="text-sm text-gray-300">
                    Last {gameLimit === 'all' ? games.length : gameLimit} games
                  </span>
                </div>
                <ScoreTrendChart
                  games={games.map((g) => ({ ...g, gameId: g.id }))}
                  limit={gameLimit === 'all' ? games.length : gameLimit}
                />
              </div>

              {/* Comparison and Games Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Player Comparison */}
                {availablePlayers.length > 0 && (
                  <PlayerComparison
                    currentPlayerStats={stats}
                    availablePlayers={availablePlayers}
                    onComparePlayer={handleComparePlayer}
                  />
                )}

                {/* Recent Games List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Recent Games</h3>
                    <Link
                      to="/stats"
                      className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      View all →
                    </Link>
                  </div>
                  <GamesList games={games} limit={10} />
                </div>
              </div>
            </>
          )}

          {!loading && !error && games.length === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <div className="text-4xl mb-4">🎳</div>
              <h3 className="text-xl font-semibold text-white mb-2">No games yet</h3>
              <p className="text-gray-300 mb-6">Start bowling to see your stats and progress!</p>
              <Link
                to="/league"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start a League Game
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Practice Modes */}
            <Link
              to="/practice/spares"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Practice - Spares Only</h3>
              <p className="text-gray-300">Work on specific spare drills and conversions</p>
            </Link>

            <Link
              to="/practice/full"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">🎳</div>
              <h3 className="text-xl font-semibold text-white mb-2">Practice - Full Game</h3>
              <p className="text-gray-300">Bowl a complete 10-frame game</p>
            </Link>

            {/* Match Modes */}
            <Link
              to="/match/traditional"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Match - Traditional</h3>
              <p className="text-gray-300">5-person team, each bowls full games</p>
            </Link>

            <Link
              to="/match/baker"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Match - Baker</h3>
              <p className="text-gray-300">5 players alternate frames</p>
            </Link>

            {/* League Mode */}
            <Link
              to="/league"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-2">League</h3>
              <p className="text-gray-300">3-game series for league play</p>
            </Link>

            {/* Stats */}
            <Link
              to="/stats"
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:bg-white/20 hover:shadow-2xl transition-all border border-white/20"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Stats</h3>
              <p className="text-gray-300">View detailed performance and analytics</p>
            </Link>

            {/* Coach Only */}
            {isCoach && (
              <>
                <Link
                  to="/coach/admin"
                  className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
                >
                  <div className="text-3xl mb-3">👨‍🏫</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Coach Admin</h3>
                  <p className="text-gray-200">Manage players, stats, and team settings</p>
                </Link>

                <Link
                  to="/coach/roster"
                  className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
                >
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Manage Roster</h3>
                  <p className="text-gray-200">Add/remove players and create teams</p>
                </Link>

                <Link
                  to="/coach/notes"
                  className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
                >
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Coach Notes</h3>
                  <p className="text-gray-200">View and manage player notes</p>
                </Link>

                <Link
                  to="/coach/team-stats"
                  className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 hover:shadow-2xl transition-all border-2 border-indigo-300/50"
                >
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Team Stats</h3>
                  <p className="text-gray-200">View team analytics and comparisons</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
