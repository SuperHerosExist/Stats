import type { Frame, Game, PlayerStats, LeaveStats } from '../types';
import { isPocketHit } from './scoringEngine';

export function calculatePlayerStats(games: Game[], frames: Frame[]): PlayerStats {
  const totalGames = games.length;

  if (totalGames === 0) {
    return {
      playerId: '',
      totalGames: 0,
      averageScore: 0,
      highGame: 0,
      strikePercentage: 0,
      sparePercentage: 0,
      singlePinSparePercentage: 0,
      multiPinSparePercentage: 0,
      splitLeavesPercentage: 0,
      splitConversionPercentage: 0,
      openFramesPercentage: 0,
      gutterCount: 0,
      foulCount: 0,
      firstBallAverage: 0,
      pocketHitPercentage: 0,
      carryRate: 0,
      doublePercentage: 0,
      triplePercentage: 0,
      commonLeaves: [],
    };
  }

  // Calculate scores
  const totalScore = games.reduce((sum, game) => sum + game.totalScore, 0);
  const averageScore = totalScore / totalGames;
  const highGame = Math.max(...games.map((g) => g.totalScore));

  // Count frame types
  let strikeCount = 0;
  let spareCount = 0;
  let singlePinSpareCount = 0;
  let multiPinSpareCount = 0;
  let splitLeaveCount = 0;
  let splitConversionCount = 0;
  let openFrameCount = 0;
  let gutterCount = 0;
  let foulCount = 0;
  let firstBallTotal = 0;
  let firstBallCount = 0;
  let pocketHitCount = 0;
  let pocketStrikeCount = 0;

  const leaveMap = new Map<string, { count: number; conversions: number }>();

  // Analyze frames (excluding 10th frame for some stats)
  const regularFrames = frames.filter((f) => f.frameNumber <= 9);
  const totalFrames = regularFrames.length;

  for (const frame of regularFrames) {
    // Strike
    if (frame.isStrike) {
      strikeCount++;
    }
    // Spare
    else if (frame.isSpare) {
      spareCount++;

      const leave = frame.leaveAfterBall1;
      if (leave) {
        if (leave.count === 1) singlePinSpareCount++;
        else multiPinSpareCount++;

        if (leave.isSplit) splitConversionCount++;
      }
    }
    // Open frame
    else {
      openFrameCount++;
    }

    // First ball stats
    const ball1 = frame.balls[0];
    if (ball1) {
      firstBallTotal += ball1.pinsKnockedDown;
      firstBallCount++;

      if (ball1.isGutter) gutterCount++;
      if (ball1.isFoul) foulCount++;

      // Pocket hit detection
      if (isPocketHit(ball1.pinsetBefore, ball1.pinsetAfter)) {
        pocketHitCount++;
        if (frame.isStrike) pocketStrikeCount++;
      }

      // Track leaves (if not strike)
      if (!frame.isStrike && frame.leaveAfterBall1) {
        const leave = frame.leaveAfterBall1;
        const key = leave.pins.join('-');
        const existing = leaveMap.get(key) || { count: 0, conversions: 0 };
        leaveMap.set(key, {
          count: existing.count + 1,
          conversions: existing.conversions + (leave.isConverted ? 1 : 0),
        });

        if (leave.isSplit) splitLeaveCount++;
      }
    }

    // Second ball stats
    const ball2 = frame.balls[1];
    if (ball2) {
      if (ball2.isGutter) gutterCount++;
      if (ball2.isFoul) foulCount++;
    }
  }

  // Calculate percentages
  const strikePercentage = totalFrames > 0 ? (strikeCount / totalFrames) * 100 : 0;
  const sparePercentage = totalFrames > 0 ? (spareCount / totalFrames) * 100 : 0;
  const singlePinSparePercentage =
    spareCount > 0 ? (singlePinSpareCount / spareCount) * 100 : 0;
  const multiPinSparePercentage =
    spareCount > 0 ? (multiPinSpareCount / spareCount) * 100 : 0;
  const splitLeavesPercentage = totalFrames > 0 ? (splitLeaveCount / totalFrames) * 100 : 0;
  const splitConversionPercentage =
    splitLeaveCount > 0 ? (splitConversionCount / splitLeaveCount) * 100 : 0;
  const openFramesPercentage = totalFrames > 0 ? (openFrameCount / totalFrames) * 100 : 0;
  const firstBallAverage = firstBallCount > 0 ? firstBallTotal / firstBallCount : 0;
  const pocketHitPercentage = firstBallCount > 0 ? (pocketHitCount / firstBallCount) * 100 : 0;
  const carryRate = pocketHitCount > 0 ? (pocketStrikeCount / pocketHitCount) * 100 : 0;

  // Calculate doubles and triples
  let doubleCount = 0;
  let tripleCount = 0;

  for (let i = 0; i < regularFrames.length - 1; i++) {
    if (regularFrames[i].isStrike && regularFrames[i + 1].isStrike) {
      doubleCount++;
      if (i < regularFrames.length - 2 && regularFrames[i + 2].isStrike) {
        tripleCount++;
      }
    }
  }

  const doublePercentage = totalFrames > 0 ? (doubleCount / totalFrames) * 100 : 0;
  const triplePercentage = totalFrames > 0 ? (tripleCount / totalFrames) * 100 : 0;

  // Common leaves
  const commonLeaves: LeaveStats[] = Array.from(leaveMap.entries())
    .map(([key, data]) => ({
      pinset: key.split('-').map(Number),
      count: data.count,
      conversionRate: data.count > 0 ? (data.conversions / data.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return {
    playerId: games[0]?.playerId || '',
    totalGames,
    averageScore: Math.round(averageScore * 10) / 10,
    highGame,
    strikePercentage: Math.round(strikePercentage * 10) / 10,
    sparePercentage: Math.round(sparePercentage * 10) / 10,
    singlePinSparePercentage: Math.round(singlePinSparePercentage * 10) / 10,
    multiPinSparePercentage: Math.round(multiPinSparePercentage * 10) / 10,
    splitLeavesPercentage: Math.round(splitLeavesPercentage * 10) / 10,
    splitConversionPercentage: Math.round(splitConversionPercentage * 10) / 10,
    openFramesPercentage: Math.round(openFramesPercentage * 10) / 10,
    gutterCount,
    foulCount,
    firstBallAverage: Math.round(firstBallAverage * 10) / 10,
    pocketHitPercentage: Math.round(pocketHitPercentage * 10) / 10,
    carryRate: Math.round(carryRate * 10) / 10,
    doublePercentage: Math.round(doublePercentage * 10) / 10,
    triplePercentage: Math.round(triplePercentage * 10) / 10,
    commonLeaves,
  };
}

/**
 * Calculates stats for a specific session
 */
export function calculateSessionStats(games: Game[], frames: Frame[]): PlayerStats {
  return calculatePlayerStats(games, frames);
}

/**
 * Aggregates stats across multiple players for team stats
 */
export function calculateTeamStats(
  playerStats: Record<string, PlayerStats>
): {
  averageScore: number;
  highGame: number;
  strikePercentage: number;
  sparePercentage: number;
} {
  const stats = Object.values(playerStats);
  const totalPlayers = stats.length;

  if (totalPlayers === 0) {
    return {
      averageScore: 0,
      highGame: 0,
      strikePercentage: 0,
      sparePercentage: 0,
    };
  }

  const averageScore =
    stats.reduce((sum, s) => sum + s.averageScore, 0) / totalPlayers;
  const highGame = Math.max(...stats.map((s) => s.highGame));
  const strikePercentage =
    stats.reduce((sum, s) => sum + s.strikePercentage, 0) / totalPlayers;
  const sparePercentage =
    stats.reduce((sum, s) => sum + s.sparePercentage, 0) / totalPlayers;

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    highGame,
    strikePercentage: Math.round(strikePercentage * 10) / 10,
    sparePercentage: Math.round(sparePercentage * 10) / 10,
  };
}
