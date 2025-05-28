import { buildApiUrl } from '../config/api';

// استخدام النظام الجديد للـ API
const API_BASE = buildApiUrl('');

// Simple cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Fast API call with caching
export const fastApi = async (endpoint: string, options: RequestInit = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Clear cache
export const clearCache = () => {
  cache.clear();
};

// Specific API functions
export const getProducts = () => fastApi('/products');
export const getCategories = () => fastApi('/categories');
export const getProduct = (id: string) => fastApi(`/products/${id}`);
export const getCategory = (id: string) => fastApi(`/categories/${id}`);

export const getUserCart = (userId: string) => fastApi(`/user/${userId}/cart`);
export const getUserWishlist = (userId: string) => fastApi(`/user/${userId}/wishlist`);

// POST requests (no caching)
export const addToCart = (userId: string, data: any) => 
  fastApi(`/user/${userId}/cart`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const addToWishlist = (userId: string, data: any) => 
  fastApi(`/user/${userId}/wishlist`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const removeFromWishlist = (userId: string, productId: string) => 
  fastApi(`/user/${userId}/wishlist/product/${productId}`, {
    method: 'DELETE',
  });

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
}; 