import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AvailablePlayer {
  id: string;
  name: string;
  role?: string;
}

export function useAvailablePlayers(programId: string | undefined, excludePlayerId?: string) {
  const [players, setPlayers] = useState<AvailablePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      try {
        setLoading(true);

        // Fetch all users in the program
        const usersQuery = query(
          collection(db, 'users'),
          where('programId', '==', programId)
        );

        const snapshot = await getDocs(usersQuery);
        const fetchedPlayers: AvailablePlayer[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== excludePlayerId) {
            fetchedPlayers.push({
              id: doc.id,
              name: data.displayName || data.email,
              role: data.role,
            });
          }
        });

        // Sort: coaches first, then alphabetically
        fetchedPlayers.sort((a, b) => {
          if (a.role === 'coach' && b.role !== 'coach') return -1;
          if (a.role !== 'coach' && b.role === 'coach') return 1;
          return a.name.localeCompare(b.name);
        });

        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error('Error fetching available players:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [programId, excludePlayerId]);

  return { players, loading };
}
