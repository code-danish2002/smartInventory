// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext.jsx';
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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Lander /></PublicRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/showData" element={<PrivateRoute><ShowDetails /></PrivateRoute>} />
        <Route path="/create-new-po" element={<PrivateRoute><CreatePO /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
