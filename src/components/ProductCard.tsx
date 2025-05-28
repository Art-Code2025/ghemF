import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Eye } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { buildImageUrl } from '../config/api';


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
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      if (!user?.id) return;
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/wishlist/check/${product.id}`);
      const data = await response.json();
      setIsInWishlist(data.isInWishlist);
    } catch {
      setIsInWishlist(false);
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
          <div className="relative w-full md:w-48 lg:w-64 h-48 sm:h-56 md:h-64 flex-shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
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
                  <Link
                    to={`/product/${createProductSlug(product.id, product.name)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- GRID VIEW - SIMPLE AND CLEAN ----
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/60 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-72 h-auto min-h-[480px] sm:min-h-[520px] lg:h-[540px]">
      {/* Product Image */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-2xl sm:rounded-t-3xl group-hover:rounded-t-xl transition-all duration-500">
        <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
          <img
            src={buildImageUrl(product.mainImage)}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3';
            }}
          />
        </Link>
        
        {/* New Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-pink-400/30">
          جديد
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
          <button
            onClick={toggleWishlist}
            disabled={false}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          <Link
            to={`/product/${createProductSlug(product.id, product.name)}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          </Link>
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-lg">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col h-auto min-h-[200px] sm:min-h-[244px]">
        <Link to={`/product/${createProductSlug(product.id, product.name)}`}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 mt-1 sm:mt-2 leading-tight hover:text-pink-500 transition-colors duration-200 min-h-[2rem] sm:min-h-[2.5rem] line-clamp-2 text-center">
            {product.name}
          </h3>
        </Link>
        
        {/* Elegant Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full mb-2 mx-auto w-10 sm:w-12" />
        
        {/* Price */}
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
          <p className="text-xs sm:text-sm font-semibold text-red-600 mb-2 sm:mb-3">نفذت الكمية</p>
        )}
        
        {/* Actions */}
        {!isOutOfStock && (
          <div className="mt-auto space-y-2 sm:space-y-2.5">
            {/* Quantity Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm transition-colors duration-200"
              >
                -
              </button>
              <span className="w-6 sm:w-8 text-center font-semibold text-gray-800 text-xs sm:text-sm">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm transition-colors duration-200"
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={false}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm border border-pink-400/30 flex items-center justify-center gap-1 sm:gap-2"
            >
              <span>إضافة للسلة</span>
            </button>
            
            {/* View Details Button */}
            <Link
              to={`/product/${createProductSlug(product.id, product.name)}`}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>عرض التفاصيل</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;