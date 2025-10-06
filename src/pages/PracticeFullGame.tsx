import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScoringInterface } from '../components/scoring/ScoringInterface';
import type { Frame } from '../types';

export function PracticeFullGame() {
  const { userData } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const handleGameComplete = (frames: Frame[], score: number) => {
    console.log('Practice game complete!', { frames, score });
    setTotalScore(score);
    setIsComplete(true);
  };

  const startNewGame = () => {
    setIsComplete(false);
    setTotalScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            Practice - Full Game
          </h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {!isComplete ? (
          <ScoringInterface
            gameId={`practice-full-${Date.now()}`}
            playerId={userData?.uid || 'guest'}
            mode="practice-full"
            onGameComplete={handleGameComplete}
          />
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <h2 className="text-3xl font-bold text-green-300 mb-4">
              Practice Complete!
            </h2>
            <p className="text-6xl font-bold text-white mb-8">{totalScore}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Practice Again
              </button>
              <Link
                to="/stats"
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                View Stats
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
