import { useState } from 'react';
import type { PlayerStats } from '../../types';

interface PlayerComparisonProps {
  currentPlayerStats: PlayerStats;
  availablePlayers: { id: string; name: string; role?: string }[];
  onComparePlayer: (playerId: string) => Promise<PlayerStats | null>;
}

export function PlayerComparison({
  currentPlayerStats,
  availablePlayers,
  onComparePlayer,
}: PlayerComparisonProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [compareStats, setCompareStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (playerId: string) => {
    if (!playerId) {
      setCompareStats(null);
      setSelectedPlayerId('');
      return;
    }

    setLoading(true);
    setSelectedPlayerId(playerId);
    try {
      const stats = await onComparePlayer(playerId);
      setCompareStats(stats);
    } catch (error) {
      console.error('Error fetching comparison stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const ComparisonRow = ({
    label,
    myValue,
    theirValue,
    format = (v: number) => v.toString(),
  }: {
    label: string;
    myValue: number;
    theirValue?: number;
    format?: (value: number) => string;
  }) => {
    const myFormatted = format(myValue);
    const theirFormatted = theirValue !== undefined ? format(theirValue) : '-';
    const better = theirValue !== undefined && myValue > theirValue;
    const worse = theirValue !== undefined && myValue < theirValue;

    return (
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="text-sm text-gray-300">{label}</div>
        <div className="flex gap-6">
          <div className={`font-semibold ${better ? 'text-green-400' : worse ? 'text-red-400' : 'text-white'}`}>
            {myFormatted}
          </div>
          {theirValue !== undefined && (
            <div className="text-gray-400 min-w-[3rem] text-right">
              {theirFormatted}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Compare</h3>

      {/* Player selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Compare with
        </label>
        <select
          value={selectedPlayerId}
          onChange={(e) => handleCompare(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">Select a player...</option>
          {availablePlayers.map((player) => (
            <option key={player.id} value={player.id} className="bg-gray-900">
              {player.name} {player.role === 'coach' ? '(Coach)' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          Loading comparison...
        </div>
      )}

      {compareStats && !loading && (
        <div className="space-y-1">
          <div className="flex justify-between mb-4 text-xs text-gray-400">
            <span>Stat</span>
            <div className="flex gap-6">
              <span>You</span>
              <span className="min-w-[3rem] text-right">
                {availablePlayers.find(p => p.id === selectedPlayerId)?.name}
              </span>
            </div>
          </div>

          <ComparisonRow
            label="Average"
            myValue={currentPlayerStats.averageScore}
            theirValue={compareStats.averageScore}
            format={(v) => v.toFixed(1)}
          />
          <ComparisonRow
            label="High Game"
            myValue={currentPlayerStats.highGame}
            theirValue={compareStats.highGame}
          />
          <ComparisonRow
            label="Strike %"
            myValue={currentPlayerStats.strikePercentage}
            theirValue={compareStats.strikePercentage}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <ComparisonRow
            label="Spare %"
            myValue={currentPlayerStats.sparePercentage}
            theirValue={compareStats.sparePercentage}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <ComparisonRow
            label="1st Ball Avg"
            myValue={currentPlayerStats.firstBallAverage}
            theirValue={compareStats.firstBallAverage}
            format={(v) => v.toFixed(2)}
          />
          <ComparisonRow
            label="Clean %"
            myValue={100 - currentPlayerStats.openFramesPercentage}
            theirValue={100 - compareStats.openFramesPercentage}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </div>
      )}

      {!compareStats && !loading && selectedPlayerId && (
        <div className="text-center py-8 text-gray-400">
          No stats available for comparison
        </div>
      )}
    </div>
  );
}
