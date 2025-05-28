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
  const [cartItemsCount, setCartItemsCount] = useState<number>(() => {
    const saved = localStorage.getItem('lastCartCount');
    return saved ? parseInt(saved) : 0;
  });
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(() => {
    const saved = localStorage.getItem('lastWishlistCount');
    return saved ? parseInt(saved) : 0;
  });
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
    } else {
      // For testing - auto login with demo user
      console.log('🔧 No user found, setting demo user for testing');
      const demoUser = {
        id: 5,
        name: 'ahmed maher',
        email: 'ahmedmaher123384@gmail.com',
        firstName: 'ahmed',
        lastName: 'maher'
      };
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      console.log('✅ Demo user set:', demoUser);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchCategories();
    
    const handleCartUpdate = () => fetchCartCount();
    const handleWishlistUpdate = () => fetchWishlistCount();
    const handleCategoriesUpdate = () => fetchCategories();
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      if (!user?.id) return;
      
      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      const totalItems = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemsCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      if (!user?.id) return;
      
      const data = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id));
      setWishlistItemsCount(data.length);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
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
    setTimeout(() => {
      fetchCartCount();
      fetchWishlistCount();
    }, 100);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav dir="rtl" className={`fixed top-0 right-0 w-full z-50 transition-all duration-700 ease-out ${
        scrolled 
          ? 'bg-[#f8f6ea]/95 backdrop-blur-2xl shadow-2xl shadow-gray-300/20 border-b border-gray-300/30' 
          : 'bg-[#f8f6ea]/80 backdrop-blur-xl shadow-xl'
        }`}>
        
        {/* Premium Glass Morphism Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f6ea]/20 via-[#f8f6ea]/30 to-[#f8f6ea]/20 backdrop-blur-3xl" />
        
        {/* Luxury Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400/40 to-transparent" />
        
        <div className="relative flex items-center justify-between h-16 sm:h-20 lg:h-24 px-4 sm:px-6 lg:px-12">
          {/* Menu Button for Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 hover:text-gray-600 p-2 sm:p-3 rounded-xl lg:hidden transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 shadow-lg hover:shadow-xl z-50"
          >
            {isMenuOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <Menu size={24} className="sm:w-7 sm:h-7" />}
          </button>

          {/* Premium Logo - Fixed Center */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:relative lg:left-auto lg:top-auto lg:transform-none z-40">
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Logo clicked - navigating to home');
                navigate('/');
                setIsMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-2 sm:gap-4 transition-all duration-500 hover:scale-105 group cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={logo} 
                  alt="GHEM Store Logo" 
                  className="h-10 sm:h-14 lg:h-20 w-auto drop-shadow-2xl select-none" 
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>

          {/* Premium Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 z-30">
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
                  className={`relative px-3 lg:px-4 xl:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-medium text-sm lg:text-base text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-105 group cursor-pointer z-10 ${
                    isActive(`/category/${createCategorySlug(category.id, category.name)}`) 
                      ? 'bg-white/60 backdrop-blur-xl border border-gray-300/50 text-gray-800 shadow-lg' 
                      : 'hover:bg-white/40 hover:backdrop-blur-xl hover:border hover:border-gray-300/30'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 10,
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

          {/* Premium Icons Section */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 sm:p-3 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl group">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              {cartItemsCount > 0 && (
                <span 
                  data-cart-count
                  className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                >
                  {cartItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 sm:p-3 text-gray-700 hover:text-gray-800 transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl group">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              {wishlistItemsCount > 0 && (
                <span 
                  data-wishlist-count
                  className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                >
                  {wishlistItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 sm:gap-3 text-gray-700 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/60 to-[#f8f6ea]/60 backdrop-blur-xl border border-gray-300/40 hover:bg-gradient-to-r hover:from-white/80 hover:to-[#f8f6ea]/80 transition-all duration-300 ease-out transform hover:scale-105 shadow-xl hover:shadow-2xl group"
                >
                  <User size={20} className="sm:w-6 sm:h-6 text-pink-500" />
                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-gray-800 text-sm lg:text-base">مرحبًا يا {user.name?.split(' ')[0] || user.firstName || 'عزيزي العميل'}</span>
                    <div className="text-xs text-gray-600 font-light hidden lg:block">أهلاً بك في تجربتك الفاخرة</div>
                  </div>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 sm:mt-4 w-48 sm:w-56 bg-[#f8f6ea]/95 backdrop-blur-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-300/40 py-2 sm:py-3 animate-[slideInFromTop_0.3s_ease-out]">
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
                className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-xl border border-pink-400/30 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 ease-out transform hover:scale-105 shadow-lg hover:shadow-xl font-medium group"
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <User size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  <span className="text-xs sm:text-sm lg:text-base">دخول</span>
                </div>
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Premium Mobile Menu - Vertical Sidebar */}
        <div className={`lg:hidden fixed top-0 right-0 h-full w-80 z-40 transition-all duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="h-full bg-[#f8f6ea]/95 backdrop-blur-2xl shadow-2xl border-l border-gray-300/30 p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ea]/30 via-[#f8f6ea]/40 to-[#f8f6ea]/30" />
            
            {/* Close Button */}
            <div className="relative flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">القائمة الرئيسية</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/40 rounded-lg transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative space-y-3">
              {/* عرض Categories فوراً بدون شرط */}
              {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      console.log('📱 Mobile Category clicked:', category.name, 'ID:', category.id);
                      const categorySlug = createCategorySlug(category.id, category.name);
                      navigate(`/category/${categorySlug}`);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-right block px-4 py-3 text-gray-700 hover:text-gray-800 hover:bg-white/40 rounded-xl transition-all duration-300 ease-out backdrop-blur-xl border border-transparent hover:border-gray-300/30 group cursor-pointer text-base ${
                      isActive(`/category/${createCategorySlug(category.id, category.name)}`) ? 'bg-white/60 border-gray-300/50 text-gray-800' : ''
                    }`}
                  >
                    {category.name}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
            </div>
          </div>
        </div>
        
        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
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