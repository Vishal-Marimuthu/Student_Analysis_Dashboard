import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import AddStudentPage from './pages/AddStudentPage';
import AddMarksPage from './pages/AddMarksPage';
import StudentDetailPage from './pages/StudentDetailPage';
import RankingsPage from './pages/RankingsPage';
import './index.css';

const HomeRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRoute />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['admin']}><StudentDetailPage /></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute allowedRoles={['admin']}><AddStudentPage /></ProtectedRoute>} />
          <Route path="/add-marks" element={<ProtectedRoute allowedRoles={['admin']}><AddMarksPage /></ProtectedRoute>} />
          <Route path="/rankings" element={<ProtectedRoute allowedRoles={['admin']}><RankingsPage /></ProtectedRoute>} />
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
