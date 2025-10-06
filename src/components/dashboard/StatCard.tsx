interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'indigo';
}

export function StatCard({ label, value, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
    green: 'from-green-500/20 to-green-600/20 border-green-400/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-400/30',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg rounded-xl p-4 border`}
    >
      <div className="text-xs sm:text-sm font-medium text-gray-200 mb-1">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
