import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TutorialPage } from './pages/TutorialPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateCirclePage } from './pages/CreateCirclePage';
import { CirclePage } from './pages/CirclePage';
import { NewStoryPage } from './pages/NewStoryPage';
import { StoryPage } from './pages/StoryPage';
import {
  AdminLayout,
  AdminDashboard,
  AdminUsersPage,
  AdminUserDetailPage,
  AdminCirclesPage,
  AdminCircleDetailPage,
  AdminStoriesPage,
  AdminStoryDetailPage,
} from './pages/admin';
import { AcceptInvitationPage } from './pages/AcceptInvitationPage';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/tutorial"
        element={
          <PrivateRoute>
            <TutorialPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-circle"
        element={
          <PrivateRoute>
            <CreateCirclePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/circles/:id"
        element={
          <PrivateRoute>
            <CirclePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/circles/:circleId/new-story"
        element={
          <PrivateRoute>
            <NewStoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/stories/:id"
        element={
          <PrivateRoute>
            <StoryPage />
          </PrivateRoute>
        }
      />

      {/* Invitation Route */}
      <Route path="/invitations/:token" element={<AcceptInvitationPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
        <Route path="circles" element={<AdminCirclesPage />} />
        <Route path="circles/:id" element={<AdminCircleDetailPage />} />
        <Route path="stories" element={<AdminStoriesPage />} />
        <Route path="stories/:id" element={<AdminStoryDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
