// src/context/authContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { injectAuth } from '../api/apiCall';
import { useToast } from './toastProvider';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: false,
  });

  const [token, setToken] = useState(sessionStorage.getItem('auth_token') || null);
  const [refreshToken, setRefreshToken] = useState(sessionStorage.getItem('refresh_token') || null);
  const [idToken, setIdToken] = useState(JSON.parse(sessionStorage.getItem('id_token')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(JSON.parse(sessionStorage.getItem('username')) || null);
  const [name, setName] = useState(JSON.parse(sessionStorage.getItem('name')) || null);
  const [email, setEmail] = useState(JSON.parse(sessionStorage.getItem('email')) || null);
  const [expiry, setExpiry] = useState(JSON.parse(sessionStorage.getItem('expires_in')) || null);
  const [groups, setGroups] = useState(JSON.parse(sessionStorage.getItem('groups')) || []);
  const [initilizing, setInitilizing] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    const savedAccess = sessionStorage.getItem('auth_token');
    const savedRefresh = sessionStorage.getItem('refresh_token');
    const savedId = sessionStorage.getItem('id_token');
    const savedExpiry = sessionStorage.getItem('expires_in');
    const savedUser = sessionStorage.getItem('username');
    const savedName = sessionStorage.getItem('name');
    const savedEmail = sessionStorage.getItem('email');

    if (savedAccess) {
      setToken(savedAccess);
      setIsAuthenticated(true);
    }
    if (savedRefresh) setRefreshToken(savedRefresh);
    if (savedId) setIdToken(JSON.parse(savedId));
    // ... load other profile details if saved
    if (savedUser) setUsername(JSON.parse(savedUser));
    if (savedName) setName(JSON.parse(savedName));
    if (savedEmail) setEmail(JSON.parse(savedEmail));
    if (savedExpiry) setExpiry(JSON.parse(savedExpiry));

    setInitilizing(false);
  }, []);


  const login = async () => {
    setLoginLoading(true);
    try {
      const { data } = await client.get('/auth/login');
      window.location.href = data.authorization_url;
    } catch (e) {
      console.error('Login failed', e);
      addToast(e);
      setLoginLoading(false);
    }
  };

  const updateNewLogin = async (tokens) => {
    const { access_token, refresh_token, id_token, expires_in, username, name, email, groups } = tokens;
    sessionStorage.setItem('auth_token', access_token);
    sessionStorage.setItem('refresh_token', refresh_token);
    sessionStorage.setItem('id_token', JSON.stringify(id_token));
    sessionStorage.setItem('username', JSON.stringify(username));
    sessionStorage.setItem('name', JSON.stringify(name));
    sessionStorage.setItem('email', JSON.stringify(email));
    sessionStorage.setItem('expires_in', JSON.stringify(expires_in));
    sessionStorage.setItem('groups', JSON.stringify(groups));
    setToken(access_token);
    setRefreshToken(refresh_token);
    setIdToken(id_token);
    setUsername(username);
    setName(name);
    setEmail(email);
    setExpiry(Date.now() + expires_in * 1000);
    setGroups(groups);
    setIsAuthenticated(true);
    setLoginLoading(false);
  }


  const logout = async () => {
  if (!refreshToken) {
    sessionStorage.clear();
    console.log('No refresh token found');
    alert('No refresh token found to logout. Please close the tab and login again.');
    setIsAuthenticated(false);
    navigate('/');
    return;
  }

  try {
    // This should return a plain JSON response with logout URL
    const { data } = await client.post('/logout', {
      refresh_token: refreshToken,
      realm: 'item-inspection',
    });

    // Expect backend to return: { logout_url: "https://sso.app.railtel.in/..." }
    const baseLogoutUrl = new URL(data.logout_url);
    baseLogoutUrl.searchParams.append("id_token_hint", idToken);
    baseLogoutUrl.searchParams.append("post_logout_redirect_uri", window.location.origin + "/");

    // Clear local state
    sessionStorage.clear();
    setIsAuthenticated(false);

    // Redirect from client (not via axios)
    window.location.href = baseLogoutUrl.toString();

  } catch (err) {
    console.error('Logout failed', err);
    addToast(err);
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  }
};


  const manageTokens = (accessToken, newRefreshToken, expiresIn) => {
    if (token !== accessToken) {
      sessionStorage.setItem("auth_token", accessToken);
      setToken(accessToken);
    }
    if (refreshToken !== newRefreshToken) {
      sessionStorage.setItem("refresh_token", newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
    if (expiry !== Date.now() + expiresIn * 1000) {
      sessionStorage.setItem("expires_in", Date.now() + expiresIn * 1000);
      setExpiry(Date.now() + expiresIn * 1000);
    }
  };

  useEffect(() => {
    injectAuth({
      getRefreshToken: () => refreshToken,
      getAccessToken: () => token,
      manageTokens,
      logout
    });
  }, [refreshToken]);

  if (initilizing) {
    return null; // or a spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, updateNewLogin, token, username, name, email, groups, login, logout, loading: loginLoading }}>
      {children}
    </AuthContext.Provider>

  );
};
