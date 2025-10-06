import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeams, usePlayers, useGames } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import type { Team, Player, Game } from '../types';

export function TeamStats() {
  const { userData, logout } = useAuth();
  const { data: teams } = useTeams(userData?.programId);
  const { data: players } = usePlayers(userData?.programId);
  const { data: allGames } = useGames();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const selectedTeam = teams.find((t: Team) => t.id === selectedTeamId);
  const teamPlayers = selectedTeam
    ? players.filter((p: Player) => selectedTeam.playerIds.includes(p.id))
    : [];

  // Calculate team statistics
  const teamStats = teamPlayers.reduce(
    (acc, player: Player) => {
      const playerGames = allGames.filter((g: Game) => g.playerId === player.id);
      const totalScore = playerGames.reduce((sum, g: Game) => sum + g.totalScore, 0);
      const highGame = playerGames.reduce(
        (max, g: Game) => Math.max(max, g.totalScore),
        0
      );

      return {
        totalGames: acc.totalGames + playerGames.length,
        totalScore: acc.totalScore + totalScore,
        highGame: Math.max(acc.highGame, highGame),
      };
    },
    { totalGames: 0, totalScore: 0, highGame: 0 }
  );

  const teamAverage =
    teamStats.totalGames > 0 ? teamStats.totalScore / teamStats.totalGames : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Team Stats</h1>
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
        {/* Team Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm"
          >
            <option value="" className="bg-gray-800">
              -- Select a team --
            </option>
            {teams.map((team: Team) => (
              <option key={team.id} value={team.id} className="bg-gray-800">
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTeam ? (
          <>
            {/* Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="text-sm font-medium text-gray-300">Team Members</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {teamPlayers.length}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="text-3xl mb-2">🎳</div>
                <h3 className="text-sm font-medium text-gray-300">Total Games</h3>
                <p className="text-3xl font-bold text-white mt-2">{teamStats.totalGames}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-sm font-medium text-gray-300">Team Average</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {teamAverage.toFixed(1)}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-sm font-medium text-gray-300">Highest Game</h3>
                <p className="text-3xl font-bold text-white mt-2">{teamStats.highGame}</p>
              </div>
            </div>

            {/* Player Stats Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
              <div className="px-6 py-4 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">Player Statistics</h2>
              </div>

              {teamPlayers.length === 0 ? (
                <div className="p-8 text-center text-gray-300">
                  No players on this team yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Player
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Games
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Average
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          High Game
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {teamPlayers.map((player: Player) => {
                        const playerGames = allGames.filter(
                          (g: Game) => g.playerId === player.id
                        );
                        const avg = player.averageScore || 0;
                        const highGame = playerGames.reduce(
                          (max, g: Game) => Math.max(max, g.totalScore),
                          0
                        );

                        return (
                          <tr
                            key={player.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {player.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {player.gamesPlayed || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {avg.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {highGame || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Select a Team to View Stats
            </h2>
            <p className="text-gray-300">
              Choose a team from the dropdown above to see detailed statistics and player
              performance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
