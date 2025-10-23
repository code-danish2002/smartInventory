// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext.jsx';
import { ShowDetails } from './components/showDetails.jsx';
import CreatePO from './components/create-po/createPO.jsx';
import Home from './components/homePage.jsx';
import Lander from './components/lander.jsx';

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
    <Routes>
  <Route path="/login" element={<PublicRoute><Lander /></PublicRoute>} />
  <Route path="/home" element={<Navigate to="/" replace />} /> {/* redirect */}
  <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
  <Route path="/showData" element={<PrivateRoute><ShowDetails /></PrivateRoute>} />
  <Route path="po-inspection/:task" element={<PrivateRoute><CreatePO /></PrivateRoute>} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
  );
};

export default App;
