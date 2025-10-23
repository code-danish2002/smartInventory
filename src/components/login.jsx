// src/components/Login.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext.jsx';
import logo from '../assets/RailTel.svg';
import { OnSubmitLoading } from '../utils/icons.jsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed. Please try again.');
      }

      const data = await response.json();
      if (data.access_token && data.user) {
        const expiry = Date.now() + data.expires_in * 1000;
        login(data.access_token, expiry, data.user);
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !username.trim() || !password.trim() || loading;

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-2xl">

        {/* Logo column */}
        <div className="flex items-center justify-center bg-gray-50 w-full md:w-1/2 p-4">
          <div className="w-40 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
            <img
              src={logo}
              alt="RailTel Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Login form column */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-gray-50 px-4 py-6 md:px-6 md:py-8">
          <div className="bg-indigo-500 rounded-full p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 md:h-12 md:w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Sign In</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisabled}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <OnSubmitLoading />
                ) : ( 'Sign in' )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
