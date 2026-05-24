import { createHashRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CreateQuiz from '../pages/CreateQuiz';
import EditQuiz from '../pages/EditQuiz';
import GameRoom from '../pages/GameRoom';
import Profile from '../pages/Profile';
import History from '../pages/History';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/create-quiz',
    element: (
      <ProtectedRoute>
        <CreateQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/quiz/:id/edit',
    element: (
      <ProtectedRoute>
        <EditQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game/:gamePin',
    element: (
      <ProtectedRoute>
         <GameRoom />
      </ProtectedRoute>
    ),
  },
]);


export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
