import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Menu, X, Search, ShoppingCart, Heart, Package, Gift, Sparkles, ArrowLeft, Plus, Minus, Star, Users, Shield, Crown, Truck, Medal, Award, Tag, Zap } from 'lucide-react';
import { FaInstagram, FaTiktok, FaSnapchatGhost, FaWhatsapp } from 'react-icons/fa';import { FaUser } from 'react-icons/fa';
// Import components directly for debugging
import ImageSlider from './components/ImageSlider';
import ProductCard from './components/ProductCard';
import WhatsAppButton from './components/WhatsAppButton';
import cover1 from './assets/cover1.jpg';
import { createCategorySlug, createProductSlug } from './utils/slugify';
import cover2 from './assets/cover2.jpg';
import cover3 from './assets/cover3.jpg';
import { apiCall, API_ENDPOINTS, buildImageUrl } from './config/api';
import { addToCartUnified } from './utils/cartUtils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface CategoryProducts {
  category: Category;
  products: Product[];
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  // Add quantity state for mobile cards
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});

  const heroImages = [cover1, cover2, cover3];

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        // المستخدم مسجل - لا نحتاج لعد العناصر هنا، Navbar سيتولى ذلك
        return;
      }
      
      // المستخدم غير مسجل - عد من localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(cart)) {
        const totalCount = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleCategoriesUpdate = () => {
    fetchCategoriesWithProducts();
  };

  useEffect(() => {
    fetchCategoriesWithProducts();

    // Add event listeners for real-time updates
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('productsUpdated', handleCategoriesUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('productsUpdated', handleCategoriesUpdate);
    };
  }, []);

  const fetchCategoriesWithProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and products
      const [categoriesData, productsData] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORIES),
        apiCall(API_ENDPOINTS.PRODUCTS)
      ]);

      // Group products by category and sort by creation date
      const categoryProductsMap: { [key: number]: Product[] } = {};

      productsData.forEach((product: Product) => {
        if (product.categoryId) {
          if (!categoryProductsMap[product.categoryId]) {
            categoryProductsMap[product.categoryId] = [];
          }
          categoryProductsMap[product.categoryId].push(product);
        }
      });

      // Sort products within each category by creation date (newest first)
      Object.keys(categoryProductsMap).forEach(categoryId => {
        categoryProductsMap[parseInt(categoryId)].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      });

      // Create category products array with products
      const categoryProductsArray: CategoryProducts[] = categoriesData
        .filter((category: Category) => categoryProductsMap[category.id] && categoryProductsMap[category.id].length > 0)
        .map((category: Category) => ({
          category,
          products: categoryProductsMap[category.id].slice(0, 8) // Limit to 8 products per category
        }));

      setCategoryProducts(categoryProductsArray);
      
      // Initialize quantities for all products
      const initialQuantities: {[key: number]: number} = {};
      categoryProductsArray.forEach(cp => {
        cp.products.forEach(product => {
          initialQuantities[product.id] = 1;
        });
      });
      setQuantities(initialQuantities);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('حدث خطأ أثناء جلب البيانات');
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Quantity handlers for mobile cards
  const handleQuantityDecrease = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const handleQuantityIncrease = (productId: number, maxStock: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.min(maxStock, (prev[productId] || 1) + 1)
    }));
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      const quantity = quantities[productId] || 1;
      
      // البحث عن المنتج للحصول على السعر والصورة
      let productPrice = 0;
      let productImage = '';
      
      // البحث في جميع الكاتيجوريات عن المنتج
      for (const categoryData of categoryProducts) {
        const product = categoryData.products.find(p => p.id === productId);
        if (product) {
          productPrice = product.price;
          productImage = product.mainImage;
          break;
        }
      }
      
      console.log('🛒 [App] Adding to cart:', { productId, productName, quantity, productPrice, productImage });
      
      const success = await addToCartUnified(productId, productName, quantity, {}, {}, productPrice, productImage);
      if (success) {
        console.log('✅ [App] Successfully added to cart');
        // إعادة تعيين الكمية إلى 1 بعد الإضافة الناجحة
        setQuantities(prev => ({ ...prev, [productId]: 1 }));
      } else {
        console.log('❌ [App] Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ [App] Error in handleAddToCart:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000); // Faster slide transition
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  // No loading screen - instant display

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden" dir="rtl">
      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .snap-x {
            scroll-snap-type: x mandatory;
          }
          .snap-start {
            scroll-snap-align: start;
          }
          .snap-mandatory {
            scroll-snap-type: x mandatory;
          }
          
          /* Smooth scrolling for mobile */
          @media (max-width: 640px) {
            .mobile-scroll {
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
            }
          }
          
          /* Enhanced mobile card animations */
          @media (max-width: 640px) {
            .mobile-card {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              transform-origin: center;
            }
            .mobile-card:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
          }
          
          /* Loading skeleton animation */
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
          }
          
          /* Premium hover effects */
          .premium-hover {
            position: relative;
            overflow: hidden;
          }
          .premium-hover::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          .premium-hover:hover::before {
            left: 100%;
          }
          
          /* Ensure social media icons are visible on mobile */
          .social-media-icons {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        `}
      </style>
      <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
      
      {/* Premium Hero Slider - أبعاد مضبوطة بدون فراغات */}
      <section className="relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[450px] overflow-hidden -mt-16 sm:-mt-20 lg:-mt-24">
        <div className="absolute inset-0">
          <ImageSlider images={heroImages} currentIndex={currentSlide} />
        </div>
        
        {/* Modern Navigation Buttons - لون موحد رمادي */}
        <button
          onClick={prevSlide}
          className="absolute right-3 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 bg-gray-800/70 backdrop-blur-xl border border-white/30 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-full hover:bg-gray-800/90 shadow-2xl z-30 group transition-all duration-300"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute left-3 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 bg-gray-800/70 backdrop-blur-xl border border-white/30 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-full hover:bg-gray-800/90 shadow-2xl z-30 group transition-all duration-300"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </button>
      </section>
      
      {/* Premium Collection Section - بدون فراغات */}
      <section className="relative py-4 sm:py-6 lg:py-8 overflow-hidden">
        {/* Premium Background Effects - ألوان متناسقة */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 via-white/80 to-gray-100/60" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-300/20 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Header with Icons - تقليل الهوامش */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-sm">
                مجموعاتنا المميزة
              </h2>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600 animate-pulse" />
            </div>
            <div className="h-1.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full mb-2 sm:mb-3 mx-auto w-24 sm:w-32 lg:w-40 shadow-lg" />
            <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed px-4 mb-2">
              اكتشف تشكيلة متنوعة من المجموعات الحصرية المصممة خصيصاً لتناسب جميع أذواقكم الرفيعة
            </p>
            <div className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-xl border border-gray-200/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700 font-bold">{categoryProducts.length} مجموعة متاحة</span>
            </div>
          </div>
          
          {/* عرض Categories فوراً بدون شرط */}
          {categoryProducts.length > 0 ? (
            <>
              {/* Mobile: Horizontal Scroll */}
              <div className="block sm:hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
                  {categoryProducts.map((categoryProduct, index) => (
                    <div key={categoryProduct.category.id} className="flex-shrink-0 w-72 snap-start">
                      <Link to={`/category/${createCategorySlug(categoryProduct.category.id, categoryProduct.category.name)}`}>
                        <div className="relative bg-gradient-to-br from-white via-pink-50/50 to-white backdrop-blur-xl rounded-2xl overflow-hidden border border-pink-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-pink-300/80">
                          <div className="relative">
                            {/* Category Image - Taller */}
                            <div className="relative h-64 overflow-hidden rounded-t-2xl">
                              <img
                                src={buildImageUrl(categoryProduct.category.image)}
                                alt={categoryProduct.category.name}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                                onError={(e) => {
                                  e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3`;
                                }}
                              />
                              
                              {/* Premium Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-pink-500/20 to-transparent" />
                              
                              {/* Category Number Badge */}
                              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-pulse">
                                {index + 1}
                              </div>
                            </div>
                            
                            {/* Category Info */}
                            <div className="relative p-4 bg-gradient-to-b from-white to-pink-50/30">
                              <div className="text-center">
                                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                                  {categoryProduct.category.name}
                                </h3>
                                
                                <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full mb-3 mx-auto w-12" />
                                
                                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                  {categoryProduct.category.description || 'اكتشف مجموعة متنوعة من المنتجات عالية الجودة'}
                                </p>
                                
                                {/* Luxury Button */}
                                <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white px-5 py-2.5 rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 shadow-xl backdrop-blur-xl border-2 border-pink-400/40 inline-flex items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:scale-110 text-sm group">
                                  <span className="group-hover:translate-x-1 transition-transform duration-300">استكشف مجموعاتنا</span>
                                  <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                {/* Scroll Indicators */}
                <div className="flex justify-center mt-2">
                  <div className="flex gap-1">
                    {categoryProducts.map((_, idx) => (
                      <div key={idx} className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300 hover:bg-pink-500"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className={`hidden sm:grid gap-4 sm:gap-6 lg:gap-8 ${
                categoryProducts.length === 1 ? 'grid-cols-1 max-w-sm sm:max-w-md mx-auto' :
                categoryProducts.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl sm:max-w-4xl mx-auto' :
                categoryProducts.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                categoryProducts.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              }`}>
                {categoryProducts.map((categoryProduct, index) => (
                  <div key={categoryProduct.category.id} className="relative group">
                    <Link to={`/category/${createCategorySlug(categoryProduct.category.id, categoryProduct.category.name)}`}>
                      <div className="relative bg-gradient-to-br from-white via-pink-50/50 to-white backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-pink-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-pink-300/80">
                        
                        <div className="relative">
                          {/* Category Image - Taller */}
                          <div className="relative h-60 sm:h-68 md:h-76 lg:h-84 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
                            <img
                              src={buildImageUrl(categoryProduct.category.image)}
                              alt={categoryProduct.category.name}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                              onError={(e) => {
                                e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3`;
                              }}
                            />
                            
                            {/* Premium Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-pink-500/20 to-transparent" />
                            
                            {/* Category Number Badge */}
                            <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg animate-pulse">
                              {index + 1}
                            </div>
                          </div>
                          
                          {/* Category Info */}
                          <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-white to-pink-50/30">
                            <div className="text-center">
                              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                                {categoryProduct.category.name}
                              </h3>
                              
                              <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full mb-3 sm:mb-4 mx-auto w-12 sm:w-16" />
                              
                              <p className="text-responsive-sm text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-2">
                                {categoryProduct.category.description || 'اكتشف مجموعة متنوعة من المنتجات عالية الجودة'}
                              </p>
                              
                              {/* Luxury Button */}
                              <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white px-5 sm:px-7 lg:px-9 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold hover:from-pink-600 hover:to-rose-600 shadow-xl backdrop-blur-xl border-2 border-pink-400/40 inline-flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:shadow-2xl hover:scale-110 text-sm sm:text-base group">
                                <span className="group-hover:translate-x-1 transition-transform duration-300">استكشف مجموعاتنا</span>
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : !loading && !error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📂</span>
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد تصنيفات متاحة</h3>
              <p className="text-gray-500">سيتم إضافة التصنيفات قريباً</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Premium Products Section */}
      <main className="relative container-responsive py-4 sm:py-6 lg:py-8">
        {/* Premium Background Effects - ألوان متناسقة */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/40 via-transparent to-gray-100/40" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gray-300/20 rounded-full blur-3xl" />
        
        {/* عرض Products فوراً بدون شرط */}
        {categoryProducts.length > 0 && (
  <div className="relative space-y-8 sm:space-y-10 lg:space-y-12">
    {categoryProducts.map((categoryProduct, sectionIndex) => (
      <section key={categoryProduct.category.id} className="relative py-4 sm:py-6 lg:py-8">
        {/* Section Background - ألوان متناسقة */}
        <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-br from-white/70 via-gray-50/40 to-white/70 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-gray-100/50 shadow-lg" />
        
        <div className="relative z-10">
          <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-3 lg:mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-16 sm:w-24 lg:w-32" />
              <h2 className="text-responsive-3xl font-black bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-sm px-3 sm:px-4 lg:px-6 py-1 sm:py-2">
                {categoryProduct.category.name}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-16 sm:w-24 lg:w-32" />
            </div>
            
            <div className="h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full mb-3 sm:mb-4 lg:mb-5 mx-auto w-20 sm:w-24 lg:w-32 shadow-lg" />
            <p className="text-responsive-base text-gray-700 mb-4 sm:mb-5 lg:mb-6 max-w-2xl mx-auto leading-relaxed font-medium px-4">
              {categoryProduct.category.description || 'مجموعة مختارة من أفضل المنتجات المصنوعة بعناية فائقة'}
            </p>
            <Link 
              to={`/category/${createCategorySlug(categoryProduct.category.id, categoryProduct.category.name)}`} 
              className="inline-flex items-center text-gray-700 hover:text-gray-800 font-semibold bg-white/90 backdrop-blur-xl border border-gray-200/60 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-gray-50/80 hover:border-gray-300/80 gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <span>عرض جميع المنتجات</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          
          {/* Products Container */}
          <div className="relative py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-8">
            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="block sm:hidden">
              {/* Mobile Horizontal Scroll */}
              <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory mobile-scroll">
                {categoryProduct.products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-72 snap-start"
                  >
                    <Link to={`/product/${createProductSlug(product.id, product.name)}`} className="block">
                      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-full mobile-card group relative cursor-pointer">
                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                        
                        {/* Product Image - Taller for mobile */}
                        <div className="relative h-72 overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100">
                          <img
                            src={buildImageUrl(product.mainImage)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                          {/* Premium Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* New Badge */}
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            جديد
                          </div>
                          
                          {/* Wishlist Button */}
                          <div className="absolute top-3 left-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add wishlist functionality here
                                console.log('❤️ Wishlist clicked for product:', product.id);
                              }}
                              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200 hover:scale-110"
                            >
                              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                          
                          {/* Product Type Badge */}
                          {product.productType && (
                            <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                              {product.productType}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info - Centered Layout */}
                        <div className="p-5 flex flex-col items-center text-center space-y-3">
                          {/* Product Name - Centered */}
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight min-h-[3rem] hover:text-pink-600 transition-colors duration-300">
                            {product.name}
                          </h3>
                          
                          {/* Elegant Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent w-16"></div>
                          
                          {/* Price Section - Centered */}
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
                            
                            {/* Stock Indicator */}
                            <div className="text-sm">
                              {product.stock > 0 ? (
                                <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">متوفر</span>
                              ) : (
                                <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">نفذ</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions - Check for required options before adding */}
                          {product.stock > 0 && (
                            <div className="w-full space-y-3">
                              {/* Check if product has required options */}
                              {product.dynamicOptions && product.dynamicOptions.some((opt: any) => opt.required) ? (
                                // Product has required options - redirect to product page
                                <Link
                                  to={`/product/${createProductSlug(product.id, product.name)}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                  <Package className="w-4 h-4" />
                                  <span>اختر المقاسات والتفاصيل</span>
                                </Link>
                              ) : (
                                // Product without required options - show quantity and add to cart
                                <>
                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-center gap-3">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuantityDecrease(product.id);
                                      }}
                                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-all duration-200 hover:scale-110"
                                    >
                                      -
                                    </button>
                                    <span className="w-12 text-center font-bold text-gray-800 text-lg bg-gray-50 py-1 rounded-lg">
                                      {quantities[product.id] || 1}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuantityIncrease(product.id, product.stock);
                                      }}
                                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-all duration-200 hover:scale-110"
                                    >
                                      +
                                    </button>
                                  </div>
                                  
                                  {/* Add to Cart Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddToCart(product.id, product.name);
                                    }}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm font-bold hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>إضافة للسلة</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 justify-items-center">
              {categoryProduct.products.map((product, idx) => (
                <div
                  key={product.id}
                  className="w-full max-w-sm"
                >
                  <ProductCard
                    product={product}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ))}
  </div>
)}
      </main>

      {/* Premium Footer - Mobile Optimized */}
      <footer className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-6 sm:py-8 lg:py-10 border-t border-gray-200/60 overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 via-transparent to-gray-200/30" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-300/15 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid Layout - Adjusted for better mobile visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Brand Section - Simplified for mobile with minimum height */}
            <div className="col-span-1 text-center mb-4 sm:mb-0 min-h-[100px] brand-section flex flex-col items-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-2">
                GHEM.STORE
              </h3>

      {/* Social Media Icons - Flex layout ensures visibility with wrapping and high z-index for layering */}
{/* On mobile, icons are centered horizontally; on sm+ screens, they align to the start */}
<div className="flex flex-row justify-center gap-x-3 gap-y-2 mt-3 social-media-icons sm:flex-row sm:justify-start">
  <a
    href="https://www.instagram.com/ghem.store10?igsh=cXU5cTJqc2V2Nmg="
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visit our Instagram page"
    className="bg-white/90 backdrop-blur-xl border border-gray-200/60 p-2 rounded-full hover:bg-pink-100 transition-all shadow-sm z-50"
  >
    <FaInstagram size={20} color="#ec4899" />
  </a>

  {/* TikTok Link - Commented out to disable in the UI */}
  {/*
  <a
    href="https://www.tiktok.com/@yourprofile"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visit our TikTok page"
    className="bg-white/90 backdrop-blur-xl border border-gray-200/60 p-2 rounded-full hover:bg-gradient-to-r hover:from-pink-100 hover:to-teal-100 transition-all shadow-sm z-50"
  >
    <FaTiktok size={20} color="#000000" />
  </a>
  */}

  {/* Snapchat Link - Commented out to disable in the UI */}
  {/*
  <a
    href="https://www.snapchat.com/add/yourusername"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visit our Snapchat page"
    className="bg-white/90 backdrop-blur-xl border border-gray-200/60 p-2 rounded-full hover:bg-yellow-200 transition-all shadow-sm z-50"
  >
    <FaSnapchatGhost size={20} color="#facc15" />
  </a>
  */}

  <a
    href="https://wa.me/966551064118"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact us on WhatsApp"
    className="bg-green-50 backdrop-blur-xl border border-green-200/60 p-2 rounded-full hover:bg-green-100 transition-all shadow-sm z-50"
  >
    <FaWhatsapp size={20} color="#22c55e" />
  </a>
</div>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">روابط سريعة</h4>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <Link to="/" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">الرئيسية</Link>
                <Link to="/products" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">المنتجات</Link>
                <Link to="/about" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">من نحن</Link>
                <Link to="/contact" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">اتصل بنا</Link>
                <Link to="/privacy-policy" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">سياسة الخصوصية</Link>
                <Link to="/return-policy" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">سياسة الاسترجاع</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">تواصل معنا</h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📞</span>
                  <span className="truncate">+966551064118</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>✉️</span>
                  <span className="truncate">support@ghem.store</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📍</span>
                  <span className="truncate">السعودية</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-200/60 pt-3 sm:pt-4 text-center">
            <div className="bg-gradient-to-r from-white/80 via-gray-50/90 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-full mx-auto shadow-lg">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                © 2025 Ghem Store By Art-code
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}

export default App;