// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext.jsx';
import Home from './components/homePage.jsx';
import Lander from './components/lander.jsx';
import { CurrentRenderProvider } from './context/renderContext.jsx';

const App = () => {

  const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/" replace />;
  }
  const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }

  return (
    <CurrentRenderProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Lander /></PublicRoute>} />
        <Route path="/home" element={<Navigate to="/" replace />} /> {/* redirect */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CurrentRenderProvider>
  );
};

export default App;
