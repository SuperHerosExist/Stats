import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayers, useTeams } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import { collection, addDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, Player } from '../types';

export function RosterManagement() {
  const { userData, logout } = useAuth();
  const { data: players } = usePlayers(userData?.programId);
  const { data: teams } = useTeams(userData?.programId);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.programId || !userData?.uid) return;

    if (selectedPlayers.length > 5) {
      setError('Maximum 5 players per team');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const teamData = {
        name: newTeamName,
        programId: userData.programId,
        coachId: userData.uid,
        playerIds: selectedPlayers,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'teams'), teamData);

      // Reset form
      setNewTeamName('');
      setSelectedPlayers([]);
      setShowCreateTeam(false);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team');
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Roster Management</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teams Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Teams</h2>
              <button
                onClick={() => setShowCreateTeam(!showCreateTeam)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                {showCreateTeam ? 'Cancel' : '+ Create Team'}
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Create Team Form */}
              {showCreateTeam && (
                <form onSubmit={handleCreateTeam} className="bg-white/5 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm"
                      placeholder="e.g., Varsity Team"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Select Players (max 5)
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {players.map((player: Player) => (
                        <label
                          key={player.id}
                          className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/5 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player.id)}
                            onChange={() => togglePlayerSelection(player.id)}
                            className="rounded"
                          />
                          <span>{player.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <div className="text-red-300 text-sm">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading || !newTeamName || selectedPlayers.length === 0}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </form>
              )}

              {/* Teams List */}
              {teams.length === 0 ? (
                <div className="text-center text-gray-300 py-8">
                  No teams created yet. Click "Create Team" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team: Team) => (
                    <div
                      key={team.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <p className="text-sm text-gray-300">
                            {team.playerIds.length} player{team.playerIds.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-300 hover:text-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-1">
                        {team.playerIds.map((playerId) => {
                          const player = players.find((p: Player) => p.id === playerId);
                          return player ? (
                            <div key={playerId} className="text-sm text-gray-300">
                              • {player.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Players Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">All Players</h2>
            </div>

            <div className="p-6">
              {players.length === 0 ? (
                <div className="text-center text-gray-300 py-8">
                  No players in your program yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {players.map((player: Player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div>
                        <div className="text-white font-medium">{player.name}</div>
                        <div className="text-sm text-gray-300">{player.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {player.averageScore ? player.averageScore.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-300">
                          {player.gamesPlayed || 0} games
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
