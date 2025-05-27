import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal';
import { createCategorySlug } from '../utils/slugify';


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
  // تحميل البيانات فوراً من localStorage لتجنب الفلاش
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
    fetchCart();
    fetchWishlist();
    
    // إضافة مستمعين للأحداث المختلفة
    const handleCartUpdate = () => {
      console.log('🔄 Cart update event received in Navbar');
      
      // تحديث فوري من localStorage إذا متوفر
      const savedCartCount = localStorage.getItem('lastCartCount');
      if (savedCartCount) {
        const count = parseInt(savedCartCount);
        console.log('🔄 Setting cart count immediately from localStorage:', count);
        setCartItemsCount(count);
      }
      
      // تحديث فوري من الـ API أيضاً
          // ثم جلب البيانات الحديثة من الـ API
          setTimeout(() => fetchCart(), 50);
        };
    
    
        const handleWishlistUpdate = () => {
          console.log('🔄 Wishlist update event received in Navbar');
      
      // تحديث فوري من localStorage إذا متوفر
      const savedWishlistCount = localStorage.getItem('lastWishlistCount');
      if (savedWishlistCount) {
        const count = parseInt(savedWishlistCount);
        console.log('🔄 Setting wishlist count immediately from localStorage:', count);
        setWishlistItemsCount(count);
      }
      
           // ثم جلب البيانات الحديثة من الـ API
           setTimeout(() => fetchWishlist(), 50);
          };
      
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate') {
        console.log('🔄 Storage change detected for cart');
        fetchCart();
      }
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') {
        console.log('🔄 Storage change detected for wishlist');
        fetchWishlist();
      }
    };
    
    // إضافة مستمعين للأحداث المتعددة
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
    
    cartEvents.forEach(eventName => {
      window.addEventListener(eventName, handleCartUpdate);
    });
    
    wishlistEvents.forEach(eventName => {
      window.addEventListener(eventName, handleWishlistUpdate);
    });
    
    window.addEventListener('storage', handleStorageChange);
    
    // إضافة مستمع للـ focus للتحديث عند العودة للتاب
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing counters');
      fetchCart();
      fetchWishlist();
    };
    window.addEventListener('focus', handleFocus);
    
    // تحديث دوري كل ثانية واحدة للتأكد من التزامن الفوري
    const interval = setInterval(() => {
      const lastCartUpdate = localStorage.getItem('cartUpdated');
      const lastWishlistUpdate = localStorage.getItem('wishlistUpdated');
      
      if (lastCartUpdate) {
        const timeDiff = Date.now() - parseInt(lastCartUpdate);
        if (timeDiff < 2000) { // إذا كان التحديث خلال آخر ثانيتين
          console.log('🔄 Auto-refreshing cart due to recent update');
          fetchCart();
        }
      }
      
      if (lastWishlistUpdate) {
        const timeDiff = Date.now() - parseInt(lastWishlistUpdate);
        if (timeDiff < 2000) { // إذا كان التحديث خلال آخر ثانيتين
          console.log('🔄 Auto-refreshing wishlist due to recent update');
          fetchWishlist();
        }
      }
    }, 1000); // كل ثانية واحدة
    
    return () => {
      cartEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleCartUpdate);
      });
      
      wishlistEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleWishlistUpdate);
      });
      
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories(data);
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem('cachedCategories', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCart = async () => {
    try {
      if (!user?.id) {
        console.log('👤 No user ID, setting cart count to 0');
        setCartItemsCount(0);
        return;
      }
      
      console.log('🛒 Fetching cart for user:', user.id);
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart`);
      const data = await response.json();
      const itemsCount = data.reduce((total: number, item: CartItem) => total + item.quantity, 0);
      
      console.log('🛒 Cart items count:', itemsCount);
      setCartItemsCount(itemsCount);
      
      // حفظ آخر تحديث في localStorage
      localStorage.setItem('lastCartCount', itemsCount.toString());
      localStorage.setItem('lastCartFetch', Date.now().toString());
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCartItemsCount(0);
    }
  };

  const fetchWishlist = async () => {
    try {
      if (!user?.id) {
        console.log('👤 No user ID, setting wishlist count to 0');
        setWishlistItemsCount(0);
        return;
      }
      
      console.log('❤️ Fetching wishlist for user:', user.id);
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/wishlist`);
      const data = await response.json();
      
      console.log('❤️ Wishlist items count:', data.length);
      setWishlistItemsCount(data.length);
      
      // حفظ آخر تحديث في localStorage
      localStorage.setItem('lastWishlistCount', data.length.toString());
      localStorage.setItem('lastWishlistFetch', Date.now().toString());
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      setWishlistItemsCount(0);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    setTimeout(() => {
      fetchCart();
      fetchWishlist();
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
            className="text-gray-800 hover:text-gray-600 p-2 sm:p-3 rounded-xl lg:hidden transition-all duration-300 ease-out transform hover:scale-110 bg-white/40 backdrop-blur-xl border border-gray-300/40 shadow-lg hover:shadow-xl"
          >
            {isMenuOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <Menu size={24} className="sm:w-7 sm:h-7" />}
          </button>

          {/* Premium Logo - Responsive */}
          <Link to="/" className="flex items-center gap-2 sm:gap-4 transition-all duration-500 hover:scale-105 group">
            <div className="relative">
              <img src={logo} alt="Premium Brand Logo" className="h-12 sm:h-16 lg:h-20 w-auto drop-shadow-2xl" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>

          {/* Premium Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
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
                  <div className="absolute right-0 mt-2 sm:mt-4 w-64 sm:w-72 bg-[#f8f6ea]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-300/40 py-3 sm:py-4 animate-[slideInFromTop_0.3s_ease-out]">
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
                className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-pink-400/30 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 ease-out transform hover:scale-105 shadow-xl hover:shadow-2xl font-semibold group"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <User size={18} className="sm:w-5 sm:h-5 text-white" />
                  <span className="text-sm sm:text-base">تسجيل الدخول</span>
                </div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Premium Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 ease-out ${isMenuOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="bg-[#f8f6ea]/95 backdrop-blur-2xl shadow-2xl border-t border-gray-300/30 p-4 sm:p-6 animate-[slideInFromTop_0.3s_ease-out]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ea]/30 via-[#f8f6ea]/40 to-[#f8f6ea]/30" />
            <div className="relative space-y-2">
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
                    className={`w-full text-right block px-4 sm:px-6 py-3 sm:py-4 text-gray-700 hover:text-gray-800 hover:bg-white/40 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out backdrop-blur-xl border border-transparent hover:border-gray-300/30 group cursor-pointer text-sm sm:text-base ${
                      isActive(`/category/${createCategorySlug(category.id, category.name)}`) ? 'bg-white/60 border-gray-300/50 text-gray-800' : ''
                    }`}
                  >
                    {category.name}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#f8f6ea]/20 to-[#f8f6ea]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
            </div>
          </div>
        </div>

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