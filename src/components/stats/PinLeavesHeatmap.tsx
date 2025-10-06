import type { LeaveStats } from '../../types';

interface PinLeavesHeatmapProps {
  leaves: LeaveStats[];
}

// Pin positions for visualization (same as PinGrid)
const PIN_POSITIONS: Record<number, { x: number; y: number }> = {
  7: { x: 0, y: 0 },
  8: { x: 50, y: 0 },
  9: { x: 100, y: 0 },
  10: { x: 150, y: 0 },
  4: { x: 25, y: 50 },
  5: { x: 75, y: 50 },
  6: { x: 125, y: 50 },
  2: { x: 50, y: 100 },
  3: { x: 100, y: 100 },
  1: { x: 75, y: 150 },
};

export function PinLeavesHeatmap({ leaves }: PinLeavesHeatmapProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No pin leave data available yet
      </div>
    );
  }

  // Calculate frequency for each pin
  const pinFrequency = new Map<number, number>();
  let maxFrequency = 0;

  for (const leave of leaves) {
    for (const pin of leave.pinset) {
      const current = pinFrequency.get(pin) || 0;
      const newValue = current + leave.count;
      pinFrequency.set(pin, newValue);
      maxFrequency = Math.max(maxFrequency, newValue);
    }
  }

  const getHeatColor = (frequency: number): string => {
    if (frequency === 0) return '#e5e7eb'; // gray-200
    const intensity = frequency / maxFrequency;
    if (intensity > 0.75) return '#dc2626'; // red-600
    if (intensity > 0.5) return '#f59e0b'; // amber-500
    if (intensity > 0.25) return '#fbbf24'; // yellow-400
    return '#86efac'; // green-300
  };

  return (
    <div className="space-y-6">
      {/* Heatmap visualization */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Pin Leave Frequency Heatmap</h3>
        <div className="relative w-full max-w-xs mx-auto aspect-square">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="200" height="200" fill="#f9fafb" rx="8" />

            {/* Pins with heat coloring */}
            {Object.entries(PIN_POSITIONS).map(([pinNum, pos]) => {
              const num = parseInt(pinNum);
              const frequency = pinFrequency.get(num) || 0;
              const color = getHeatColor(frequency);

              return (
                <g key={num} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    cx="12.5"
                    cy="12.5"
                    r="12"
                    fill={color}
                    stroke="#374151"
                    strokeWidth="1.5"
                  />
                  <text
                    x="12.5"
                    y="17"
                    textAnchor="middle"
                    fill="#1f2937"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {num}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-300 rounded-full border border-gray-700" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded-full border border-gray-700" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-amber-500 rounded-full border border-gray-700" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded-full border border-gray-700" />
            <span>Very High</span>
          </div>
        </div>
      </div>

      {/* Common leaves table */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Most Common Leaves</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.slice(0, 10).map((leave, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {leave.pinset.join('-')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {leave.count}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.conversionRate >= 70
                          ? 'bg-green-100 text-green-800'
                          : leave.conversionRate >= 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {leave.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
