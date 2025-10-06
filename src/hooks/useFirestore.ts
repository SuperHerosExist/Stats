import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Player, Team, Game, CoachNote } from '../types';

/**
 * Generic hook for real-time Firestore queries
 */
export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}

/**
 * Hook for fetching players by programId
 */
export function usePlayers(programId?: string) {
  const constraints: QueryConstraint[] = programId
    ? [where('programId', '==', programId)]
    : [];

  return useFirestoreQuery<Player>('players', ...constraints);
}

/**
 * Hook for fetching teams by programId
 */
export function useTeams(programId?: string) {
  const constraints: QueryConstraint[] = programId
    ? [where('programId', '==', programId)]
    : [];

  return useFirestoreQuery<Team>('teams', ...constraints);
}

/**
 * Hook for fetching sessions by playerId
 */
export function useSessions(playerId?: string) {
  const constraints: QueryConstraint[] = playerId
    ? [where('playerIds', 'array-contains', playerId)]
    : [];

  return useFirestoreQuery('sessions', ...constraints);
}

/**
 * Hook for fetching games by sessionId
 */
export function useGames(sessionId?: string) {
  const constraints: QueryConstraint[] = sessionId
    ? [where('sessionId', '==', sessionId)]
    : [];

  return useFirestoreQuery<Game>('games', ...constraints);
}

/**
 * Hook for fetching coach notes by playerId
 */
export function useCoachNotes(playerId?: string) {
  const constraints: QueryConstraint[] = playerId
    ? [where('playerId', '==', playerId)]
    : [];

  return useFirestoreQuery<CoachNote>('coachNotes', ...constraints);
}
