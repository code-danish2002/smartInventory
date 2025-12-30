// src/components/appProvider.jsx

import React from 'react';
import ErrorBoundary from './errorBoundary.jsx';

const AppProvider = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default AppProvider;
