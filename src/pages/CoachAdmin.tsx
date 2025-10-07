import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayers, useGames } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calculatePlayerStats } from '../utils/statsCalculator';
import type { Player, Game, Frame } from '../types';

export function CoachAdmin() {
  const { userData, logout } = useAuth();
  const { data: players, loading, error } = usePlayers(userData?.programId);
  const { data: allGames } = useGames();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [framesLoading, setFramesLoading] = useState(false);

  // Get selected player
  const selectedPlayer = players.find((p: Player) => p.id === selectedPlayerId);

  // Filter games for selected player
  const playerGames = useMemo(() => {
    if (!selectedPlayerId) return [];
    return allGames.filter((game: Game) => game.playerId === selectedPlayerId);
  }, [allGames, selectedPlayerId]);

  // Load frames when player is selected
  useEffect(() => {
    if (playerGames.length === 0) {
      setFrames([]);
      return;
    }

    const loadFrames = async () => {
      setFramesLoading(true);
      try {
        const gameIds = playerGames.map((g: Game) => g.id);
        // Split into batches of 10 due to Firestore 'in' query limit
        const frameBatches = [];
        for (let i = 0; i < gameIds.length; i += 10) {
          const batch = gameIds.slice(i, i + 10);
          const framesQuery = query(
            collection(db, 'frames'),
            where('gameId', 'in', batch)
          );
          const framesSnapshot = await getDocs(framesQuery);
          const framesData = framesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Frame[];
          frameBatches.push(...framesData);
        }
        setFrames(frameBatches);
      } catch (err) {
        console.error('Error loading frames:', err);
      } finally {
        setFramesLoading(false);
      }
    };

    loadFrames();
  }, [playerGames]);

  // Calculate player stats
  const playerStats = useMemo(() => {
    if (!selectedPlayerId || playerGames.length === 0) return null;
    return calculatePlayerStats(playerGames, frames);
  }, [selectedPlayerId, playerGames, frames]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              ← Back to Dashboard
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
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/coach/roster"
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl shadow-lg p-4 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all border border-indigo-300/30 flex items-center gap-3"
          >
            <div className="text-2xl">📋</div>
            <div>
              <h3 className="font-semibold text-white">Manage Roster</h3>
              <p className="text-sm text-gray-300">Create teams & manage players</p>
            </div>
          </Link>
          <Link
            to="/coach/team-stats"
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl shadow-lg p-4 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all border border-indigo-300/30 flex items-center gap-3"
          >
            <div className="text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-white">Team Stats</h3>
              <p className="text-sm text-gray-300">View team analytics</p>
            </div>
          </Link>
          <Link
            to="/coach/notes"
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl shadow-lg p-4 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all border border-indigo-300/30 flex items-center gap-3"
          >
            <div className="text-2xl">📝</div>
            <div>
              <h3 className="font-semibold text-white">Coach Notes</h3>
              <p className="text-sm text-gray-300">Manage player notes</p>
            </div>
          </Link>
        </div>

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
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => setSelectedPlayerId(player.id)}
                          className="text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          View Stats
                        </button>
                        <Link
                          to={`/coach/notes?playerId=${player.id}`}
                          className="text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          Notes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Player Stats Modal */}
        {selectedPlayerId && selectedPlayer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/10 backdrop-blur-lg px-6 py-4 border-b border-white/20 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
                  <p className="text-sm text-gray-300">{selectedPlayer.email}</p>
                </div>
                <button
                  onClick={() => setSelectedPlayerId(null)}
                  className="text-white hover:text-gray-300 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {framesLoading && (
                  <div className="text-center py-12 text-gray-300">
                    Loading player statistics...
                  </div>
                )}

                {!framesLoading && playerGames.length === 0 && (
                  <div className="bg-white/10 rounded-xl p-12 text-center">
                    <div className="text-5xl mb-4">🎳</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Games Played Yet</h3>
                    <p className="text-gray-300">
                      This player hasn't bowled any games yet.
                    </p>
                  </div>
                )}

                {!framesLoading && playerStats && playerGames.length > 0 && (
                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Total Games</div>
                          <div className="text-2xl font-bold text-white">
                            {playerStats.totalGames}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Average</div>
                          <div className="text-2xl font-bold text-white">
                            {playerStats.averageScore.toFixed(1)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">High Game</div>
                          <div className="text-2xl font-bold text-white">
                            {playerStats.highGame}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Strike %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.strikePercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Spare %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.sparePercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Open Frames %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.openFramesPercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">1st Ball Avg</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.firstBallAverage.toFixed(1)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Pocket Hit %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.pocketHitPercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Carry Rate</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.carryRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spare Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Spare Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Single Pin Spare %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.singlePinSparePercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Multi Pin Spare %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.multiPinSparePercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Split Leaves %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.splitLeavesPercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-300 mb-1">Split Conversion %</div>
                          <div className="text-xl font-bold text-white">
                            {playerStats.splitConversionPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Games */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Games</h3>
                      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          {playerGames.slice(0, 10).map((game: Game, idx: number) => (
                            <div
                              key={game.id}
                              className="flex justify-between items-center px-4 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
                            >
                              <span className="text-sm text-gray-300">
                                Game {playerGames.length - idx}
                              </span>
                              <span className="text-lg font-semibold text-white">
                                {game.totalScore}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3 pt-4">
                      <Link
                        to={`/coach/notes?playerId=${selectedPlayerId}`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-center font-medium"
                        onClick={() => setSelectedPlayerId(null)}
                      >
                        View Notes
                      </Link>
                      <button
                        onClick={() => setSelectedPlayerId(null)}
                        className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
