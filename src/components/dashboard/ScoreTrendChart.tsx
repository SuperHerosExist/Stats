import { useMemo } from 'react';

interface GameScore {
  date: Date;
  score: number;
  gameId: string;
}

interface ScoreTrendChartProps {
  games: GameScore[];
  limit?: number;
}

export function ScoreTrendChart({ games, limit = 30 }: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    // Take the most recent games up to the limit
    const recentGames = games.slice(0, limit).reverse();

    if (recentGames.length === 0) return { points: [], maxScore: 300, minScore: 0 };

    const scores = recentGames.map(g => g.score);
    const maxScore = Math.max(...scores, 100);
    const minScore = Math.min(...scores, 0);

    // Calculate points for SVG path (viewBox is 400x200)
    const width = 380; // Leave padding
    const height = 180; // Leave padding
    const stepX = width / Math.max(recentGames.length - 1, 1);

    const points = recentGames.map((game, index) => {
      const x = 10 + index * stepX;
      const normalizedScore = (game.score - minScore) / (maxScore - minScore || 1);
      const y = 190 - normalizedScore * height; // Flip Y axis
      return { x, y, score: game.score, date: game.date, gameId: game.gameId };
    });

    return { points, maxScore, minScore };
  }, [games, limit]);

  if (chartData.points.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No games recorded yet
      </div>
    );
  }

  // Create SVG path string
  const pathD = chartData.points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
        <span>{chartData.maxScore}</span>
        <span>{Math.round((chartData.maxScore + chartData.minScore) / 2)}</span>
        <span>{chartData.minScore}</span>
      </div>

      {/* Chart */}
      <div className="ml-8">
        <svg viewBox="0 0 400 200" className="w-full h-64">
          {/* Grid lines */}
          <line x1="10" y1="10" x2="390" y2="10" stroke="currentColor" strokeOpacity="0.1" />
          <line x1="10" y1="100" x2="390" y2="100" stroke="currentColor" strokeOpacity="0.1" />
          <line x1="10" y1="190" x2="390" y2="190" stroke="currentColor" strokeOpacity="0.1" />

          {/* Score line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgb(147, 197, 253)" // blue-300
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <g key={point.gameId}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(59, 130, 246)" // blue-500
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* Show score on hover - last point always visible */}
              {index === chartData.points.length - 1 && (
                <g>
                  <rect
                    x={point.x - 25}
                    y={point.y - 35}
                    width="50"
                    height="24"
                    rx="6"
                    fill="rgb(59, 130, 246)"
                    opacity="0.9"
                  />
                  <text
                    x={point.x}
                    y={point.y - 18}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {point.score}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* X-axis label */}
        <div className="text-xs text-gray-400 text-center mt-2">
          Last {limit} games
        </div>
      </div>
    </div>
  );
}
