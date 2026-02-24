import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import AddStudentPage from './pages/AddStudentPage';
import AddMarksPage from './pages/AddMarksPage';
import StudentDetailPage from './pages/StudentDetailPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
          <Route path="/add-marks" element={<ProtectedRoute><AddMarksPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
