// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import AppProvider from './components/appProvider.jsx';
import { ToastProvider } from './context/toastProvider.jsx';
import { AuthProvider } from './context/authContext.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents unnecessary refetches on focus
      retry: 1, // Number of retries on failure
    },
  },
});

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastProvider>
          <AppProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AppProvider>
        </ToastProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
