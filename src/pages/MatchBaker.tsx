import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeams, usePlayers } from '../hooks/useFirestore';
import { ScoringInterface } from '../components/scoring/ScoringInterface';
import type { Frame, Team, Player } from '../types';

export function MatchBaker() {
  const { userData } = useAuth();
  const { data: teams } = useTeams(userData?.programId);
  const { data: allPlayers } = usePlayers(userData?.programId);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (selectedTeamId) {
      const team = teams.find((t: Team) => t.id === selectedTeamId);
      if (team) {
        setSelectedTeam(team);
        const players = allPlayers.filter((p: Player) =>
          team.playerIds.includes(p.id)
        );
        setTeamPlayers(players.slice(0, 5)); // Baker uses exactly 5 players
      }
    }
  }, [selectedTeamId, teams, allPlayers]);

  const handleGameComplete = (_frames: Frame[], score: number) => {
    setTotalScore(score);
    setIsComplete(true);
  };

  const resetMatch = () => {
    setGameStarted(false);
    setTotalScore(0);
    setIsComplete(false);
  };

  // Baker rotation: each player bowls specific frames
  // Player 1: Frames 1, 6
  // Player 2: Frames 2, 7
  // Player 3: Frames 3, 8
  // Player 4: Frames 4, 9
  // Player 5: Frames 5, 10
  const getBakerRotation = () => {
    const rotation: { frame: number; player: Player }[] = [];
    for (let frame = 1; frame <= 10; frame++) {
      const playerIndex = (frame - 1) % 5;
      if (teamPlayers[playerIndex]) {
        rotation.push({ frame, player: teamPlayers[playerIndex] });
      }
    }
    return rotation;
  };

  const bakerRotation = getBakerRotation();

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
              Baker Match
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
                {teams.map((team: Team) => {
                  const teamPlayerCount = allPlayers.filter((p: Player) =>
                    team.playerIds.includes(p.id)
                  ).length;
                  const hasEnoughPlayers = teamPlayerCount >= 5;

                  return (
                    <button
                      key={team.id}
                      onClick={() => hasEnoughPlayers && setSelectedTeamId(team.id)}
                      disabled={!hasEnoughPlayers}
                      className={`w-full text-left p-4 rounded-lg transition-all border border-white/10 ${
                        hasEnoughPlayers
                          ? 'bg-white/5 hover:bg-white/10 cursor-pointer'
                          : 'bg-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-semibold text-white">
                            {team.name}
                          </div>
                          <div
                            className={`text-sm ${
                              hasEnoughPlayers ? 'text-gray-300' : 'text-red-300'
                            }`}
                          >
                            {teamPlayerCount} player{teamPlayerCount !== 1 ? 's' : ''}
                            {!hasEnoughPlayers && ' (need 5 for Baker)'}
                          </div>
                        </div>
                        {hasEnoughPlayers && (
                          <div className="text-purple-300">Select →</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Baker Match Complete!
          </h1>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {selectedTeam?.name}
              </h2>
              <div className="text-6xl font-bold text-white mt-4">{totalScore}</div>
              <div className="text-gray-300 mt-2">Team Score</div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Baker Rotation
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {bakerRotation.map((item) => (
                  <div
                    key={item.frame}
                    className="flex justify-between items-center text-gray-200 text-sm"
                  >
                    <span>Frame {item.frame}:</span>
                    <span className="font-medium">{item.player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetMatch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                New Baker Match
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
            Baker Match - {selectedTeam?.name}
          </h1>
          <div className="w-32"></div>
        </div>

        {!gameStarted ? (
          <>
            {/* Baker Rotation Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Baker Format - Rotation
              </h2>
              <p className="text-gray-300 mb-4">
                In Baker format, players alternate frames. Each player bowls 2 frames.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {bakerRotation.map((item) => (
                  <div
                    key={item.frame}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 text-center"
                  >
                    <div className="text-sm text-gray-300">Frame {item.frame}</div>
                    <div className="text-white font-medium mt-1">
                      {item.player.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-gray-300 mb-6">
                Your team will bowl together, alternating frames
              </p>
              <button
                onClick={() => setGameStarted(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Baker Match
              </button>
            </div>
          </>
        ) : (
          <ScoringInterface
            gameId={`baker-${selectedTeamId}-${Date.now()}`}
            playerId={selectedTeam?.id || ''}
            mode="match-baker"
            onGameComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  );
}
