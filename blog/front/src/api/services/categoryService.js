import api from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandler';

export const getAllCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createCategory = async (name) => {
  try {
    const response = await api.post('/api/categories', { name });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateCategory = async (id, name) => {
  try {
    const response = await api.put(`/api/categories/${id}`, { name });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteCategory = async (id) => {
  try {
    await api.delete(`/api/categories/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
