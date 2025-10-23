// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import AppProvider from './components/appProvider.jsx';
import { ToastProvider } from './context/toastProvider.jsx';
import { AuthProvider } from './context/authContext.jsx';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </AppProvider>
    </Router>
  </React.StrictMode>
);
