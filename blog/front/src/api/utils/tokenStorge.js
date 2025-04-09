const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Access Token
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
  token
    ? localStorage.setItem(ACCESS_TOKEN_KEY, token)
    : localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

// Refresh Token
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token) => {
  token
    ? localStorage.setItem(REFRESH_TOKEN_KEY, token)
    : localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);

// Combined Removal
export const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
