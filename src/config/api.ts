// API Configuration for different environments
export const API_CONFIG = {
  // للتطوير المحلي
  development: {
    baseURL: 'http://localhost:3001',
  },
  // للإنتاج - PRODUCTION READY 🚀
  production: {
    baseURL: 'https://api.ghem.store', // Custom domain for backend
  }
};

// الحصول على الـ base URL حسب البيئة
export const getApiBaseUrl = (): string => {
  // أولاً: تحقق من Environment Variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // ثانياً: تحقق من البيئة
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;
};

const API_BASE_URL_PRODUCTION = 'https://ghem.store'; // Your production backend URL
const API_BASE_URL_DEVELOPMENT = 'http://localhost:3001';

// Vite provides env variables on `import.meta.env`
const isProduction = import.meta.env.PROD;

// دالة ذكية لبناء رابط الـ API بناءً على بيئة التشغيل
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = isProduction ? API_BASE_URL_PRODUCTION : API_BASE_URL_DEVELOPMENT;
  
  // يضمن عدم وجود شرطات مائلة مزدوجة
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  const finalUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
  console.log(`[buildApiUrl] Environment: ${isProduction ? 'Production' : 'Development'}, Final URL: ${finalUrl}`);
  
  return finalUrl;
};

// دالة مساعدة لبناء URL الصور - محدثة
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:image/')) return imagePath;
  
  const baseUrl = getApiBaseUrl();
  
  // إذا كان المسار يبدأ بـ /images/ فهو مسار نسبي من الباك إند
  if (imagePath.startsWith('/images/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // إذا كان المسار يبدأ بـ images/ بدون slash
  if (imagePath.startsWith('images/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  // إذا كان مسار عادي، أضف /images/ قبله
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}/images${cleanPath}`;
};

// دالة مركزية لجميع API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// تصدير الثوابت المفيدة
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id: string | number) => `products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `products/category/${categoryId}`,
  PRODUCT_REVIEWS: (id: string | number) => `products/${id}/reviews`,
  PRODUCT_DEFAULT_OPTIONS: (productType: string) => `products/default-options/${encodeURIComponent(productType)}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id: string | number) => `categories/${id}`,
  
  // Cart
  USER_CART: (userId: string | number) => `user/${userId}/cart`,
  CART_UPDATE_OPTIONS: (userId: string | number) => `user/${userId}/cart/update-options`,
  CART_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/cart/product/${productId}`,
  
  // Wishlist
  USER_WISHLIST: (userId: string | number) => `user/${userId}/wishlist`,
  WISHLIST_CHECK: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/check/${productId}`,
  WISHLIST_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/product/${productId}`,
  
  // Orders
  CHECKOUT: 'checkout',
  ORDERS: 'orders',
  ORDER_BY_ID: (id: string | number) => `orders/${id}`,
  ORDER_STATUS: (id: string | number) => `orders/${id}/status`,
  
  // Auth
  SEND_OTP: 'auth/send-otp',
  VERIFY_OTP: 'auth/verify-otp',
  COMPLETE_REGISTRATION: 'auth/complete-registration',
  
  // Coupons
  COUPONS: 'coupons',
  VALIDATE_COUPON: 'coupons/validate',
  COUPON_BY_ID: (id: string | number) => `coupons/${id}`,
  
  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_STATS: 'customers/stats',
  CUSTOMER_BY_ID: (id: string | number) => `customers/${id}`,
  
  // Health Check
  HEALTH: 'health',
  
  // Services (if needed)
  SERVICES: 'services',
  SERVICE_BY_ID: (id: string | number) => `services/${id}`,
  
  // Authentication endpoints
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
}; 