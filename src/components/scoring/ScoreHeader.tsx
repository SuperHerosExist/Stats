import type { Frame, FrameSymbol } from '../../types';
import { getFrameSymbols, calculateRunningTotals } from '../../utils/scoringEngine';

interface ScoreHeaderProps {
  frames: Frame[];
  currentFrame: number;
}

export function ScoreHeader({ frames, currentFrame }: ScoreHeaderProps) {
  const runningTotals = calculateRunningTotals(frames);

  const renderFrameSymbols = (frame: Frame, frameNumber: number): React.ReactNode => {
    const symbols = getFrameSymbols(frame, frameNumber);

    if (frameNumber === 10) {
      // 10th frame has up to 3 boxes
      return (
        <div className="flex gap-0.5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-xs sm:text-sm font-semibold"
            >
              {symbols[idx] !== undefined ? renderSymbol(symbols[idx]) : ''}
            </div>
          ))}
        </div>
      );
    }

    // Frames 1-9 have 2 boxes
    return (
      <div className="flex gap-0.5">
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-xs sm:text-sm font-semibold">
          {symbols[0] !== undefined ? renderSymbol(symbols[0]) : ''}
        </div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 text-xs sm:text-sm font-semibold">
          {symbols[1] !== undefined ? renderSymbol(symbols[1]) : ''}
        </div>
      </div>
    );
  };

  const renderSymbol = (symbol: FrameSymbol): string => {
    if (typeof symbol === 'number') return symbol.toString();
    return symbol;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-2 sm:p-4 overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((frameNum) => {
            const frame = frames.find((f) => f.frameNumber === frameNum);
            const isActive = frameNum === currentFrame;
            const runningTotal = frame ? runningTotals[frameNum - 1] : null;

            return (
              <div
                key={frameNum}
                className={`flex-1 border-2 rounded ${
                  isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } min-w-[60px] sm:min-w-[80px]`}
              >
                {/* Frame number */}
                <div className="text-center text-xs font-semibold text-gray-600 border-b border-gray-300 py-0.5">
                  {frameNum}
                </div>

                {/* Frame symbols */}
                <div className="flex justify-center p-1">
                  {frame ? (
                    renderFrameSymbols(frame, frameNum)
                  ) : (
                    <div className="flex gap-0.5">
                      {frameNum === 10 ? (
                        <>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-200" />
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-200" />
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-200" />
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-200" />
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-200" />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Running total */}
                <div className="text-center text-sm sm:text-lg font-bold border-t border-gray-300 py-1">
                  {runningTotal !== null && runningTotal !== undefined ? runningTotal : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
