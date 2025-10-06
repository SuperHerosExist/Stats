import { useState, useEffect } from 'react';
import { PinGrid } from './PinGrid';
import { ScoringControls } from './ScoringControls';
import { ScoreHeader } from './ScoreHeader';
import type { Frame, Ball, GameMode } from '../../types';
import {
  ALL_PINS,
  createPinLeave,
  calculateRunningTotals,
} from '../../utils/scoringEngine';

interface ScoringInterfaceProps {
  gameId: string;
  playerId: string;
  mode: GameMode;
  onGameComplete: (frames: Frame[], totalScore: number) => void;
}

export function ScoringInterface({
  gameId,
  playerId,
  onGameComplete,
}: ScoringInterfaceProps) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [pinsStanding, setPinsStanding] = useState<number[]>(ALL_PINS);
  const [selectedPins, setSelectedPins] = useState<number[]>([]);
  const [ballHistory, setBallHistory] = useState<Ball[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Initialize first frame
    if (frames.length === 0) {
      const frame: Frame = {
        id: `${gameId}-frame-1`,
        gameId,
        frameNumber: 1,
        playerId,
        balls: [],
        score: 0,
        runningTotal: 0,
        isStrike: false,
        isSpare: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFrames([frame]);
    }
  }, []);

  const handlePinTap = (pinNumber: number) => {
    if (selectedPins.includes(pinNumber)) {
      setSelectedPins(selectedPins.filter((p) => p !== pinNumber));
    } else {
      setSelectedPins([...selectedPins, pinNumber]);
    }
  };

  const createBall = (
    pinsKnockedDown: number,
    isFoul: boolean = false,
    isGutter: boolean = false
  ): Ball => {
    const pinsetBefore = [...pinsStanding];
    let pinsetAfter: number[];

    if (isFoul || isGutter) {
      pinsetAfter = pinsetBefore;
    } else {
      // selectedPins now represents what's LEFT standing, not what was knocked down
      pinsetAfter = [...selectedPins].sort((a, b) => a - b);
    }

    return {
      ballNumber: currentBall,
      pinsKnockedDown: isFoul ? 0 : pinsKnockedDown,
      pinsetBefore,
      pinsetAfter,
      isFoul,
      isGutter,
      timestamp: new Date(),
    };
  };

  const recordBall = (ball: Ball) => {
    const frameIndex = currentFrame - 1;
    const updatedFrames = [...frames];
    const frame = { ...updatedFrames[frameIndex] };

    frame.balls.push(ball);
    setBallHistory([...ballHistory, ball]);

    // Update pins standing
    setPinsStanding(ball.pinsetAfter);

    // Check for strike (10 pins on first ball of frames 1-9)
    if (currentFrame <= 9 && currentBall === 1 && ball.pinsKnockedDown === 10) {
      frame.isStrike = true;
      frame.leaveAfterBall1 = createPinLeave([], false);
      updatedFrames[frameIndex] = frame;
      setFrames(updatedFrames);
      advanceToNextFrame();
      return;
    }

    // Record leave after ball 1
    if (currentBall === 1) {
      const wasConverted = false; // Will update on ball 2
      frame.leaveAfterBall1 = createPinLeave(ball.pinsetAfter, wasConverted);
    }

    // Check for spare (ball 2 clears remaining pins in frames 1-9)
    if (currentFrame <= 9 && currentBall === 2) {
      const ball1Pins = frame.balls[0]?.pinsKnockedDown || 0;
      if (ball1Pins + ball.pinsKnockedDown === 10) {
        frame.isSpare = true;
        if (frame.leaveAfterBall1) {
          frame.leaveAfterBall1.isConverted = true;
        }
      }
    }

    // Handle 10th frame strike/spare flags
    if (currentFrame === 10) {
      const ball1 = frame.balls[0];
      const ball2 = frame.balls[1];

      if (ball1 && ball1.pinsKnockedDown === 10) {
        frame.isStrike = true;
      }
      if (ball1 && ball2) {
        if (ball1.pinsKnockedDown < 10 && ball1.pinsKnockedDown + ball2.pinsKnockedDown === 10) {
          frame.isSpare = true;
        }
      }
    }

    updatedFrames[frameIndex] = frame;
    setFrames(updatedFrames);

    // Advance to next ball or frame
    if (currentFrame === 10) {
      handle10thFrame(ball, frame);
    } else if (currentBall === 2) {
      advanceToNextFrame();
    } else {
      setCurrentBall(2);
      setSelectedPins([]);
    }
  };

  const handle10thFrame = (_ball: Ball, frame: Frame) => {
    const totalBalls = frame.balls.length;

    if (totalBalls === 1) {
      // After first ball in 10th frame
      if (frame.balls[0].pinsKnockedDown === 10) {
        // Strike on ball 1 - reset pins and continue
        setPinsStanding(ALL_PINS);
        setSelectedPins([]);
        setCurrentBall(2);
      } else {
        // Not a strike - continue to ball 2 with remaining pins
        setCurrentBall(2);
        setSelectedPins([]);
      }
    } else if (totalBalls === 2) {
      const ball1 = frame.balls[0];
      const ball2 = frame.balls[1];

      // Check if 3rd ball needed
      const needThirdBall = ball1.pinsKnockedDown === 10 || ball1.pinsKnockedDown + ball2.pinsKnockedDown === 10;

      if (needThirdBall) {
        setCurrentBall(3);
        // Reset pins for 3rd ball if ball 1 was a strike OR if we got a spare
        if (ball1.pinsKnockedDown === 10) {
          // If ball 1 was a strike, check if ball 2 was also a strike
          if (ball2.pinsKnockedDown === 10) {
            setPinsStanding(ALL_PINS);
          }
          // If ball 2 wasn't a strike, pins are already set correctly
        } else if (ball1.pinsKnockedDown + ball2.pinsKnockedDown === 10) {
          // Spare - reset all pins
          setPinsStanding(ALL_PINS);
        }
        setSelectedPins([]);
      } else {
        completeGame();
      }
    } else if (totalBalls === 3) {
      completeGame();
    }
  };

  const advanceToNextFrame = () => {
    if (currentFrame === 10) {
      completeGame();
      return;
    }

    const nextFrame = currentFrame + 1;
    const newFrame: Frame = {
      id: `${gameId}-frame-${nextFrame}`,
      gameId,
      frameNumber: nextFrame,
      playerId,
      balls: [],
      score: 0,
      runningTotal: 0,
      isStrike: false,
      isSpare: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFrames([...frames, newFrame]);
    setCurrentFrame(nextFrame);
    setCurrentBall(1);
    setPinsStanding(ALL_PINS);
    setSelectedPins([]);
  };

  const completeGame = () => {
    const totals = calculateRunningTotals(frames);
    const finalScore = totals[totals.length - 1] || 0;
    onGameComplete(frames, finalScore as number);
  };

  const handleStrike = () => {
    const ball = createBall(10, false, false);
    setSelectedPins([]); // No pins left standing
    setTimeout(() => recordBall(ball), 200); // Small delay for animation
  };

  const handleSpare = () => {
    const pinsKnockedDown = pinsStanding.length;
    const ball = createBall(pinsKnockedDown, false, false);
    setSelectedPins([]); // No pins left standing
    setTimeout(() => recordBall(ball), 200);
  };

  const handleMiss = () => {
    // Miss means we left all the pins standing (knocked down 0)
    const ball = createBall(0, false, false);
    setSelectedPins([...pinsStanding]); // Keep all pins standing
    recordBall(ball);
  };

  const handleSubmit = () => {
    // Calculate pins knocked down: what was standing minus what's left
    const pinsKnockedDown = pinsStanding.length - selectedPins.length;
    const ball = createBall(pinsKnockedDown, false, false);
    recordBall(ball);
  };

  const handleUndo = () => {
    if (ballHistory.length === 0) return;

    const lastBall = ballHistory[ballHistory.length - 1];
    const updatedHistory = ballHistory.slice(0, -1);
    setBallHistory(updatedHistory);

    // Find and update the frame
    const frameIndex = frames.findIndex((f) => f.balls.includes(lastBall));
    if (frameIndex === -1) return;

    const updatedFrames = [...frames];
    const frame = { ...updatedFrames[frameIndex] };

    // Remove the ball
    frame.balls = frame.balls.filter((b) => b !== lastBall);

    // Reset frame flags
    if (frame.balls.length === 0) {
      frame.isStrike = false;
      frame.isSpare = false;
      frame.leaveAfterBall1 = undefined;
    }

    updatedFrames[frameIndex] = frame;
    setFrames(updatedFrames);

    // Restore pins and state
    const previousBall = frame.balls[frame.balls.length - 1];
    if (previousBall) {
      setPinsStanding(previousBall.pinsetAfter);
      setCurrentBall(frame.balls.length + 1);
    } else {
      setPinsStanding(ALL_PINS);
      setCurrentBall(1);
    }

    setSelectedPins([]);
  };

  const canUndo = ballHistory.length > 0;
  const canSubmit = selectedPins.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Score Header */}
      <ScoreHeader frames={frames} currentFrame={currentFrame} />

      {/* Help Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showHelp ? '✕ Hide Help' : '? Show Help'}
        </button>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-purple-900">How to Score</h3>

          <div className="space-y-3 text-sm text-purple-900">
            <div>
              <p className="font-semibold">📌 Selecting Pins:</p>
              <p>After your first ball, <strong>select the pins you LEFT STANDING</strong> (not what you knocked down).</p>
              <p>For example: If you left the 1-2-4-7 pins standing, click those pins to highlight them in yellow.</p>
            </div>

            <div>
              <p className="font-semibold">🎯 Quick Buttons:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>X Strike:</strong> You knocked down all 10 pins on your first ball</li>
                <li><strong>/ Spare:</strong> You knocked down all remaining pins on your second ball</li>
                <li><strong>- Miss:</strong> You didn't knock down any pins on this ball</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">🎳 USBC Scoring Rules:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Strike:</strong> 10 pins + your next 2 throws (shown as X)</li>
                <li><strong>Spare:</strong> 10 pins + your next 1 throw (shown as /)</li>
                <li><strong>Open Frame:</strong> Just the pin count (miss shown as -)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">📋 Steps for Each Ball:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Bowl your ball</li>
                <li>If it's ball 1: Select the pins LEFT standing, then click "Submit Ball"</li>
                <li>If you got a strike, spare, or miss: Use the quick buttons instead</li>
                <li>Repeat for ball 2</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Current Frame Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Frame {currentFrame} - Ball {currentBall}
            </h3>
            <p className="text-sm text-blue-700">
              {selectedPins.length} pins left standing • {pinsStanding.length} pins available
            </p>
          </div>
        </div>
      </div>

      {/* Pin Grid */}
      <PinGrid pinsStanding={pinsStanding} onPinTap={handlePinTap} />

      {/* Scoring Controls */}
      <ScoringControls
        onStrike={handleStrike}
        onSpare={handleSpare}
        onMiss={handleMiss}
        onUndo={handleUndo}
        onSubmit={handleSubmit}
        canUndo={canUndo}
        canSubmit={canSubmit}
      />
    </div>
  );
}
