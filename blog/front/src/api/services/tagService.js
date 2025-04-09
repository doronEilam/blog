import api from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandler';

export const getAllTags = async () => {
  try {
    const response = await api.get('/tags');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createTag = async (tag) => {
  try {
    const response = await api.post('/tags', tag);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTag = async (id, tag) => {
  try {
    const response = await api.put(`/tags/${id}`, tag);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteTag = async (id) => {
  try {
    await api.delete(`/tags/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
