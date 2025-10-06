interface ScoringControlsProps {
  onStrike: () => void;
  onSpare: () => void;
  onMiss: () => void;
  onUndo: () => void;
  onSubmit: () => void;
  canUndo: boolean;
  canSubmit: boolean;
  disabled?: boolean;
}

export function ScoringControls({
  onStrike,
  onSpare,
  onMiss,
  onUndo,
  onSubmit,
  canUndo,
  canSubmit,
  disabled = false,
}: ScoringControlsProps) {
  const buttonClass = (variant: 'primary' | 'secondary' | 'danger' | 'success') => {
    const base = 'px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    };
    return `${base} ${variants[variant]}`;
  };

  return (
    <div className="space-y-4">
      {/* Quick action buttons - all in one row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onStrike}
          disabled={disabled}
          className={buttonClass('success')}
        >
          X Strike
        </button>
        <button
          onClick={onSpare}
          disabled={disabled}
          className={buttonClass('primary')}
        >
          / Spare
        </button>
        <button
          onClick={onMiss}
          disabled={disabled}
          className={buttonClass('secondary')}
        >
          - Miss
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↶ Undo
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || disabled}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Ball
        </button>
      </div>
    </div>
  );
}
