import api from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandler';

/**
 * Fetches all comments. 
 * Assumes backend permissions might restrict this for non-admins.
 */
export const getAllComments = async () => {
    try {
        // Assumes the /api/comments/ endpoint lists all comments
        // The interceptor should handle authentication
        const response = await api.get('/comments/');
        // Check if data is nested under 'results' for pagination
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        console.error("Error fetching all comments:", error);
        throw handleApiError(error, "Failed to fetch comments.");
    }
};

/**
 * Fetches comments specifically for a given article ID.
 */
export const getArticleComments = async (articleId) => {
    try {
        // Uses the dedicated endpoint for article-specific comments
        const response = await api.get(`/articles/${articleId}/comments/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        console.error(`Error fetching comments for article ${articleId}:`, error);
        throw handleApiError(error, `Failed to fetch comments for article ${articleId}.`);
    }
};

/**
 * Fetches replies for a specific comment ID.
 */
export const getCommentReplies = async (commentId) => {
    try {
        const response = await api.get(`/comments/${commentId}/replies/`);
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
        console.error(`Error fetching replies for comment ${commentId}:`, error);
        throw handleApiError(error, `Failed to fetch replies for comment ${commentId}.`);
    }
};

/**
 * Creates a new comment.
 */
export const createComment = async (commentData) => {
    try {
        // Use the configured axios instance 'api' which handles auth interceptors
        const response = await api.post('/comments/', commentData);
        // Axios automatically throws for non-2xx responses,
        // and response.data should already be parsed JSON
        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        // Use the centralized error handler
        throw handleApiError(error, "Failed to create comment.");
    }
};

/**
 * Updates an existing comment.
 */
export const updateComment = async (commentId, updatedData) => {
    // updatedData should contain fields to update, e.g., { content: string }
    try {
        const response = await api.put(`/comments/${commentId}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating comment ${commentId}:`, error);
        throw handleApiError(error, "Failed to update comment.");
    }
};

/**
 * Deletes a comment by its ID.
 * Requires appropriate permissions (author or admin).
 */
export const deleteComment = async (commentId) => {
    try {
        console.log(`Attempting to delete comment ID: ${commentId}`);
        // Axios interceptor handles the standard Authorization header.
        // Keep custom headers if absolutely necessary for backend debugging.
        const headers = {
            'X-Debug-User': 'true', // Keep if needed for backend debugging
            // 'Authorization': `Bearer ${token}` // REMOVED - Handled by interceptor
        };
        
        console.log('Delete request custom headers (if any):', headers);
        
        // Send delete request
        const response = await api.delete(`/comments/${commentId}/`, { headers }); // Pass headers if needed
        console.log('Delete comment successful:', response.status); // Log status
        // DRF typically returns 204 No Content on successful delete, response.data might be empty
        return { status: response.status, message: "Comment deleted successfully" }; 
    } catch (error) {
        console.error(`Error deleting comment ${commentId}:`, error);
        // Let handleApiError format the error message
        throw handleApiError(error, `Failed to delete comment ${commentId}.`);
    }
};

/**
 * Fetches a comment by its ID.
 */
export const getCommentById = async (commentId) => {
  const response = await api.get(`/comments/${commentId}/`); // שים לב לנתיב
  return response.data;
};
