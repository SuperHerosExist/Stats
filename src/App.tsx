import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './pages/Dashboard';
import { League } from './pages/League';
import { CoachAdmin } from './pages/CoachAdmin';
import { RosterManagement } from './pages/RosterManagement';
import { TeamStats } from './pages/TeamStats';
import { CoachNotes } from './pages/CoachNotes';
import { PlayerStats } from './pages/PlayerStats';
import { PracticeSpares } from './pages/PracticeSpares';
import { PracticeFullGame } from './pages/PracticeFullGame';
import { MatchTraditional } from './pages/MatchTraditional';
import { MatchBaker } from './pages/MatchBaker';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* League route */}
            <Route
              path="/league"
              element={
                <ProtectedRoute>
                  <League />
                </ProtectedRoute>
              }
            />

            {/* Practice routes */}
            <Route
              path="/practice/spares"
              element={
                <ProtectedRoute>
                  <PracticeSpares />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/full"
              element={
                <ProtectedRoute>
                  <PracticeFullGame />
                </ProtectedRoute>
              }
            />

            {/* Match routes */}
            <Route
              path="/match/traditional"
              element={
                <ProtectedRoute>
                  <MatchTraditional />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/baker"
              element={
                <ProtectedRoute>
                  <MatchBaker />
                </ProtectedRoute>
              }
            />

            {/* Stats routes */}
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <PlayerStats />
                </ProtectedRoute>
              }
            />

            {/* Coach routes */}
            <Route
              path="/coach/admin"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <CoachAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/roster"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <RosterManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/notes"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <CoachNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/team-stats"
              element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <TeamStats />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
