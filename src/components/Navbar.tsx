import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Search, Package, Settings, Phone, Mail, MapPin, Clock, ChevronDown, Home, Grid3X3, Star, Award, Truck, Shield, Sparkles, Bell } from 'lucide-react';
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
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setWishlistItemsCount(0);
        localStorage.setItem('lastWishlistCount', '0');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        setWishlistItemsCount(0);
        localStorage.setItem('lastWishlistCount', '0');
        return;
      }
      
      console.log('🔄 [Navbar] Fetching wishlist count for user:', user.id);
      const data = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id));
      
      console.log('📊 [Navbar] Wishlist count fetched:', data.length);
      setWishlistItemsCount(data.length);
      
      // حفظ العداد في localStorage بنفس طريقة cartUtils
      localStorage.setItem('lastWishlistCount', data.length.toString());
      localStorage.setItem(`wishlistCount_${user.id}`, data.length.toString());
      
      console.log('💾 [Navbar] Wishlist count saved to localStorage:', data.length);
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
    
    // تحميل بيانات المستخدم الجديد فقط
    setTimeout(() => {
      fetchCartCount();
      fetchWishlistCount();
    }, 100);
    
    toast.success(`مرحباً بك ${userData.name || userData.firstName || 'عزيزي العميل'}`);
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
                min-height: 44px;
                min-width: 44px;
                touch-action: manipulation;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
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
                border-radius: 8px;
              }
              
              .mobile-icons-area {
                position: relative;
                z-index: 60;
                pointer-events: auto;
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
        
        <div className="relative flex items-center justify-between h-16 sm:h-20 lg:h-24 px-4 sm:px-6 lg:px-12">
          {/* Menu Button for Mobile - أعلى z-index */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button mobile-touch-target text-gray-800 hover:text-gray-600 p-2 sm:p-3 rounded-xl lg:hidden transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 shadow-lg hover:shadow-xl z-[60] relative no-select"
          >
            {isMenuOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <Menu size={24} className="sm:w-7 sm:h-7" />}
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
              className="mobile-touch-target flex items-center gap-2 sm:gap-4 transition-all duration-500 hover:scale-105 group cursor-pointer relative z-[50] bg-transparent p-2 rounded-lg no-select"
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

          {/* Premium Icons Section - أعلى z-index */}
          <div className="mobile-icons-area flex items-center gap-1 sm:gap-2 lg:gap-3 z-[60] relative">
            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="mobile-touch-target relative p-1.5 sm:p-2 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation'
              }}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
              {cartItemsCount > 0 && (
                <span 
                  data-cart-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                >
                  {cartItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Wishlist Icon */}
            <Link 
              to="/wishlist" 
              className="mobile-touch-target relative p-1.5 sm:p-2 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation'
              }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
              {wishlistItemsCount > 0 && (
                <span 
                  data-wishlist-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                >
                  {wishlistItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative z-[60]">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="mobile-touch-target flex items-center gap-1 sm:gap-2 text-gray-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-white/60 to-[#f8f6ea]/60 backdrop-blur-xl border border-gray-300/40 hover:bg-gradient-to-r hover:from-white/80 hover:to-[#f8f6ea]/80 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg group z-[60] no-select"
                  style={{ 
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                  }}
                >
                  <User size={16} className="sm:w-5 sm:h-5 text-pink-500" />
                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-gray-800 text-xs lg:text-sm">{user.name?.split(' ')[0] || user.firstName || 'عميل'}</span>
                  </div>
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 sm:mt-4 w-48 sm:w-56 bg-[#f8f6ea]/95 backdrop-blur-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-300/40 py-2 sm:py-3 animate-[slideInFromTop_0.3s_ease-out] z-[70]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ea]/30 via-[#f8f6ea]/40 to-[#f8f6ea]/30 rounded-2xl sm:rounded-3xl" />
                    <div className="relative">
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700 hover:text-gray-800 hover:bg-white/40 flex items-center gap-3 sm:gap-4 transition-all duration-300 ease-out group"
                      >
                        <LogOut size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300 text-pink-500" />
                        <span className="font-medium">تسجيل خروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="mobile-touch-target relative bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 sm:px-3 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg backdrop-blur-xl border border-pink-400/30 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg font-medium group z-[60] no-select"
                style={{ 
                  pointerEvents: 'auto',
                  touchAction: 'manipulation'
                }}
              >
                <div className="flex items-center gap-1">
                  <User size={14} className="sm:w-4 sm:h-4 lg:w-4 lg:h-4 text-white" />
                  <span className="text-xs sm:text-sm lg:text-sm">دخول</span>
                </div>
                <div className="absolute inset-0 rounded-md sm:rounded-lg bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Premium Mobile Menu - Vertical Sidebar */}
        <div className={`lg:hidden fixed top-0 right-0 h-full w-80 z-[9999] transition-all duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="h-full bg-[#f8f6ea]/98 backdrop-blur-3xl shadow-2xl border-l border-gray-300/30 p-4 sm:p-6 overflow-y-auto relative z-[9999]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ea]/30 via-[#f8f6ea]/40 to-[#f8f6ea]/30" />
            
            {/* Close Button */}
            <div className="relative flex justify-between items-center mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-3 z-[9999]">
              <h3 className="text-lg font-bold text-gray-800">القائمة الرئيسية</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-lg transition-all duration-300 z-[9999] relative"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="relative space-y-3 mb-6 z-[9999]">
              {/* الرئيسية */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`w-full text-right block px-4 py-3 text-gray-700 hover:text-gray-800 hover:bg-white/40 rounded-xl transition-all duration-300 ease-out backdrop-blur-xl border border-transparent hover:border-gray-300/30 group cursor-pointer text-base relative z-[9999] ${
                  isActive('/') ? 'bg-white/60 border-gray-300/50 text-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  <span>الرئيسية</span>
                </div>
              </Link>

              {/* جميع المنتجات */}
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className={`w-full text-right block px-4 py-3 text-gray-700 hover:text-gray-800 hover:bg-white/40 rounded-xl transition-all duration-300 ease-out backdrop-blur-xl border border-transparent hover:border-gray-300/30 group cursor-pointer text-base relative z-[9999] ${
                  isActive('/products') ? 'bg-white/60 border-gray-300/50 text-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span>جميع المنتجات</span>
                </div>
              </Link>
            </div>

            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="relative z-[9999]">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 px-2">التصنيفات</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        console.log('📱 Mobile Category clicked:', category.name, 'ID:', category.id);
                        const categorySlug = createCategorySlug(category.id, category.name);
                        navigate(`/category/${categorySlug}`);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-right block px-4 py-3 text-gray-700 hover:text-gray-800 hover:bg-white/40 rounded-xl transition-all duration-300 ease-out backdrop-blur-xl border border-transparent hover:border-gray-300/30 group cursor-pointer text-base relative z-[9999] ${
                        isActive(`/category/${createCategorySlug(category.id, category.name)}`) ? 'bg-white/60 border-gray-300/50 text-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                          <span className="text-pink-600 text-sm font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <span>{category.name}</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {categories.length === 0 && (
              <div className="relative text-center py-8 z-[9999]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">لا توجد تصنيفات متاحة</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl opacity-50" />
      </nav>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;