import api from "../config/apiConfig";
import { handleApiError } from "../utils/errorHandler";

//Get list of acrticles
export const getApiEndpoints = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};
// Renamed from getArticles to getAllArticles
export const getAllArticles = async () => {
    try{
        const response = await api.get(`/articles/`);

        return response.data;
    }
    catch(error){
        throw handleApiError(error);
    }
}



const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Define base URL here for clarity

export const getArticleById = async (id) => {
    try{
        // Construct full URL explicitly
        const url = `${API_BASE_URL}/articles/${id}/`; 
        console.log(`Fetching article with URL: ${url}`); // Add console log here
        const response = await api.get(url); 
        return response.data;
    }
    catch(error){
        // Log more detailed error information
        console.error(`Error in getArticleById for ID ${id}:`, error.response || error.message || error); 
        throw handleApiError(error);
    }
}

// Create new article

export const createArticle = async (title, content, categories, tags = []) => {
    try {
        const data = {
            title: title,
            content: content,
            categories: categories, // Use the categories array directly
            tags: tags
        };
        
       
        
        const response = await api.post(`/articles/`,data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

// Update existing article

export const updateArticle = async (id, articleData) => { // Accept the full article data object
    try{
        // Construct full URL explicitly
        const url = `${API_BASE_URL}/articles/${id}/`;
        // Send the entire articleData object
        const response = await api.put(url, articleData); 
        return response.data;
    }
    catch(error){
        throw handleApiError(error);
    }
}

// Delete article by ID

export const deleteArticle = async (id) => {
    try{
        // Construct full URL explicitly
        const url = `${API_BASE_URL}/articles/${id}/`;
        await api.delete(url); 
    }
    catch(error){
        throw handleApiError(error);
    }
}
//Sreach articles
export const getTags = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const config = {};
        
        if (token) {
            config.headers = {
                'Authorization': `Bearer ${token}`
            };
        }
        
        const response = await api.get(`/tags/`, config);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Create a new tag
export const createTag = async (tagData) => {
    try {
        const response = await api.post(`/tags/`, tagData);
        return response.data;
    } catch (error) {
        throw handleApiError(error, "Failed to create tag.");
    }
};

// Update an existing tag
export const updateTag = async (id, tagData) => {
    try {
        const response = await api.put(`/tags/${id}/`, tagData); // Or PATCH
        return response.data;
    } catch (error) {
        throw handleApiError(error, `Failed to update tag ${id}.`);
    }
};

// Delete a tag
export const deleteTag = async (id) => {
    try {
        await api.delete(`/tags/${id}/`);
        // No content returned on successful delete (204)
    } catch (error) {
        throw handleApiError(error, `Failed to delete tag ${id}.`);
    }
};


// --- Categories ---

export const getCategories = async () => {
    try{
        const response = await api.get(`/categories/`);
        return response.data;
    }
    catch(error){
        throw handleApiError(error);
    }
};

// Create a new category
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post(`/categories/`, categoryData);
        return response.data;
    } catch (error) {
        throw handleApiError(error, "Failed to create category.");
    }
};

// Update an existing category
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/categories/${id}/`, categoryData); // Or PATCH
        return response.data;
    } catch (error) {
        throw handleApiError(error, `Failed to update category ${id}.`);
    }
};

// Delete a category
export const deleteCategory = async (id) => {
    try {
        await api.delete(`/categories/${id}/`);
        // No content returned on successful delete (204)
    } catch (error) {
        throw handleApiError(error, `Failed to delete category ${id}.`);
    }
};


// --- Search ---
export const searchArticles = async (query, filters = {}) => {
    try {
      const response = await api.get('/articles/search/', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

export const getArticleComments = async (articleId) => {
    try {
      const response = await api.get(`/articles/${articleId}/comments/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for article ${articleId}:`, error);
      throw error;
    }
  };
