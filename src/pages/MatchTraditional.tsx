import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeams, usePlayers } from '../hooks/useFirestore';
import { ScoringInterface } from '../components/scoring/ScoringInterface';
import type { Frame, Team, Player } from '../types';

export function MatchTraditional() {
  const { userData } = useAuth();
  const { data: teams } = useTeams(userData?.programId);
  const { data: allPlayers } = usePlayers(userData?.programId);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [matchComplete, setMatchComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (selectedTeamId) {
      const team = teams.find((t: Team) => t.id === selectedTeamId);
      if (team) {
        setSelectedTeam(team);
        const players = allPlayers.filter((p: Player) =>
          team.playerIds.includes(p.id)
        );
        setTeamPlayers(players);
      }
    }
  }, [selectedTeamId, teams, allPlayers]);

  const handleGameComplete = (_frames: Frame[], score: number) => {
    const currentPlayer = teamPlayers[currentPlayerIndex];
    setPlayerScores((prev) => ({
      ...prev,
      [currentPlayer.id]: score,
    }));

    // Move to next player or finish match
    if (currentPlayerIndex < teamPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setGameStarted(false);
    } else {
      setMatchComplete(true);
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const resetMatch = () => {
    setCurrentPlayerIndex(0);
    setPlayerScores({});
    setMatchComplete(false);
    setGameStarted(false);
  };

  const totalTeamScore = Object.values(playerScores).reduce(
    (sum, score) => sum + score,
    0
  );

  if (!selectedTeamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dashboard"
              className="text-white hover:text-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white text-center flex-1">
              Traditional Match
            </h1>
            <div className="w-32"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Select Team</h2>

            {teams.length === 0 ? (
              <div className="text-center text-gray-300 py-8">
                <p className="mb-4">No teams available.</p>
                <p className="text-sm">
                  Ask your coach to create a team or create one yourself if you're a coach.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team: Team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {team.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          {team.playerIds.length} player
                          {team.playerIds.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-purple-300">Select →</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (matchComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Match Complete!
          </h1>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {selectedTeam?.name}
              </h2>
              <div className="text-5xl font-bold text-white mt-4">
                {totalTeamScore}
              </div>
              <div className="text-gray-300 mt-2">Total Team Score</div>
            </div>

            <div className="space-y-3 mb-8">
              {teamPlayers.map((player: Player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <span className="text-white font-medium">{player.name}</span>
                  <span className="text-2xl font-bold text-white">
                    {playerScores[player.id] || 0}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetMatch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                New Match
              </button>
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20 text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = teamPlayers[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="text-white hover:text-gray-200 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            Traditional Match - {selectedTeam?.name}
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Team Progress */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Team Progress</h2>
          <div className="grid grid-cols-5 gap-4">
            {teamPlayers.map((player: Player, idx: number) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg text-center ${
                  idx === currentPlayerIndex
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : idx < currentPlayerIndex
                    ? 'bg-green-600/30'
                    : 'bg-white/5'
                }`}
              >
                <div className="text-sm text-white mb-1">{player.name}</div>
                <div className="text-2xl font-bold text-white">
                  {playerScores[player.id] || '-'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-white">
            Total Score: {totalTeamScore}
          </div>
        </div>

        {/* Current Player Game */}
        {!gameStarted ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {currentPlayer.name}'s Turn
            </h2>
            <p className="text-gray-300 mb-6">
              Player {currentPlayerIndex + 1} of {teamPlayers.length}
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Start Game
            </button>
          </div>
        ) : (
          <ScoringInterface
            gameId={`traditional-${selectedTeamId}-${currentPlayer.id}-${Date.now()}`}
            playerId={currentPlayer.id}
            mode="match-traditional"
            onGameComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  );
}
