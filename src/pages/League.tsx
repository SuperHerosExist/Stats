import { useState } from 'react';
import { ScoringInterface } from '../components/scoring/ScoringInterface';
import type { Frame } from '../types';

export function League() {
  const [currentGame, setCurrentGame] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const handleGameComplete = (frames: Frame[], score: number) => {
    console.log('Game complete!', { frames, score });
    setTotalScore(score);
    setIsComplete(true);

    // Could add logic here to advance to next game or save to Firestore
  };

  const startNewGame = () => {
    setCurrentGame(currentGame + 1);
    setIsComplete(false);
    setTotalScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          League Mode - Game {currentGame}
        </h1>

        {!isComplete ? (
          <ScoringInterface
            gameId={`league-game-${currentGame}`}
            playerId="current-user-id"
            mode="league"
            onGameComplete={handleGameComplete}
          />
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Game Complete!
            </h2>
            <p className="text-6xl font-bold text-gray-800 mb-8">
              {totalScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Game {currentGame + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
