import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayers, useCoachNotes } from '../hooks/useFirestore';
import { Link, useSearchParams } from 'react-router-dom';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CoachNote, Player } from '../types';

export function CoachNotes() {
  const { userData, logout } = useAuth();
  const { data: players } = usePlayers(userData?.programId);
  const [searchParams] = useSearchParams();
  const initialPlayerId = searchParams.get('playerId') || '';

  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayerId);
  const { data: notes } = useCoachNotes(selectedPlayerId);

  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedPlayerId(initialPlayerId);
  }, [initialPlayerId]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || !userData?.uid) return;

    try {
      setLoading(true);

      const tagsArray = noteTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const noteData = {
        coachId: userData.uid,
        playerId: selectedPlayerId,
        content: noteContent,
        tags: tagsArray,
        isPrivate,
        updatedAt: serverTimestamp(),
      };

      if (editingNoteId) {
        // Update existing note
        await updateDoc(doc(db, 'coachNotes', editingNoteId), noteData);
      } else {
        // Create new note
        await addDoc(collection(db, 'coachNotes'), {
          ...noteData,
          createdAt: serverTimestamp(),
        });
      }

      // Reset form
      setNoteContent('');
      setNoteTags('');
      setIsPrivate(true);
      setShowAddNote(false);
      setEditingNoteId(null);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note: CoachNote) => {
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
    setIsPrivate(note.isPrivate);
    setEditingNoteId(note.id);
    setShowAddNote(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteDoc(doc(db, 'coachNotes', noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  };

  const selectedPlayer = players.find((p: Player) => p.id === selectedPlayerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/coach/admin" className="text-white hover:text-gray-200">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-white">Coach Notes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-200">
              {userData?.displayName} ({userData?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-white hover:text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Player</h2>
              <div className="space-y-2">
                {players.map((player: Player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayerId(player.id);
                      setShowAddNote(false);
                      setEditingNoteId(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedPlayerId === player.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/5 text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm opacity-75">{player.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-2">
            {selectedPlayer ? (
              <>
                {/* Player Info + Add Note Button */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {selectedPlayer.name}
                      </h2>
                      <p className="text-gray-300">
                        {selectedPlayer.gamesPlayed || 0} games • Avg:{' '}
                        {selectedPlayer.averageScore?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddNote(!showAddNote);
                        setEditingNoteId(null);
                        setNoteContent('');
                        setNoteTags('');
                        setIsPrivate(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      {showAddNote ? 'Cancel' : '+ Add Note'}
                    </button>
                  </div>
                </div>

                {/* Add/Edit Note Form */}
                {showAddNote && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {editingNoteId ? 'Edit Note' : 'Add New Note'}
                    </h3>
                    <form onSubmit={handleSubmitNote} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Note Content
                        </label>
                        <textarea
                          required
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm"
                          placeholder="Enter your coaching notes here..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={noteTags}
                          onChange={(e) => setNoteTags(e.target.value)}
                          className="w-full px-3 py-2 border border-white/30 bg-white/5 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm"
                          placeholder="e.g., 10-pin, release, speed"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPrivate"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="isPrivate" className="text-sm text-gray-200">
                          Private note (only visible to coaches)
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : editingNoteId ? 'Update Note' : 'Save Note'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Notes List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
                  <div className="px-6 py-4 border-b border-white/20">
                    <h3 className="text-xl font-semibold text-white">
                      All Notes ({notes.length})
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    {notes.length === 0 ? (
                      <div className="text-center text-gray-300 py-8">
                        No notes yet. Click "Add Note" to create one.
                      </div>
                    ) : (
                      notes.map((note: CoachNote) => (
                        <div
                          key={note.id}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-white whitespace-pre-wrap">{note.content}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-blue-300 hover:text-blue-200 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-300 hover:text-red-200 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {note.isPrivate && <span>🔒 Private</span>}
                            <span>
                              {note.createdAt instanceof Date
                                ? note.createdAt.toLocaleDateString()
                                : 'Recently added'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Select a Player
                </h2>
                <p className="text-gray-300">
                  Choose a player from the list to view and manage their notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
