import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, ShoppingCart, Trash2, Package, ArrowRight, Star, Gift, Sparkles } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified } from '../utils/cartUtils';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  stock: number;
  description: string;
  categoryId?: number;
}

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlistProducts();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistProducts();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const loadWishlistProducts = async () => {
    try {
      setLoading(true);
      
      // Get wishlist IDs from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      let wishlistIds: number[] = [];
      
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          wishlistIds = parsedWishlist;
        }
      }

      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      // Fetch all products
      const allProducts = await apiCall(API_ENDPOINTS.PRODUCTS);
      
      // Filter products that are in wishlist
      const wishlistProducts = allProducts.filter((product: Product) => 
        wishlistIds.includes(product.id)
      );

      setWishlistProducts(wishlistProducts);
    } catch (error) {
      console.error('خطأ في تحميل المفضلة:', error);
      toast.error('فشل في تحميل قائمة المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId: number, productName: string) => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      let currentWishlist: number[] = [];
      
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          currentWishlist = parsedWishlist;
        }
      }

      // Remove from wishlist
      const newWishlist = currentWishlist.filter(id => id !== productId);
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      
      // Update local state
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: newWishlist }));
      
    } catch (error) {
      console.error('خطأ في إزالة المنتج من المفضلة:', error);
    }
  };

  const addToCart = async (productId: number, productName: string) => {
    try {
      const success = await addToCartUnified(productId, productName, 1);
      if (success) {
        // Optional: Remove from wishlist after adding to cart
        // removeFromWishlist(productId, productName);
      }
    } catch (error) {
      console.error('❌ خطأ في إضافة المنتج للسلة:', error);
    }
  };

  const clearWishlist = () => {
    if (!window.confirm('هل أنت متأكد من إفراغ قائمة المفضلة؟')) return;
    
    try {
      // Clear localStorage
      localStorage.setItem('wishlist', JSON.stringify([]));
      
      // Update local state
      setWishlistProducts([]);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: [] }));
      
    } catch (error) {
      console.error('خطأ في إفراغ قائمة المفضلة:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 py-12 sm:py-16 lg:py-20 overflow-hidden flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 py-12 sm:py-16 lg:py-20 overflow-hidden" dir="rtl">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-transparent to-rose-400/10" />
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-rose-400/5 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-white/80 via-amber-50/50 to-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 border border-gray-300/30 shadow-2xl">
              {/* Premium Border Gradient */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-gray-300/40 via-pink-400/50 to-gray-300/40 p-px">
                <div className="w-full h-full bg-gradient-to-br from-white/90 via-amber-50/90 to-white/90 rounded-2xl sm:rounded-3xl" />
              </div>
              
              <div className="relative">
                {/* Premium Icon */}
                <div className="text-5xl sm:text-6xl lg:text-8xl mb-6 sm:mb-8 bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600 bg-clip-text text-transparent">
                  💝
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4 sm:mb-6 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text">
                  قائمة المفضلة فارغة
                </h2>
                
                <div className="h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full mb-6 sm:mb-8 mx-auto w-24 sm:w-32" />
                
                <p className="text-gray-600 mb-8 sm:mb-12 leading-relaxed text-base sm:text-lg font-light px-4">
                  لم تقم بإضافة أي منتجات إلى قائمة المفضلة الخاصة بك بعد. 
                  ابدأ بتصفح المتجر وأضف منتجاتك المفضلة!
                </p>
                
                <div className="space-y-4">
                  <Link 
                    to="/products" 
                    className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl hover:from-pink-600 hover:to-rose-600 font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl backdrop-blur-xl"
                  >
                    🛍️ تصفح المنتجات
                  </Link>
                  <Link 
                    to="/" 
                    className="block w-full bg-gradient-to-r from-white/60 to-gray-100/80 backdrop-blur-xl border border-gray-300/50 text-gray-800 px-10 py-4 rounded-2xl hover:from-white/80 hover:to-gray-100/90 font-bold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🏠 العودة للرئيسية
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 py-20 overflow-hidden" dir="rtl">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-transparent to-rose-400/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-400/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 via-transparent to-gray-900/5" />
      
      <div className="relative container mx-auto px-8 max-w-7xl">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black text-gray-800 mb-4 flex items-center bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text">
                <span className="ml-4 text-6xl bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600 bg-clip-text text-transparent">💝</span>
                قائمة المفضلة
              </h1>
              <div className="h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full mb-4 w-48" />
              <p className="text-gray-600 text-xl font-light">
                لديك {wishlistProducts.length} منتج في قائمة المفضلة
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg backdrop-blur-xl border border-red-500/30"
              >
                <Trash2 className="w-5 h-5 ml-3" />
                إفراغ القائمة
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={buildImageUrl(product.mainImage)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => removeFromWishlist(product.id, product.name)}
                  className="absolute top-3 right-3 w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex flex-col items-center space-y-2 mb-4">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through font-medium">
                          {product.originalPrice.toFixed(0)} ر.س
                        </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                      <div className="text-xl font-bold text-pink-600">
                        {product.price.toFixed(0)} <span className="text-base text-gray-600">ر.س</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xl font-bold text-pink-600">
                      {product.price.toFixed(0)} <span className="text-base text-gray-600">ر.س</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Link
                    to={`/product/${createProductSlug(product.id, product.name)}`}
                    className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold hover:scale-105 hover:shadow-xl text-center"
                  >
                    عرض التفاصيل
                  </Link>
                  
                  {product.stock > 0 && (
                    <button
                      onClick={() => addToCart(product.id, product.name)}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm font-bold hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      إضافة للسلة
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;