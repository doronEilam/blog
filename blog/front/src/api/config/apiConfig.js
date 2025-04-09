import axios from 'axios';
import { setupInterceptors } from './interceptors';

const API_URL ='http://127.0.0.1:8000/api';

const api=axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true 
});

setupInterceptors(api);

export default api;