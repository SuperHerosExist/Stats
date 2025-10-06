import { useState } from 'react';

interface PinGridProps {
  pinsStanding: number[];
  onPinTap: (pinNumber: number) => void;
  disabled?: boolean;
}

export function PinGrid({ pinsStanding, onPinTap, disabled = false }: PinGridProps) {
  const [selectedPins, setSelectedPins] = useState<Set<number>>(new Set());

  const handlePinClick = (pinNumber: number) => {
    if (disabled || !pinsStanding.includes(pinNumber)) return;

    const newSelected = new Set(selectedPins);
    if (newSelected.has(pinNumber)) {
      newSelected.delete(pinNumber);
    } else {
      newSelected.add(pinNumber);
    }
    setSelectedPins(newSelected);
    onPinTap(pinNumber);
  };

  const isPinStanding = (pinNumber: number) => pinsStanding.includes(pinNumber);
  const isPinSelected = (pinNumber: number) => selectedPins.has(pinNumber);

  const getPinButtonClass = (pinNumber: number) => {
    const isStanding = isPinStanding(pinNumber);
    const isSelected = isPinSelected(pinNumber);

    if (!isStanding) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50';
    }
    if (isSelected) {
      return 'bg-yellow-400 text-gray-900 border-4 border-yellow-600 shadow-lg scale-110';
    }
    return 'bg-white text-gray-900 border-2 border-gray-400 hover:bg-blue-50 hover:border-blue-500 hover:scale-105';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Pin Grid - Bowling Triangle Formation */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-6 shadow-inner">
        <div className="space-y-3">
          {/* Row 1 - Pin 7, 8, 9, 10 */}
          <div className="flex justify-center gap-2">
            {[7, 8, 9, 10].map((pin) => (
              <button
                key={pin}
                onClick={() => handlePinClick(pin)}
                disabled={disabled || !isPinStanding(pin)}
                className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${getPinButtonClass(pin)}`}
              >
                {pin}
              </button>
            ))}
          </div>

          {/* Row 2 - Pin 4, 5, 6 */}
          <div className="flex justify-center gap-2 ml-7">
            {[4, 5, 6].map((pin) => (
              <button
                key={pin}
                onClick={() => handlePinClick(pin)}
                disabled={disabled || !isPinStanding(pin)}
                className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${getPinButtonClass(pin)}`}
              >
                {pin}
              </button>
            ))}
          </div>

          {/* Row 3 - Pin 2, 3 */}
          <div className="flex justify-center gap-2 ml-14">
            {[2, 3].map((pin) => (
              <button
                key={pin}
                onClick={() => handlePinClick(pin)}
                disabled={disabled || !isPinStanding(pin)}
                className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${getPinButtonClass(pin)}`}
              >
                {pin}
              </button>
            ))}
          </div>

          {/* Row 4 - Pin 1 (headpin) */}
          <div className="flex justify-center ml-16">
            <button
              onClick={() => handlePinClick(1)}
              disabled={disabled || !isPinStanding(1)}
              className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${getPinButtonClass(1)}`}
            >
              1
            </button>
          </div>
        </div>
      </div>

      {/* Pin status legend */}
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded border-2 border-gray-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 rounded border-4 border-yellow-600" />
          <span>Selected (LEFT)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded opacity-50" />
          <span>Down</span>
        </div>
      </div>
    </div>
  );
}
