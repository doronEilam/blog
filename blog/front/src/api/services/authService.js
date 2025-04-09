import api from "../config/apiConfig";
import { handleApiError } from "../utils/errorHandler";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, removeTokens } from "../utils/tokenStorge";

export const login = async (username, password) => {
    try {
        const response = await api.post("/login/", { username, password });
        if (response.data.access) setAccessToken(response.data.access);
        if (response.data.refresh) setRefreshToken(response.data.refresh);
        return response.data;
    } catch (error) {
        removeTokens();
        throw handleApiError(error);
    }
};

export const logout = async () => {
    try {
        const token = getAccessToken();
        if (!token) {
            removeTokens();
            return;
        }
        await api.post("/logout", {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        removeTokens();
    } catch (error) {
        console.error("Logout error:", error);
        removeTokens();
        throw handleApiError(error);
    }
};

export const register = async (username, password, email) => {
    try {
        const response = await api.post("/register", { username, email, password });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get("/user/profile");
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateUserProfile = async (data) => {
    try {
        const response = await api.put("/user/profile", data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const refreshToken = async () => {
    try {
        const currentRefreshToken = getRefreshToken();
        if (!currentRefreshToken) throw new Error("No refresh token available");

        console.log("Attempting token refresh...");
        const response = await api.post("/token/refresh/", { refresh: currentRefreshToken });

        if (response.data.access) {
            setAccessToken(response.data.access);
            console.log("New access token obtained.");
        }
        if (response.data.refresh) {
            setRefreshToken(response.data.refresh);
            console.log("New refresh token obtained.");
        }

        return response.data;
    } catch (error) {
        console.error("Token refresh failed:", error);
        removeTokens();
        throw handleApiError(error);
    }
};
