const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function storeTokens(tokens) {
  if (!tokens || !tokens.access || !tokens.refresh) {
    console.error("Invalid tokens provided");
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

function getTokens() {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!access || !refresh) {
    return null;
  }

  return { access, refresh };
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function isTokenExpired(token) {
  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    return now >= expiry;
  } catch (e) {
    console.error("Error checking token expiry:", e);
    return true;
  }
}

function isAuthenticated() {
  const tokens = getTokens();
  return tokens !== null && !isTokenExpired(tokens.access);
}

async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens || !tokens.refresh) {
    return Promise.reject("No refresh token available");
  }

  try {
    const response = await fetch("/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      clearTokens();
      return Promise.reject(errorData);
    }

    const newTokens = await response.json();
    storeTokens({
      access: newTokens.access,
      refresh: newTokens.refresh || tokens.refresh,
    });

    return newTokens;
  } catch (error) {
    clearTokens();
    return Promise.reject(error);
  }
}

async function getAuthHeaders() {
  const tokens = getTokens();

  if (!tokens) {
    return {};
  }

  if (isTokenExpired(tokens.access)) {
    try {
      const newTokens = await refreshAccessToken();
      return {
        Authorization: `Bearer ${newTokens.access}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return {};
    }
  }

  return {
    Authorization: `Bearer ${tokens.access}`,
    "Content-Type": "application/json",
  };
}

async function authenticatedFetch(url, options = {}) {
  try {
    const authHeaders = await getAuthHeaders();
    const mergedOptions = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      const data = await response.json();
      if (data.code === "token_not_valid" || data.code === "token_expired") {
        try {
          await refreshAccessToken();
          const newAuthHeaders = await getAuthHeaders();
          const retryOptions = {
            ...options,
            headers: {
              ...newAuthHeaders,
              ...options.headers,
            },
          };
          return fetch(url, retryOptions);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          clearTokens();
          window.location.href = "/login?expired=true";
          return Promise.reject("Authentication failed");
        }
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    return Promise.reject(error);
  }
}

export {
  storeTokens,
  getTokens,
  clearTokens,
  isAuthenticated,
  refreshAccessToken,
  getAuthHeaders,
  authenticatedFetch,
};
