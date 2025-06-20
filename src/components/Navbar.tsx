import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Search, Package, Settings, Phone, Mail, MapPin, Clock, ChevronDown, Home, Grid3X3, Star, Award, Truck, Shield, Sparkles, Bell, ChevronLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal';
import { createCategorySlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('👤 User loaded from localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchCategories();
    
    // إضافة مستمعين أكثر للأحداث لضمان دقة العداد
    const handleCartUpdate = () => {
      console.log('🔄 [Navbar] Cart update event received');
      fetchCartCount();
    };
    
    const handleWishlistUpdate = () => {
      console.log('🔄 [Navbar] Wishlist update event received');
      fetchWishlistCount();
    };
    
    const handleCategoriesUpdate = () => fetchCategories();
    
    // استماع لكل الأحداث المختلفة من cartUtils
    const cartEvents = [
      'cartUpdated',
      'productAddedToCart',
      'cartCountChanged',
      'forceCartUpdate'
    ];
    
    const wishlistEvents = [
      'wishlistUpdated',
      'productAddedToWishlist',
      'productRemovedFromWishlist'
    ];
    
    // إضافة مستمعين للأحداث
    cartEvents.forEach(event => {
      window.addEventListener(event, handleCartUpdate);
    });
    
    wishlistEvents.forEach(event => {
      window.addEventListener(event, handleWishlistUpdate);
    });
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    // استماع للتغييرات في localStorage أيضاً
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh') {
        console.log('🔄 [Navbar] Storage cart update detected');
        handleCartUpdate();
      }
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') {
        console.log('🔄 [Navbar] Storage wishlist update detected');
        handleWishlistUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // تحديث فوري من localStorage للمستخدم الحالي
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);
      
      if (savedCartCount) {
        setCartItemsCount(parseInt(savedCartCount));
      }
      if (savedWishlistCount) {
        setWishlistItemsCount(parseInt(savedWishlistCount));
      }
    } else {
      // For guests, load from localStorage directly
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlistItemsCount(parsedWishlist.length);
          }
        } catch (error) {
          console.error('❌ [Navbar] Error parsing guest wishlist:', error);
          setWishlistItemsCount(0);
        }
      }
    }
    
    return () => {
      // إزالة جميع المستمعين
      cartEvents.forEach(event => {
        window.removeEventListener(event, handleCartUpdate);
      });
      
      wishlistEvents.forEach(event => {
        window.removeEventListener(event, handleWishlistUpdate);
      });
      
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        // المستخدم غير مسجل - تحميل من localStorage
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              console.log('📊 [Navbar] Cart count from localStorage:', totalItems);
              return;
            }
          } catch (parseError) {
            console.error('❌ [Navbar] Error parsing local cart:', parseError);
          }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      console.log('🔄 [Navbar] Fetching cart count for user:', user.id);
      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      const totalItems = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      console.log('📊 [Navbar] Cart count fetched:', totalItems);
      setCartItemsCount(totalItems);
      
      // حفظ العداد في localStorage بنفس طريقة cartUtils
      localStorage.setItem('lastCartCount', totalItems.toString());
      localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());
      
      console.log('💾 [Navbar] Cart count saved to localStorage:', totalItems);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching cart count:', error);
      
      // في حالة الخطأ، حاول تحميل من localStorage
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            return;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing local cart fallback:', parseError);
        }
      }
      
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      // Always check localStorage first for wishlist count
      const savedWishlist = localStorage.getItem('wishlist');
      let wishlistCount = 0;
      
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            wishlistCount = parsedWishlist.length;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing wishlist from localStorage:', parseError);
          wishlistCount = 0;
        }
      }
      
      console.log('📊 [Navbar] Wishlist count from localStorage:', wishlistCount);
      setWishlistItemsCount(wishlistCount);
      localStorage.setItem('lastWishlistCount', wishlistCount.toString());
      
      // Also save for current user if logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            localStorage.setItem(`wishlistCount_${user.id}`, wishlistCount.toString());
          }
        } catch (error) {
          console.error('❌ [Navbar] Error parsing user data:', error);
        }
      }
      
      console.log('💾 [Navbar] Wishlist count saved to localStorage:', wishlistCount);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching wishlist count:', error);
      setWishlistItemsCount(0);
      localStorage.setItem('lastWishlistCount', '0');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem('cachedCategories', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    
    // دمج السلة المحلية مع سلة المستخدم
    const mergeLocalCartWithUserCart = async () => {
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (localItems.length > 0) {
            console.log('🔄 [Navbar] Merging local cart with user cart:', localItems.length, 'items');
            
            // إرسال العناصر المحلية إلى الخادم
            for (const item of localItems) {
              try {
                await apiCall(API_ENDPOINTS.USER_CART(userData.id), {
                  method: 'POST',
                  body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity,
                    selectedOptions: item.selectedOptions || {},
                    optionsPricing: item.optionsPricing || {},
                    attachments: item.attachments || {},
                    productName: item.product?.name || 'منتج',
                    price: item.product?.price || 0,
                    image: item.product?.mainImage || ''
                  })
                });
                console.log('✅ [Navbar] Merged item:', item.productId);
              } catch (error) {
                console.error('❌ [Navbar] Error merging item:', item.productId, error);
              }
            }
            
            // تحديث السلة من الخادم بعد الدمج
            try {
              const serverCart = await apiCall(API_ENDPOINTS.USER_CART(userData.id));
              localStorage.setItem('cart', JSON.stringify(serverCart));
              console.log('✅ [Navbar] Cart merged successfully, new cart size:', serverCart.length);
              
              // إطلاق حدث لتحديث السلة
              window.dispatchEvent(new CustomEvent('cartUpdated'));
              
              toast.success('تم دمج سلة التسوق بنجاح! 🛒', {
                position: "top-center",
                autoClose: 3000,
                style: {
                  background: '#10B981',
                  color: 'white',
                  fontWeight: 'bold'
                }
              });
            } catch (error) {
              console.error('❌ [Navbar] Error fetching merged cart:', error);
            }
          } else {
            console.log('📭 [Navbar] Local cart is empty, no merge needed');
          }
        } else {
          console.log('📭 [Navbar] No local cart found');
        }
      } catch (error) {
        console.error('❌ [Navbar] Error in cart merge:', error);
      }
    };
    
    // تنفيذ دمج السلة
    mergeLocalCartWithUserCart();
    
    toast.success(`مرحباً بك ${userData.firstName}! 🎉`, {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });
  };

  const handleLogout = () => {
    // مسح جميع بيانات المستخدم
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    
    // مسح بيانات السلة والمفضلة للمستخدم الحالي
    if (currentUser?.id) {
      localStorage.removeItem(`cartCount_${currentUser.id}`);
      localStorage.removeItem(`wishlistCount_${currentUser.id}`);
    }
    
    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);
    
    // إعادة توجيه للصفحة الرئيسية
    navigate('/');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#f8f6ea]/95 via-[#f8f6ea]/98 to-[#f8f6ea]/95 backdrop-blur-2xl border-b border-gray-300/30 shadow-xl" dir="rtl">
        <style>
          {`
            /* Mobile Touch Optimization */
            @media (max-width: 1024px) {
              .mobile-touch-target {
                min-height: 40px;
                min-width: 40px;
                touch-action: manipulation;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .mobile-logo-area {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 50;
                pointer-events: auto;
                touch-action: manipulation;
                padding: 8px;
                border-radius: 12px;
              }
              
              .mobile-icons-area {
                position: relative;
                z-index: 60;
                pointer-events: auto;
                gap: 4px;
              }
              
              .mobile-menu-button {
                position: relative;
                z-index: 60;
                pointer-events: auto;
                touch-action: manipulation;
              }
            }
            
            /* Prevent text selection on touch */
            .no-select {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          `}
        </style>
        
        {/* Premium Glass Morphism Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f6ea]/20 via-[#f8f6ea]/30 to-[#f8f6ea]/20 backdrop-blur-3xl" />
        
        {/* Luxury Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400/40 to-transparent" />
        
        <div className="relative flex items-center justify-between h-20 sm:h-20 lg:h-24 px-4 sm:px-6 lg:px-12">
          {/* Menu Button for Mobile - حجم مصغر ومتناسق */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button mobile-touch-target text-gray-800 hover:text-gray-600 p-2 sm:p-2.5 rounded-xl lg:hidden transition-all duration-300 ease-out transform hover:scale-110 bg-white/60 backdrop-blur-xl border border-gray-300/50 shadow-md hover:shadow-lg z-[60] relative no-select"
            style={{ 
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            {isMenuOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Premium Logo - Fixed Center with proper z-index */}
          <div className="mobile-logo-area lg:relative lg:left-auto lg:top-auto lg:transform-none z-[50]">
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Logo clicked - navigating to home');
                navigate('/');
                setIsMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className="mobile-touch-target flex items-center gap-2 sm:gap-4 transition-all duration-500 hover:scale-105 group cursor-pointer relative z-[50] bg-transparent p-3 rounded-2xl no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation'
              }}
            >
              <div className="relative">
                <img 
                  src={logo} 
                  alt="GHEM Store Logo" 
                  className="h-10 sm:h-14 lg:h-20 w-auto drop-shadow-2xl select-none pointer-events-none" 
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>

          {/* Premium Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 z-[40]">
            {/* عرض Categories فوراً بدون شرط */}
            {categories.map((category, index) => (
                <button
                  key={category.id}
                  id={`category-btn-${category.id}`}
                  data-category-name={category.name}
                  data-category-id={category.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔗 Category clicked:', category.name, 'ID:', category.id);
                    console.log('🔗 Button element:', e.currentTarget);
                    console.log('🔗 Event details:', e);
                    
                    if (category.name === 'مريول مدرسي') {
                      console.log('🎯 مريول مدرسي clicked! Force navigating...');
                      console.log('🎯 Current location:', window.location.href);
                    }
                    
                    try {
                      const categorySlug = createCategorySlug(category.id, category.name);
                      navigate(`/category/${categorySlug}`);
                      console.log('✅ Navigation attempted to:', `/category/${categorySlug}`);
                    } catch (error) {
                      console.error('❌ Navigation error:', error);
                    }
                  }}
                  className={`relative px-3 lg:px-4 xl:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-medium text-sm lg:text-base text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-105 group cursor-pointer z-[40] ${
                    isActive(`/category/${createCategorySlug(category.id, category.name)}`) 
                      ? 'bg-white/60 backdrop-blur-xl border border-gray-300/50 text-gray-800 shadow-lg' 
                      : 'hover:bg-white/40 hover:backdrop-blur-xl hover:border hover:border-gray-300/30'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 40,
                    pointerEvents: 'auto'
                  }}
                >
                  {category.name}
                  
                  {/* Premium Hover Effect */}
                  <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-[#f8f6ea]/20 via-[#f8f6ea]/30 to-[#f8f6ea]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Active Indicator */}
                  {isActive(`/category/${createCategorySlug(category.id, category.name)}`) && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 lg:w-8 h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 rounded-full shadow-lg" />
                  )}
                                </button>
              ))}
            </div>

          {/* Premium Icons Section - أحجام أصغر ومتناسقة */}
          <div className="mobile-icons-area flex items-center gap-1 sm:gap-2 lg:gap-3 z-[60] relative">
            {/* Cart Icon - حجم مصغر */}
            <Link 
              to="/cart" 
              className="mobile-touch-target relative p-2 sm:p-2.5 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/60 backdrop-blur-xl border border-gray-300/50 rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span 
                  data-cart-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse border border-white"
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Wishlist Icon - حجم مصغر */}
            <Link 
              to="/wishlist" 
              className="mobile-touch-target relative p-2 sm:p-2.5 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/60 backdrop-blur-xl border border-gray-300/50 rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistItemsCount > 0 && (
                <span 
                  data-wishlist-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse border border-white"
                >
                  {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* User Menu - حجم مصغر */}
            {user ? (
              <div className="relative z-[60]">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="mobile-touch-target flex items-center gap-1 sm:gap-2 text-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-white/70 to-gray-50/70 backdrop-blur-xl border border-gray-300/50 hover:bg-gradient-to-r hover:from-white/90 hover:to-gray-50/90 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg group z-[60] no-select"
                  style={{ 
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    minHeight: '40px'
                  }}
                >
                  <User size={16} className="sm:w-5 sm:h-5 text-gray-700" />
                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-gray-800 text-xs">{user.name?.split(' ')[0] || user.firstName || 'عميل'}</span>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white/95 backdrop-blur-2xl rounded-xl shadow-xl border border-gray-200/60 py-2 animate-[slideInFromTop_0.3s_ease-out] z-[70]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-gray-50/30 to-white/40 rounded-xl" />
                    <div className="relative">
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:text-gray-800 hover:bg-gray-50/60 flex items-center gap-3 transition-all duration-300 ease-out group"
                      >
                        <LogOut size={16} className="group-hover:scale-110 transition-transform duration-300 text-red-500" />
                        <span className="font-medium">تسجيل خروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="mobile-touch-target relative bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl border border-pink-400/30 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg font-medium group z-[60] no-select"
                style={{ 
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  minHeight: '40px'
                }}
              >
                <div className="flex items-center gap-1">
                  <User size={14} className="sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm font-semibold">دخول</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl opacity-50" />
      </nav>

      {/* Premium Mobile Menu - خارج النافبار لأعلى z-index */}
      <div className={`lg:hidden fixed inset-0 z-[999999] transition-all duration-500 ease-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {/* Backdrop Overlay - خلفية معتمة */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-lg transition-all duration-500 ease-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Mobile Menu Panel - لوحة القائمة */}
        <div className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-white/98 backdrop-blur-3xl shadow-2xl border-l border-gray-200/60 transition-all duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Premium Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/80 to-white/95" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-100/40 to-transparent" />
          
          {/* Content Container */}
          <div className="relative h-full flex flex-col overflow-y-auto">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm border-b border-gray-200/60 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <Menu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">القائمة الرئيسية</h3>
                    <p className="text-sm text-gray-600">تصفح أقسام المتجر</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/60 rounded-2xl transition-all duration-300 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Navigation Links Section */}
            <div className="relative p-6 space-y-3">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">التنقل السريع</h4>
                
                {/* الرئيسية */}
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full text-right block px-4 py-4 text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-gray-200/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                    isActive('/') ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200/60 text-gray-900 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">الرئيسية</span>
                      <div className="text-xs text-gray-500 mt-0.5">العودة للصفحة الرئيسية</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>

                {/* جميع المنتجات */}
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full text-right block px-4 py-4 text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-gray-200/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                    isActive('/products') ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200/60 text-gray-900 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">جميع المنتجات</span>
                      <div className="text-xs text-gray-500 mt-0.5">تصفح كامل للمنتجات</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </div>

              {/* Categories Section */}
              {categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                    <span>التصنيفات</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{categories.length}</span>
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          console.log('📱 Mobile Category clicked:', category.name, 'ID:', category.id);
                          const categorySlug = createCategorySlug(category.id, category.name);
                          navigate(`/category/${categorySlug}`);
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full text-right block px-4 py-4 text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-gray-200/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                          isActive(`/category/${createCategorySlug(category.id, category.name)}`) ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200/60 text-gray-900 shadow-md' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <span className="text-white text-sm font-bold">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold">{category.name}</span>
                            <div className="text-xs text-gray-500 mt-0.5">استكشف مجموعة {category.name}</div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:-translate-x-1 transition-all duration-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State للتصنيفات */}
              {categories.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-600 mb-2">لا توجد تصنيفات</h3>
                  <p className="text-gray-500 text-sm">سيتم إضافة التصنيفات قريباً</p>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="relative mt-auto border-t border-gray-200/50 bg-gradient-to-r from-gray-50/60 to-white/60 p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  مرحباً بك في متجر
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  GHEM.STORE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;