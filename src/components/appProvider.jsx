// src/components/appProvider.jsx

import React from 'react';
import { AuthProvider } from '../context/authContext.jsx';
import ErrorBoundary from './errorBoundary.jsx';

const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
    </AuthProvider>
  );
};

export default AppProvider;
