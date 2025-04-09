import api from "../config/apiConfig";
import { handleApiError } from "../utils/errorHandler";

// Fetches a list of all users (Admin only)
export const getAllUsers = async () => {
    try {
        const response = await api.get(`/admin/users/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw handleApiError(error, "Failed to fetch users. Ensure you are logged in as an admin.");
    }
};

// Fetches site statistics (Admin only)
export const getSiteStats = async () => {
    try {
        const response = await api.get(`/admin/stats/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching site stats:", error);
        throw handleApiError(error, "Failed to fetch site statistics. Ensure you are logged in as an admin.");
    }
};

// Deletes a specific user (Admin only)
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}/`);
        if (response.status === 204) {
            return { success: true, message: "User deleted successfully." };
        }
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw handleApiError(error, `Failed to delete user ${userId}. Ensure you are logged in as an admin.`);
    }
};

// Fetches recent activity logs (Admin only)
export const getActivityLog = async () => {
    try {
        const response = await api.get(`/admin/activity/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching activity log:", error);
        throw handleApiError(error, "Failed to fetch activity log.");
    }
};

// Fetches a list of all available groups
export const getAllGroups = async () => {
    const response = await api.get('/groups/');
    return response.data;
};

// Fetches details for a specific user (Admin only)
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/admin/users/${userId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw handleApiError(error, `Failed to fetch user ${userId}.`);
    }
};

// Updates details for a specific user (Admin only)
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.patch(`/admin/users/${userId}/`, userData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : '';
        throw handleApiError(error, `Failed to update user ${userId}. ${errorDetails}`);
    }
};
