import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGames } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import { calculatePlayerStats } from '../utils/statsCalculator';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Game, Frame } from '../types';

export function PlayerStats() {
  const { userData, logout } = useAuth();
  const { data: allGames, loading: gamesLoading } = useGames();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [framesLoading, setFramesLoading] = useState(false);

  // Filter games for current player
  const playerGames = useMemo(() => {
    if (!userData?.uid) return [];
    return allGames.filter((game: Game) => game.playerId === userData.uid);
  }, [allGames, userData?.uid]);

  // Load frames when games change
  useMemo(async () => {
    if (playerGames.length === 0) {
      setFrames([]);
      return;
    }

    setFramesLoading(true);
    try {
      const gameIds = playerGames.map((g: Game) => g.id);
      const framesQuery = query(
        collection(db, 'frames'),
        where('gameId', 'in', gameIds.slice(0, 10)) // Firestore 'in' limit is 10
      );
      const framesSnapshot = await getDocs(framesQuery);
      const framesData = framesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Frame[];
      setFrames(framesData);
    } catch (err) {
      console.error('Error loading frames:', err);
    } finally {
      setFramesLoading(false);
    }
  }, [playerGames]);

  const stats = useMemo(() => {
    if (!userData?.uid) return null;
    return calculatePlayerStats(playerGames, frames);
  }, [playerGames, frames, userData?.uid]);

  const loading = gamesLoading || framesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">My Stats</h1>
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
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="text-white text-lg">Loading your statistics...</div>
          </div>
        )}

        {!loading && playerGames.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="text-5xl mb-4">🎳</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No Games Played Yet</h2>
            <p className="text-gray-300 mb-6">
              Start bowling to see your statistics and track your progress!
            </p>
            <Link
              to="/league"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Start a Game
            </Link>
          </div>
        )}

        {!loading && stats && playerGames.length > 0 && (
          <div className="space-y-6">
            {/* Glassmorphic wrapper for stats dashboard */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {userData?.displayName}
                </h2>
                <p className="text-gray-300">{stats.totalGames} games played</p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-300 mb-1">Average</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.averageScore.toFixed(1)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-300 mb-1">High Game</div>
                  <div className="text-2xl font-bold text-white">{stats.highGame}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-300 mb-1">Strike %</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.strikePercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-300 mb-1">Spare %</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.sparePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-300">First Ball Average</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.firstBallAverage.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Pocket Hit %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.pocketHitPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Carry Rate</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.carryRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Open Frames %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.openFramesPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Double %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.doublePercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Triple %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.triplePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Spare Stats */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Spare Analysis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-300">Single Pin Spare %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.singlePinSparePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Of all spares made</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Multi Pin Spare %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.multiPinSparePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Of all spares made</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Split Leaves %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.splitLeavesPercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Of all frames</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Split Conversion %</div>
                    <div className="text-xl font-semibold text-white">
                      {stats.splitConversionPercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Splits converted to spares
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Stats */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Errors & Fouls</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-300">Total Gutters</div>
                    <div className="text-xl font-semibold text-red-300">
                      {stats.gutterCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Total Fouls</div>
                    <div className="text-xl font-semibold text-orange-300">
                      {stats.foulCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
