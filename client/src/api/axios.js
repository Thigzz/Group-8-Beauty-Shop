import axios from 'axios';

// Using the backend URL from your README
const API_BASE_URL = 'https://group-8-beauty-shop.onrender.com'; //

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;