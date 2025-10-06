import type { Frame, PinLeave, FrameSymbol } from '../types';

// USBC Split definition: headpin down + non-adjacent pins
const SPLIT_PATTERNS = [
  [7, 10], [4, 6], [5, 7], [5, 10], [4, 7, 10], [6, 7, 10],
  [4, 6, 7], [4, 6, 10], [4, 7, 9], [5, 6], [2, 7], [3, 10],
  [4, 6, 7, 9, 10], [4, 6, 7, 10], [4, 7, 9, 10], [6, 7, 9, 10]
];

// Washout patterns (1-2-4-10 or 1-3-6-7)
const WASHOUT_PATTERNS = [[1, 2, 4, 10], [1, 3, 6, 7], [1, 2, 10], [1, 3, 7]];

/**
 * Determines if a pinset is a split according to USBC rules
 */
export function isSplit(pins: number[]): boolean {
  if (pins.length < 2) return false;

  // Headpin (1) must be down
  if (pins.includes(1)) return false;

  const sorted = [...pins].sort((a, b) => a - b);

  // Check against known split patterns
  return SPLIT_PATTERNS.some(pattern =>
    pattern.length === sorted.length &&
    pattern.every((pin, idx) => pin === sorted[idx])
  );
}

/**
 * Determines if a pinset is a washout
 */
export function isWashout(pins: number[]): boolean {
  const sorted = [...pins].sort((a, b) => a - b);
  return WASHOUT_PATTERNS.some(pattern =>
    pattern.length === sorted.length &&
    pattern.every((pin, idx) => pin === sorted[idx])
  );
}

/**
 * Describes a pin leave in human-readable format
 */
export function describeLeave(pins: number[]): string {
  if (pins.length === 0) return 'Strike';
  if (pins.length === 10) return 'Gutter';

  const sorted = [...pins].sort((a, b) => a - b);

  // Common single pin leaves
  if (sorted.length === 1) {
    const pin = sorted[0];
    return `${pin}-pin`;
  }

  // Famous splits
  const leaveStr = sorted.join('-');
  if (leaveStr === '7-10') return '7-10 Split';
  if (leaveStr === '4-6') return '4-6 Split';
  if (leaveStr === '4-6-7-10') return 'Big Four';

  if (isSplit(sorted)) return `${leaveStr} Split`;
  if (isWashout(sorted)) return `${leaveStr} Washout`;

  return leaveStr;
}

/**
 * Determines if first ball was a pocket hit (1-3 or 1-2 depending on handedness)
 * For simplicity, we'll check if pins 1, 2, and 3 were all knocked down
 */
export function isPocketHit(pinsetBefore: number[], pinsetAfter: number[]): boolean {
  // If headpin (1) is down and at least 2 or 3 is down, it's a pocket hit
  const knocked = pinsetBefore.filter(pin => !pinsetAfter.includes(pin));
  return knocked.includes(1) && (knocked.includes(2) || knocked.includes(3));
}

/**
 * Creates a PinLeave object from ball data
 */
export function createPinLeave(
  pinsStanding: number[],
  wasConverted: boolean
): PinLeave {
  return {
    pins: [...pinsStanding].sort((a, b) => a - b),
    count: pinsStanding.length,
    isSplit: isSplit(pinsStanding),
    isWashout: isWashout(pinsStanding),
    isConverted: wasConverted,
    leaveType: describeLeave(pinsStanding),
  };
}

/**
 * Calculates frame score with USBC bonus rules
 * Returns null if score cannot be determined yet (waiting for bonus balls)
 */
export function calculateFrameScore(
  frames: Frame[],
  frameIndex: number
): number | null {
  const frame = frames[frameIndex];
  const isLastFrame = frame.frameNumber === 10;

  if (isLastFrame) {
    // 10th frame: sum all balls
    return frame.balls.reduce((sum, ball) => sum + ball.pinsKnockedDown, 0);
  }

  const firstBall = frame.balls[0]?.pinsKnockedDown || 0;
  const secondBall = frame.balls[1]?.pinsKnockedDown || 0;
  const frameTotal = firstBall + secondBall;

  // Strike: 10 + next 2 balls
  if (frame.isStrike) {
    const nextFrame = frames[frameIndex + 1];
    if (!nextFrame) return null; // Need next frame

    const nextBall1 = nextFrame.balls[0]?.pinsKnockedDown;
    if (nextBall1 === undefined) return null;

    const nextBall2 = nextFrame.balls[1]?.pinsKnockedDown;

    // If next frame is also a strike, need the frame after that
    if (nextFrame.isStrike && nextFrame.frameNumber !== 10) {
      const frameAfterNext = frames[frameIndex + 2];
      if (!frameAfterNext) return null;
      const nextNextBall1 = frameAfterNext.balls[0]?.pinsKnockedDown;
      if (nextNextBall1 === undefined) return null;
      return 10 + nextBall1 + nextNextBall1;
    }

    // Next frame not a strike, or is 10th frame
    if (nextBall2 === undefined) return null;
    return 10 + nextBall1 + nextBall2;
  }

  // Spare: 10 + next 1 ball
  if (frame.isSpare) {
    const nextFrame = frames[frameIndex + 1];
    if (!nextFrame) return null;
    const nextBall = nextFrame.balls[0]?.pinsKnockedDown;
    if (nextBall === undefined) return null;
    return 10 + nextBall;
  }

  // Open frame: just sum the balls
  return frameTotal;
}

/**
 * Calculates running total through all frames
 */
export function calculateRunningTotals(frames: Frame[]): (number | null)[] {
  const totals: (number | null)[] = [];
  let runningTotal = 0;

  for (let i = 0; i < frames.length; i++) {
    const frameScore = calculateFrameScore(frames, i);
    if (frameScore === null) {
      totals.push(null);
      continue;
    }
    runningTotal += frameScore;
    totals.push(runningTotal);
  }

  return totals;
}

/**
 * Converts frame to USBC scoring symbols
 */
export function getFrameSymbols(frame: Frame, frameNumber: number): FrameSymbol[] {
  const symbols: FrameSymbol[] = [];

  if (frameNumber === 10) {
    // 10th frame special handling
    for (const ball of frame.balls) {
      if (ball.isFoul) {
        symbols.push('F');
      } else if (ball.isGutter) {
        symbols.push('G');
      } else if (ball.pinsKnockedDown === 10) {
        symbols.push('X');
      } else if (ball.pinsKnockedDown === 0) {
        symbols.push('-');
      } else {
        // Check if spare (only for ball 2)
        const prevBall = frame.balls[symbols.length - 1];
        if (prevBall && prevBall.pinsKnockedDown + ball.pinsKnockedDown === 10) {
          symbols.push('/');
        } else {
          symbols.push(ball.pinsKnockedDown);
        }
      }
    }
    return symbols;
  }

  // Frames 1-9
  const ball1 = frame.balls[0];
  const ball2 = frame.balls[1];

  if (!ball1) return [];

  // First ball
  if (ball1.isFoul) {
    symbols.push('F');
  } else if (ball1.isGutter || ball1.pinsKnockedDown === 0) {
    symbols.push('-');
  } else if (frame.isStrike) {
    symbols.push('X');
    return symbols; // Strike ends frame
  } else {
    symbols.push(ball1.pinsKnockedDown);
  }

  // Second ball
  if (!ball2) return symbols;

  if (ball2.isFoul) {
    symbols.push('F');
  } else if (frame.isSpare) {
    symbols.push('/');
  } else if (ball2.isGutter || ball2.pinsKnockedDown === 0) {
    symbols.push('-');
  } else {
    symbols.push(ball2.pinsKnockedDown);
  }

  return symbols;
}

/**
 * Validates if a game is complete (all 10 frames properly filled)
 */
export function isGameComplete(frames: Frame[]): boolean {
  if (frames.length !== 10) return false;

  for (let i = 0; i < 10; i++) {
    const frame = frames[i];

    if (i < 9) {
      // Frames 1-9: need 2 balls unless strike
      if (frame.isStrike && frame.balls.length !== 1) return false;
      if (!frame.isStrike && frame.balls.length !== 2) return false;
    } else {
      // Frame 10: need 2 balls always, 3rd if strike or spare
      if (frame.isStrike || frame.isSpare) {
        if (frame.balls.length !== 3) return false;
      } else {
        if (frame.balls.length !== 2) return false;
      }
    }
  }

  return true;
}

/**
 * Generates Baker mode rotation (5 players alternating frames)
 */
export function generateBakerRotation(playerIds: string[]): Map<number, string> {
  const rotation = new Map<number, string>();

  for (let frame = 1; frame <= 10; frame++) {
    const playerIndex = (frame - 1) % 5;
    rotation.set(frame, playerIds[playerIndex]);
  }

  return rotation;
}

/**
 * All standard pins in starting position
 */
export const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Common spare drills
 */
export const COMMON_SPARE_DRILLS = [
  { pins: [10], name: '10-Pin', difficulty: 'easy' as const },
  { pins: [7], name: '7-Pin', difficulty: 'easy' as const },
  { pins: [4], name: '4-Pin', difficulty: 'easy' as const },
  { pins: [6], name: '6-Pin', difficulty: 'easy' as const },
  { pins: [3, 6, 9], name: '3-6-9', difficulty: 'medium' as const },
  { pins: [2, 7, 8], name: '2-7-8', difficulty: 'medium' as const },
  { pins: [4, 7, 8], name: '4-7-8 (Bucket)', difficulty: 'medium' as const },
  { pins: [3, 5, 6], name: '3-5-6 (Bucket)', difficulty: 'medium' as const },
  { pins: [7, 10], name: '7-10 Split', difficulty: 'hard' as const },
  { pins: [4, 6], name: '4-6 Split', difficulty: 'hard' as const },
  { pins: [5, 7], name: '5-7 Split', difficulty: 'hard' as const },
  { pins: [5, 10], name: '5-10 Split', difficulty: 'hard' as const },
];
