// API Configuration for different environments
export const API_CONFIG = {
  // للتطوير المحلي
  development: {
    baseURL: 'http://localhost:3001',
  },
  // للإنتاج
  production: {
    baseURL: 'https://your-backend-domain.com', // غير هذا إلى رابط السيرفر الحقيقي
  }
};

// الحصول على الـ base URL حسب البيئة
export const getApiBaseUrl = (): string => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;
};

// دالة مساعدة لبناء URL كامل
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // إزالة الـ slash الأول من endpoint إذا كان موجود
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// دالة مساعدة لبناء URL الصور
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:image/')) return imagePath;
  
  const baseUrl = getApiBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

// تصدير الثوابت المفيدة
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'api/products',
  PRODUCT_BY_ID: (id: string | number) => `api/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `api/products/category/${categoryId}`,
  PRODUCT_REVIEWS: (id: string | number) => `api/products/${id}/reviews`,
  PRODUCT_DEFAULT_OPTIONS: (productType: string) => `api/products/default-options/${encodeURIComponent(productType)}`,
  
  // Categories
  CATEGORIES: 'api/categories',
  CATEGORY_BY_ID: (id: string | number) => `api/categories/${id}`,
  
  // Cart
  USER_CART: (userId: string | number) => `api/user/${userId}/cart`,
  CART_UPDATE_OPTIONS: (userId: string | number) => `api/user/${userId}/cart/update-options`,
  CART_PRODUCT: (userId: string | number, productId: string | number) => `api/user/${userId}/cart/product/${productId}`,
  
  // Wishlist
  USER_WISHLIST: (userId: string | number) => `api/user/${userId}/wishlist`,
  WISHLIST_CHECK: (userId: string | number, productId: string | number) => `api/user/${userId}/wishlist/check/${productId}`,
  WISHLIST_PRODUCT: (userId: string | number, productId: string | number) => `api/user/${userId}/wishlist/product/${productId}`,
  
  // Orders
  CHECKOUT: 'api/checkout',
  ORDERS: 'api/orders',
  ORDER_BY_ID: (id: string | number) => `api/orders/${id}`,
  ORDER_STATUS: (id: string | number) => `api/orders/${id}/status`,
  
  // Auth
  SEND_OTP: 'api/auth/send-otp',
  VERIFY_OTP: 'api/auth/verify-otp',
  COMPLETE_REGISTRATION: 'api/auth/complete-registration',
  
  // Coupons
  COUPONS: 'api/coupons',
  VALIDATE_COUPON: 'api/coupons/validate',
  COUPON_BY_ID: (id: string | number) => `api/coupons/${id}`,
  
  // Customers
  CUSTOMERS: 'api/customers',
  CUSTOMER_STATS: 'api/customers/stats',
  CUSTOMER_BY_ID: (id: string | number) => `api/customers/${id}`,
  
  // Health Check
  HEALTH: 'api/health',
  
  // Services (if needed)
  SERVICES: 'api/services',
  SERVICE_BY_ID: (id: string | number) => `api/services/${id}`,
}; 