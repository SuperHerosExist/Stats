import { formatDistanceToNow } from 'date-fns';

interface GameListItem {
  id: string;
  date: Date;
  score: number;
  mode: string;
}

interface GamesListProps {
  games: GameListItem[];
  limit?: number;
}

export function GamesList({ games, limit = 10 }: GamesListProps) {
  const displayGames = games.slice(0, limit);

  if (displayGames.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No games recorded yet. Start bowling to see your history!
      </div>
    );
  }

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      'league': 'League',
      'practice-full': 'Practice',
      'practice-spares': 'Spares',
      'match-traditional': 'Match',
      'match-baker': 'Baker',
    };
    return labels[mode] || mode;
  };

  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      'league': 'bg-purple-500/20 text-purple-200',
      'practice-full': 'bg-blue-500/20 text-blue-200',
      'practice-spares': 'bg-green-500/20 text-green-200',
      'match-traditional': 'bg-orange-500/20 text-orange-200',
      'match-baker': 'bg-indigo-500/20 text-indigo-200',
    };
    return colors[mode] || 'bg-gray-500/20 text-gray-200';
  };

  return (
    <div className="space-y-2">
      {displayGames.map((game) => (
        <div
          key={game.id}
          className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors border border-white/10"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl font-bold text-white min-w-[3rem]">
              {game.score}
            </div>
            <div className="flex-1">
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getModeColor(game.mode)}`}>
                {getModeLabel(game.mode)}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {formatDistanceToNow(game.date, { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
