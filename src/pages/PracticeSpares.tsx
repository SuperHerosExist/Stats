import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PinGrid } from '../components/scoring/PinGrid';

// Common spare leave patterns for practice
const SPARE_DRILLS = [
  { id: '10-pin', name: '10 Pin', pins: [10], difficulty: 'easy' },
  { id: '7-pin', name: '7 Pin', pins: [7], difficulty: 'easy' },
  { id: '4-pin', name: '4 Pin', pins: [4], difficulty: 'easy' },
  { id: '6-pin', name: '6 Pin', pins: [6], difficulty: 'easy' },
  { id: '3-6-10', name: '3-6-10 Washout', pins: [3, 6, 10], difficulty: 'medium' },
  { id: '2-7', name: '2-7 Bucket', pins: [2, 7], difficulty: 'medium' },
  { id: '3-10', name: '3-10 Split', pins: [3, 10], difficulty: 'hard' },
  { id: '7-10', name: '7-10 Split', pins: [7, 10], difficulty: 'hard' },
  { id: '4-6-7-10', name: 'Big Four', pins: [4, 6, 7, 10], difficulty: 'hard' },
];

export function PracticeSpares() {
  const [selectedDrill, setSelectedDrill] = useState(SPARE_DRILLS[0]);
  const [attempts, setAttempts] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [currentPins, setCurrentPins] = useState<number[]>(SPARE_DRILLS[0].pins);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'miss' | null>(null);

  const handlePinTap = (pinNumber: number) => {
    setCurrentPins(prev => {
      if (prev.includes(pinNumber)) {
        return prev.filter(p => p !== pinNumber);
      }
      return [...prev, pinNumber];
    });
  };

  const handleSubmit = () => {
    const allPinsDown = selectedDrill.pins.every((pin) => !currentPins.includes(pin));
    setAttempts(attempts + 1);

    if (allPinsDown) {
      setConversions(conversions + 1);
      setLastResult('success');
    } else {
      setLastResult('miss');
    }

    setShowResult(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setCurrentPins(selectedDrill.pins);
      setShowResult(false);
      setLastResult(null);
    }, 2000);
  };

  const handleReset = () => {
    setAttempts(0);
    setConversions(0);
    setCurrentPins(selectedDrill.pins);
    setShowResult(false);
    setLastResult(null);
  };

  const handleChangeDrill = (drillId: string) => {
    const drill = SPARE_DRILLS.find((d) => d.id === drillId);
    if (drill) {
      setSelectedDrill(drill);
      setCurrentPins(drill.pins);
      handleReset();
    }
  };

  const conversionRate = attempts > 0 ? ((conversions / attempts) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            Practice - Spares Only
          </h1>
          <div className="w-32"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drill Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select Spare Drill</h2>
            <div className="space-y-2">
              {SPARE_DRILLS.map((drill) => (
                <button
                  key={drill.id}
                  onClick={() => handleChangeDrill(drill.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedDrill.id === drill.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/5 text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{drill.name}</div>
                  <div className="text-sm opacity-75 capitalize">{drill.difficulty}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Practice Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 text-center">
                <div className="text-sm text-gray-300 mb-1">Attempts</div>
                <div className="text-3xl font-bold text-white">{attempts}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 text-center">
                <div className="text-sm text-gray-300 mb-1">Conversions</div>
                <div className="text-3xl font-bold text-green-300">{conversions}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 text-center">
                <div className="text-sm text-gray-300 mb-1">Rate</div>
                <div className="text-3xl font-bold text-blue-300">{conversionRate}%</div>
              </div>
            </div>

            {/* Pin Grid */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedDrill.name}
                </h3>
                <p className="text-gray-300 capitalize">
                  Difficulty: {selectedDrill.difficulty}
                </p>
              </div>

              {showResult && (
                <div
                  className={`mb-4 p-4 rounded-lg text-center text-xl font-bold ${
                    lastResult === 'success'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {lastResult === 'success' ? '✓ Converted!' : '✗ Missed'}
                </div>
              )}

              <div className="flex justify-center mb-6">
                <PinGrid
                  pinsStanding={currentPins}
                  onPinTap={handlePinTap}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={showResult}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Attempt
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  Reset Stats
                </button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-300">
                Click the pins to mark them as knocked down, then submit your attempt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
