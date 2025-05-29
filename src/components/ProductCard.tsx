import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Eye } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId?: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  // No loading states - instant actions
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    checkWishlistStatus();
    // eslint-disable-next-line
  }, [product.id]);

  // إضافة مستمع لتحديث حالة المفضلة عند تغييرها
  useEffect(() => {
    const handleWishlistUpdate = () => {
      checkWishlistStatus();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('productAddedToWishlist', handleWishlistUpdate);
    window.addEventListener('productRemovedFromWishlist', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('productAddedToWishlist', handleWishlistUpdate);
      window.removeEventListener('productRemovedFromWishlist', handleWishlistUpdate);
    };
  }, []);

  const checkWishlistStatus = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      const data = await apiCall(API_ENDPOINTS.WISHLIST_CHECK(user.id, product.id));
      setIsInWishlist(data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // منع فتح صفحة المنتج
    e.stopPropagation(); // منع انتشار الحدث
    
    // No loading state - instant action
    try {
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(product.id, product.name);
        if (success) {
          setIsInWishlist(false);
        }
      } else {
        const success = await addToWishlistUnified(product.id, product.name);
        if (success) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Error in toggleWishlist:', error);
    } finally {
      // No loading state needed
    }
  };

  const isOutOfStock = product.stock <= 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // منع فتح صفحة المنتج
    e.stopPropagation(); // منع انتشار الحدث
    
    // No loading state - instant action
    try {
      const success = await addToCartUnified(product.id, product.name, quantity);
      if (success) {
        // يمكن إضافة أي منطق إضافي هنا إذا لزم الأمر
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
    } finally {
      // No loading state needed
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // ---- LIST VIEW ----
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row p-4 sm:p-6 gap-4 sm:gap-6">
          <div className="relative w-full md:w-48 lg:w-64 h-56 sm:h-64 md:h-72 flex-shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
            <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
              <img
                src={buildImageUrl(product.mainImage)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-pink-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md">
                جديد
              </div>
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl sm:rounded-2xl">
                  <span className="text-white font-semibold bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">
                    نفذت الكمية
                  </span>
                </div>
              )}
            </Link>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
              <button
                onClick={toggleWishlist}
                disabled={false}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
              <Link
                to={`/product/${createProductSlug(product.id, product.name)}`}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 leading-tight hover:text-pink-500 transition-colors duration-200">
                  {product.name}
                </h3>
              </Link>
              <div className="flex flex-col items-center text-center gap-1 mb-2 sm:mb-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                                      <div className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                          {product.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">ر.س</span>
                        <span className="bg-red-500 text-white px-1 sm:px-1.5 py-0.5 rounded-full text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-base sm:text-lg font-bold text-pink-600">
                          {product.price.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">ر.س</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-base sm:text-lg font-bold text-pink-600">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600">ر.س</span>
                    </div>
                  )}
                </div>
                {isOutOfStock && (
                  <p className="text-sm sm:text-base font-semibold text-red-600">نفذت الكمية</p>
                )}
            </div>
            
            {!isOutOfStock && (
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-sm transition-colors duration-200"
                  >
                    -
                  </button>
                  <span className="w-10 sm:w-12 text-center font-semibold text-gray-800 text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-sm transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={addToCart}
                    disabled={false}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>إضافة للسلة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- GRID VIEW - PROFESSIONAL AND MODERN ----
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-80 h-auto group relative mx-auto">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      
      {/* Product Image - Natural Aspect Ratio - Taller */}
      <div className="relative h-96 sm:h-[420px] md:h-[450px] lg:h-96 overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100">
        <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
          <img
            src={buildImageUrl(product.mainImage)}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3';
            }}
          />
        </Link>
        
        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* New Badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-pink-400/30 animate-pulse">
          جديد
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={toggleWishlist}
            disabled={false}
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200 hover:scale-110"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          <Link
            to={`/product/${createProductSlug(product.id, product.name)}`}
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200 hover:scale-110"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Link>
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-xl text-sm shadow-lg border border-red-500">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info - Centered Layout */}
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        {/* Product Name - Centered */}
        <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight hover:text-pink-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        {/* Elegant Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent w-16"></div>
        
        {/* Price - Centered and Prominent */}
        <div className="flex flex-col items-center space-y-2">
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
              <div className="text-2xl font-bold text-pink-600">
                {product.price.toFixed(0)} <span className="text-lg text-gray-600">ر.س</span>
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-pink-600">
              {product.price.toFixed(0)} <span className="text-lg text-gray-600">ر.س</span>
            </div>
          )}
        </div>
        
        {isOutOfStock && (
          <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">نفذت الكمية</p>
        )}
        
        {/* Actions */}
        {!isOutOfStock && (
          <div className="w-full space-y-3 mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-all duration-200 hover:scale-110"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-gray-800 text-lg bg-gray-50 py-1 rounded-lg">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-all duration-200 hover:scale-110"
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={false}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm border border-pink-400/30 hover:scale-105 hover:shadow-xl"
            >
              إضافة للسلة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;