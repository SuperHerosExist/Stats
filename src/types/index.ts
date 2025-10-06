// User and Role Types
export type UserRole = 'player' | 'coach';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  programId?: string; // ID of the bowling program
  createdAt: Date;
  updatedAt: Date;
}

// Player Profile
export interface Player {
  id: string;
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  programId: string;
  teamIds: string[]; // Can be on multiple teams
  averageScore: number;
  gamesPlayed: number;
  createdAt: Date;
  updatedAt: Date;
}

// Team
export interface Team {
  id: string;
  name: string;
  programId: string;
  coachId: string;
  playerIds: string[]; // Up to 5 active players, but can have more on roster
  createdAt: Date;
  updatedAt: Date;
}

// Game Modes
export type GameMode = 'practice-spares' | 'practice-full' | 'match-traditional' | 'match-baker' | 'league';

// Session (represents a practice or match event)
export interface Session {
  id: string;
  programId: string;
  mode: GameMode;
  teamId?: string; // For team modes
  playerIds: string[]; // Players participating
  coachId?: string;
  date: Date;
  location?: string;
  gameIds: string[]; // References to Game documents
  createdAt: Date;
  updatedAt: Date;
}

// Game (one complete game, 10 frames)
export interface Game {
  id: string;
  sessionId: string;
  playerId: string; // Primary player (for traditional) or team (for baker)
  mode: GameMode;
  frameIds: string[]; // References to Frame documents (10 frames)
  totalScore: number;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Frame (one frame in a game)
export interface Frame {
  id: string;
  gameId: string;
  frameNumber: number; // 1-10
  playerId: string; // For Baker mode, this is the actual thrower
  balls: Ball[]; // 2 balls for frames 1-9, up to 3 for frame 10
  score: number; // Frame score (with bonuses)
  runningTotal: number; // Cumulative score through this frame
  isStrike: boolean;
  isSpare: boolean;
  leaveAfterBall1?: PinLeave; // Pinset remaining after first ball
  createdAt: Date;
  updatedAt: Date;
}

// Ball (individual ball throw)
export interface Ball {
  ballNumber: number; // 1, 2, or 3 (for 10th frame)
  pinsKnockedDown: number; // 0-10
  pinsetBefore: number[]; // Array of pin numbers standing before throw (1-10)
  pinsetAfter: number[]; // Array of pin numbers standing after throw
  isFoul: boolean;
  isGutter: boolean;
  timestamp: Date;
}

// Pin Leave (configuration after first ball)
export interface PinLeave {
  pins: number[]; // Array of pin numbers still standing (1-10)
  count: number; // Number of pins standing
  isSplit: boolean;
  isWashout: boolean;
  isConverted: boolean; // Was it converted on ball 2?
  leaveType?: string; // e.g., "10-pin", "7-pin", "7-10 split", "pocket 7-10"
}

// Spare Drill (for practice-spares mode)
export interface SpareDrill {
  id: string;
  name: string;
  pinsetTarget: number[]; // e.g., [10] for 10-pin, [7, 10] for 7-10 split
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Coach Note
export interface CoachNote {
  id: string;
  coachId: string;
  playerId: string;
  sessionId?: string; // Optional link to specific session
  content: string; // Rich text (HTML or markdown)
  tags: string[]; // e.g., ["10-pin", "release", "speed"]
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Stats Types
export interface PlayerStats {
  playerId: string;
  totalGames: number;
  averageScore: number;
  highGame: number;
  strikePercentage: number;
  sparePercentage: number;
  singlePinSparePercentage: number;
  multiPinSparePercentage: number;
  splitLeavesPercentage: number;
  splitConversionPercentage: number;
  openFramesPercentage: number;
  gutterCount: number;
  foulCount: number;
  firstBallAverage: number; // Average pins on first ball
  pocketHitPercentage: number; // % of first balls in pocket (1-3 or 1-2)
  carryRate: number; // % of pocket hits that result in strikes
  doublePercentage: number; // % of frames with 2 strikes in a row
  triplePercentage: number; // % of frames with 3 strikes in a row
  commonLeaves: LeaveStats[]; // Most common pin leaves
}

export interface LeaveStats {
  pinset: number[]; // e.g., [10], [7, 10]
  count: number;
  conversionRate: number; // % converted to spare
}

export interface TeamStats {
  teamId: string;
  sessionId?: string; // For per-match stats
  totalGames: number;
  averageScore: number;
  highGame: number;
  playerStats: Record<string, PlayerStats>; // playerId -> stats
}

// Scoring Symbols
export type FrameSymbol = 'X' | '/' | '-' | 'F' | 'G' | number;

// UI State
export interface ScoringUIState {
  currentFrame: number;
  currentBall: number;
  pinsetStanding: number[]; // Pins currently standing
  canUndo: boolean;
  frameHistory: Frame[];
}

// Baker Mode Rotation
export interface BakerRotation {
  frameNumber: number; // 1-10
  playerId: string;
  playerName: string;
}

// Practice Spare Session
export interface PracticeSpareSession {
  drillId: string;
  attempts: number;
  conversions: number;
  conversionRate: number;
}
