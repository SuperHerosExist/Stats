import type { PlayerStats } from '../../types';
import { PinLeavesHeatmap } from './PinLeavesHeatmap';

interface PlayerStatsDashboardProps {
  stats: PlayerStats;
  playerName: string;
}

export function PlayerStatsDashboard({ stats, playerName }: PlayerStatsDashboardProps) {
  const StatCard = ({
    label,
    value,
    subtitle,
  }: {
    label: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{playerName}</h2>
        <p className="text-gray-600">{stats.totalGames} games played</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Average" value={stats.averageScore} />
        <StatCard label="High Game" value={stats.highGame} />
        <StatCard label="Strike %" value={`${stats.strikePercentage}%`} />
        <StatCard label="Spare %" value={`${stats.sparePercentage}%`} />
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">First Ball Average</div>
            <div className="text-xl font-semibold">{stats.firstBallAverage}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Pocket Hit %</div>
            <div className="text-xl font-semibold">{stats.pocketHitPercentage}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Carry Rate</div>
            <div className="text-xl font-semibold">{stats.carryRate}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Open Frames %</div>
            <div className="text-xl font-semibold">{stats.openFramesPercentage}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Double %</div>
            <div className="text-xl font-semibold">{stats.doublePercentage}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Triple %</div>
            <div className="text-xl font-semibold">{stats.triplePercentage}%</div>
          </div>
        </div>
      </div>

      {/* Spare Stats */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Spare Analysis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Single Pin Spare %</div>
            <div className="text-xl font-semibold">{stats.singlePinSparePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Of all spares made</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Multi Pin Spare %</div>
            <div className="text-xl font-semibold">{stats.multiPinSparePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Of all spares made</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Split Leaves %</div>
            <div className="text-xl font-semibold">{stats.splitLeavesPercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Of all frames</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Split Conversion %</div>
            <div className="text-xl font-semibold">{stats.splitConversionPercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Splits converted to spares</div>
          </div>
        </div>
      </div>

      {/* Error Stats */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Errors & Fouls</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Gutters</div>
            <div className="text-xl font-semibold text-red-600">{stats.gutterCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Fouls</div>
            <div className="text-xl font-semibold text-orange-600">{stats.foulCount}</div>
          </div>
        </div>
      </div>

      {/* Pin Leaves Heatmap */}
      <PinLeavesHeatmap leaves={stats.commonLeaves} />
    </div>
  );
}
