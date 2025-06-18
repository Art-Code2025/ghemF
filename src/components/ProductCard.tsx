import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Eye, Package, ShoppingCart } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

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
    e.preventDefault();
    e.stopPropagation();
    
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
    }
  };

  const isOutOfStock = product.stock <= 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product has required options
    if (product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required)) {
      const productPath = `/product/${createProductSlug(product.id, product.name)}`;
      navigate(productPath);
      return;
    }
    
    try {
      const success = await addToCartUnified(product.id, product.name, quantity);
      if (success) {
        console.log('✅ Product added to cart successfully');
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
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

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, product.name)}`;
    navigate(productPath);
  };

  // ---- LIST VIEW ----
  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="flex flex-col md:flex-row p-4 gap-4">
          <div className="relative w-full md:w-48 h-48 md:h-64 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={buildImageUrl(product.mainImage)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              جديد
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-lg text-sm">
                  نفذت الكمية
                </span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <button
                onClick={toggleWishlist}
                className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight hover:text-pink-500 transition-colors duration-200">
                {product.name}
              </h3>
              <div className="flex flex-col items-start gap-1 mb-2">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-400 line-through font-medium">
                        {product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">ر.س</span>
                      <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-pink-600">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-base text-gray-600">ر.س</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-pink-600">
                      {product.price.toFixed(2)}
                    </span>
                    <span className="text-base text-gray-600">ر.س</span>
                  </div>
                )}
              </div>
              {isOutOfStock && (
                <p className="text-base font-semibold text-red-600">نفذت الكمية</p>
              )}
            </div>
            
            {!isOutOfStock && (
              <div className="space-y-3 mt-4">
                {/* Required Options Indicator */}
                {product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required) && (
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200 text-center">
                    يتطلب اختيار المقاسات
                  </div>
                )}
                
                {/* Only show quantity controls if product doesn't need required options */}
                {!(product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required)) && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-800">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={addToCart}
                    className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                      product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required)
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-pink-500 hover:bg-pink-600'
                    }`}
                  >
                    {product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required) ? (
                      <>
                        <Package className="w-4 h-4" />
                        <span>اختر المقاسات</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>إضافة للسلة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- GRID VIEW - OPTIMIZED FOR PERFORMANCE ----
  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 w-full max-w-[280px] sm:max-w-xs mx-auto cursor-pointer group"
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative h-[280px] sm:h-[320px] overflow-hidden rounded-t-2xl bg-gray-50">
        <img
          src={buildImageUrl(product.mainImage)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3';
          }}
        />
        
        {/* New Badge - Top Left */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          جديد
        </div>
        
        {/* Wishlist Button - Top Right - FIXED POSITIONING */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={toggleWishlist}
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200 hover:scale-105"
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-xl text-sm shadow-lg border border-red-500">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
        {/* Product Name */}
        <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight hover:text-pink-600 transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent w-12"></div>
        
        {/* Price */}
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
        
        {isOutOfStock && (
          <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">نفذت الكمية</p>
        )}
        
        {/* Required Options Indicator */}
        {product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required) && (
          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
            يتطلب اختيار المقاسات
          </div>
        )}
        
        {/* Actions */}
        {!isOutOfStock && (
          <div className="w-full space-y-3 mt-4">
            {/* Only show quantity controls if product doesn't need required options */}
            {!(product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required)) && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-colors duration-200"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-gray-800 text-lg bg-gray-50 py-1 rounded-lg">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-colors duration-200"
                >
                  +
                </button>
              </div>
            )}
            
            <button
              onClick={addToCart}
              className={`w-full px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required)
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
              }`}
            >
              {product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required) ? (
                <>
                  <Package className="w-4 h-4" />
                  <span>اختر المقاسات</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>إضافة للسلة</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;