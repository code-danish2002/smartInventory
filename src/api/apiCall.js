import axios from 'axios';

// ——— 1) create your instance ———
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// holders for your auth callbacks
let getRefreshTokenFn, getAccessTokenFn, doManageTokens, doLogout;
export function injectAuth({ getRefreshToken, getAccessToken, manageTokens, logout }) {
  getRefreshTokenFn = getRefreshToken;
  getAccessTokenFn = getAccessToken;
  doManageTokens = manageTokens;
  doLogout = logout;
}

// ——— 2) request interceptor: add the latest access token ———
api.interceptors.request.use((config) => {
  //console.log('token', sessionStorage.getItem('auth_token'), 'tokenVia', getAccessTokenFn());
  const token = sessionStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ——— 3) response interceptor: refresh + retry logic ———
let isRefreshing = false;
let refreshCall = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config: originalRequest } = error;
    // 1) If this is the login/refresh/logout endpoint, just reject
    if (originalRequest.url.includes('/login')
        || originalRequest.url.includes('/refresh')
        || originalRequest.url.includes('/logout')) {
         return Promise.reject(error);
       }

    if (response?.status === 401 && !originalRequest._retry) {
      // mark this request so we don't re-refresh for it
      originalRequest._retry = true;

      // if we're not already refreshing, kick off the call
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = getRefreshTokenFn();

        refreshCall = api.post('/refresh', {refresh_token: refreshToken}, { })
          .then(({ data }) => {
            const { access_token, refresh_token, expires_in } = data;
            //console.log('refresh token', data, 'access token', access_token, 'refresh token', refresh_token, 'expires in', expires_in);
            doManageTokens(access_token, refresh_token, expires_in);
            return access_token;
          })
          .catch((err) => {
            doLogout();
            console.error(err);
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // once refreshCall resolves, retry the original request
      return await refreshCall.then((newAccessToken) => {
        // re-attach header (and body is still in originalRequest.data)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      });
    }

    // for any other errors (or if we've already retried) just pass it along
    return Promise.reject(error);
  }
);

export default api;
