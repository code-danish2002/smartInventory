// src/components/ErrorBoundary.jsx
import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          {/* Icon */}
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.29 3.86L1.82 18a2.25 2.25 0 001.94 3.4h16.48a2.25 2.25 0 001.94-3.4L13.71 3.86a2.25 2.25 0 00-3.42 0zM12 9v4m0 4h.01"
              />
            </svg>
          </div>

          {/* Text */}
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong.
          </h1>
          <p className="text-gray-600 text-center mb-6 max-w-sm">
            We’re having trouble completing your request. Please try refreshing,
            or head back to the dashboard.
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
            >
              Reload page
            </button>
            <button
              onClick={() => {
                localStorage.currentRender = 'Dashboard';
                window.location.href = '/';
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded shadow"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
