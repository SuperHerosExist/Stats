import { describe, it, expect } from 'vitest';
import {
  isSplit,
  describeLeave,
  calculateFrameScore,
  generateBakerRotation,
} from './scoringEngine';
import type { Frame } from '../types';

describe('scoringEngine', () => {
  describe('isSplit', () => {
    it('should identify 7-10 split', () => {
      expect(isSplit([7, 10])).toBe(true);
    });

    it('should identify 4-6 split', () => {
      expect(isSplit([4, 6])).toBe(true);
    });

    it('should not identify non-split', () => {
      expect(isSplit([1, 2])).toBe(false);
    });

    it('should return false when headpin is standing', () => {
      expect(isSplit([1, 7, 10])).toBe(false);
    });
  });

  describe('describeLeave', () => {
    it('should describe strike', () => {
      expect(describeLeave([])).toBe('Strike');
    });

    it('should describe single pin', () => {
      expect(describeLeave([10])).toBe('10-pin');
    });

    it('should describe famous splits', () => {
      expect(describeLeave([7, 10])).toBe('7-10 Split');
    });
  });

  describe('calculateFrameScore', () => {
    it('should calculate strike with bonus', () => {
      const frames: Frame[] = [
        {
          id: '1',
          gameId: 'game1',
          frameNumber: 1,
          playerId: 'player1',
          balls: [
            {
              ballNumber: 1,
              pinsKnockedDown: 10,
              pinsetBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              pinsetAfter: [],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
          ],
          score: 0,
          runningTotal: 0,
          isStrike: true,
          isSpare: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          gameId: 'game1',
          frameNumber: 2,
          playerId: 'player1',
          balls: [
            {
              ballNumber: 1,
              pinsKnockedDown: 5,
              pinsetBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              pinsetAfter: [1, 2, 4, 7, 10],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
            {
              ballNumber: 2,
              pinsKnockedDown: 3,
              pinsetBefore: [1, 2, 4, 7, 10],
              pinsetAfter: [1, 2],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
          ],
          score: 0,
          runningTotal: 0,
          isStrike: false,
          isSpare: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(calculateFrameScore(frames, 0)).toBe(18); // 10 + 5 + 3
    });

    it('should calculate spare with bonus', () => {
      const frames: Frame[] = [
        {
          id: '1',
          gameId: 'game1',
          frameNumber: 1,
          playerId: 'player1',
          balls: [
            {
              ballNumber: 1,
              pinsKnockedDown: 7,
              pinsetBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              pinsetAfter: [4, 6, 10],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
            {
              ballNumber: 2,
              pinsKnockedDown: 3,
              pinsetBefore: [4, 6, 10],
              pinsetAfter: [],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
          ],
          score: 0,
          runningTotal: 0,
          isStrike: false,
          isSpare: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          gameId: 'game1',
          frameNumber: 2,
          playerId: 'player1',
          balls: [
            {
              ballNumber: 1,
              pinsKnockedDown: 5,
              pinsetBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              pinsetAfter: [1, 2, 4, 7, 10],
              isFoul: false,
              isGutter: false,
              timestamp: new Date(),
            },
          ],
          score: 0,
          runningTotal: 0,
          isStrike: false,
          isSpare: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(calculateFrameScore(frames, 0)).toBe(15); // 10 + 5
    });
  });

  describe('generateBakerRotation', () => {
    it('should create proper rotation for 5 players', () => {
      const players = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const rotation = generateBakerRotation(players);

      expect(rotation.get(1)).toBe('p1');
      expect(rotation.get(2)).toBe('p2');
      expect(rotation.get(5)).toBe('p5');
      expect(rotation.get(6)).toBe('p1');
      expect(rotation.get(10)).toBe('p5');
    });
  });
});
