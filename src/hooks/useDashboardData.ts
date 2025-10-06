import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit as fbLimit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calculatePlayerStats } from '../utils/statsCalculator';
import type { Game, Frame, PlayerStats } from '../types';

interface DashboardData {
  stats: PlayerStats | null;
  games: Array<{ id: string; date: Date; score: number; mode: string }>;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(playerId: string | undefined, gameLimit: number = 30) {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    games: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!playerId) {
      setData({ stats: null, games: [], loading: false, error: 'No player ID' });
      return;
    }

    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch games for this player
        const gamesQuery = query(
          collection(db, 'games'),
          where('playerId', '==', playerId),
          where('isComplete', '==', true),
          orderBy('createdAt', 'desc'),
          fbLimit(gameLimit)
        );

        const gamesSnapshot = await getDocs(gamesQuery);
        const games: Game[] = [];
        const gamesList: Array<{ id: string; date: Date; score: number; mode: string }> = [];

        for (const doc of gamesSnapshot.docs) {
          const gameData = doc.data() as Omit<Game, 'id'>;
          const game: Game = { id: doc.id, ...gameData };
          games.push(game);

          // Add to games list for display
          const createdAt = gameData.createdAt as any;
          const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
          gamesList.push({
            id: doc.id,
            date,
            score: gameData.totalScore,
            mode: gameData.mode,
          });
        }

        // Fetch all frames for these games to calculate stats
        const allFrames: Frame[] = [];
        for (const game of games) {
          if (game.frameIds && game.frameIds.length > 0) {
            const framesQuery = query(
              collection(db, 'frames'),
              where('gameId', '==', game.id)
            );
            const framesSnapshot = await getDocs(framesQuery);
            framesSnapshot.forEach((doc) => {
              allFrames.push({ id: doc.id, ...doc.data() } as Frame);
            });
          }
        }

        // Calculate stats
        const stats = calculatePlayerStats(games, allFrames);

        setData({
          stats,
          games: gamesList,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data',
        }));
      }
    };

    fetchData();
  }, [playerId, gameLimit]);

  return data;
}

// Hook to fetch comparison player stats
export async function fetchPlayerStats(playerId: string, gameLimit: number = 30): Promise<PlayerStats | null> {
  try {
    // Fetch games for this player
    const gamesQuery = query(
      collection(db, 'games'),
      where('playerId', '==', playerId),
      where('isComplete', '==', true),
      orderBy('createdAt', 'desc'),
      fbLimit(gameLimit)
    );

    const gamesSnapshot = await getDocs(gamesQuery);
    const games: Game[] = [];

    for (const doc of gamesSnapshot.docs) {
      const gameData = doc.data() as Omit<Game, 'id'>;
      games.push({ id: doc.id, ...gameData });
    }

    // Fetch all frames for these games
    const allFrames: Frame[] = [];
    for (const game of games) {
      if (game.frameIds && game.frameIds.length > 0) {
        const framesQuery = query(
          collection(db, 'frames'),
          where('gameId', '==', game.id)
        );
        const framesSnapshot = await getDocs(framesQuery);
        framesSnapshot.forEach((doc) => {
          allFrames.push({ id: doc.id, ...doc.data() } as Frame);
        });
      }
    }

    // Calculate and return stats
    return calculatePlayerStats(games, allFrames);
  } catch (error) {
    console.error('Error fetching player stats for comparison:', error);
    return null;
  }
}
