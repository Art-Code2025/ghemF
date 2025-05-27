import { toast } from 'react-toastify';

// دالة موحدة لإضافة منتج إلى السلة
export const addToCartUnified = async (
  productId: number, 
  productName: string, 
  quantity: number = 1,
  selectedOptions?: Record<string, string>,
  attachments?: any
) => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    console.log('🛒 Adding to cart:', { productId, productName, quantity, selectedOptions, attachments });

    const requestBody: any = {
      productId,
      quantity
    };

    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      requestBody.selectedOptions = selectedOptions;
    }

    if (attachments) {
      requestBody.attachments = attachments;
    }

    const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إضافة المنتج إلى سلة التسوق');
    }

    // تحديث فوري وقوي للكونتر
    console.log('✅ Product added to cart successfully, triggering IMMEDIATE counter update...');
    
    // 1. تحديث فوري في localStorage
    const currentCartCount = localStorage.getItem('lastCartCount');
    const newCartCount = currentCartCount ? parseInt(currentCartCount) + quantity : quantity;
    localStorage.setItem('lastCartCount', newCartCount.toString());
    console.log('🔄 Updated cart count in localStorage:', newCartCount);
    
    // 2. تحديث فوري للكونتر في الـ DOM مباشرة
    const updateCartCountInDOM = () => {
      const cartCountElements = document.querySelectorAll('[data-cart-count]');
      cartCountElements.forEach(element => {
        element.textContent = newCartCount.toString();
        console.log('🔄 Updated cart counter in DOM directly:', newCartCount);
      });
      
      // تحديث أي عناصر أخرى قد تحتوي على عدد السلة
      const cartBadges = document.querySelectorAll('.cart-counter-badge, .cart-badge, [class*="cart-count"]');
      cartBadges.forEach(element => {
        element.textContent = newCartCount.toString();
      });
    };
    
    updateCartCountInDOM();
    
    // 3. إرسال أحداث متعددة وقوية
    const updateEvents = [
      'cartUpdated',
      'productAddedToCart', 
      'cartCountChanged',
      'forceCartUpdate'
    ];
    
    updateEvents.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { 
          productId, 
          productName, 
          quantity, 
          newCount: newCartCount,
          timestamp: Date.now()
        }
      }));
    });
    
    // 4. تحديث localStorage مع timestamps متعددة
    const now = Date.now();
    localStorage.setItem('cartUpdated', now.toString());
    localStorage.setItem('lastCartUpdate', new Date().toISOString());
    localStorage.setItem('forceCartRefresh', now.toString());
    
    // 5. إرسال storage events متعددة
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cartUpdated',
      newValue: now.toString(),
      oldValue: null
    }));
    
    // 6. أحداث مؤجلة متعددة للضمان
    [50, 100, 200, 500, 1000].forEach(delay => {
      setTimeout(() => {
        // تحديث DOM مرة أخرى للتأكد
        updateCartCountInDOM();
        
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { newCount: newCartCount, delay }
        }));
        console.log(`🔄 Delayed cart update event sent after ${delay}ms`);
      }, delay);
    });

    // رسالة نجاح بسيطة وفعالة
    toast.success(`🛒 تم إضافة "${productName}" إلى السلة بنجاح!`, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: '12px',
        zIndex: 999999
      }
    });
    
    console.log('🎉 Cart success message displayed for:', productName);

    return true;
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    toast.error(`❌ فشل في إضافة "${productName}" إلى السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
      autoClose: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }
    });
    return false;
  }
};

// دالة موحدة لإضافة منتج إلى المفضلة
export const addToWishlistUnified = async (productId: number, productName: string) => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    console.log('❤️ Adding to wishlist:', { productId, productName });

    const response = await fetch(`http://localhost:3001/api/user/${user.id}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إضافة المنتج إلى المفضلة');
    }

    // تحديث العدد فوراً في localStorage
    const currentWishlistCount = localStorage.getItem('lastWishlistCount');
    const newWishlistCount = currentWishlistCount ? parseInt(currentWishlistCount) + 1 : 1;
    localStorage.setItem('lastWishlistCount', newWishlistCount.toString());
    console.log('🔄 Updated wishlist count in localStorage:', newWishlistCount);
    
    // تحديث فوري للكونتر في الـ DOM مباشرة
    const updateWishlistCountInDOM = () => {
      const wishlistCountElements = document.querySelectorAll('[data-wishlist-count]');
      wishlistCountElements.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 Updated wishlist counter in DOM directly:', newWishlistCount);
      });
      
      // تحديث أي عناصر أخرى قد تحتوي على عدد المفضلة
      const wishlistBadges = document.querySelectorAll('.wishlist-counter-badge, .wishlist-badge, [class*="wishlist-count"]');
      wishlistBadges.forEach(element => {
        element.textContent = newWishlistCount.toString();
      });
    };
    
    updateWishlistCountInDOM();
    
    // إرسال أحداث متعددة لضمان تحديث الكونتر
    console.log('✅ Product added to wishlist successfully, triggering events...');
    
    // أحداث فورية
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productAddedToWishlist', {
      detail: { productId, productName }
    }));
    
    // تحديث localStorage
    localStorage.setItem('wishlistUpdated', Date.now().toString());
    localStorage.setItem('lastWishlistUpdate', new Date().toISOString());
    
    // إرسال storage event
    window.dispatchEvent(new Event('storage'));
    
    // أحداث مؤجلة للتأكد
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('🔄 Delayed wishlist update event sent');
    }, 100);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('🔄 Second delayed wishlist update event sent');
    }, 500);

    // رسالة نجاح بسيطة وفعالة للمفضلة
    toast.success(`❤️ تم إضافة "${productName}" إلى المفضلة بنجاح!`, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: '#EC4899',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: '12px',
        zIndex: 999999
      }
    });
    
    console.log('💖 Wishlist success message displayed for:', productName);

    return true;
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    toast.error(`❌ فشل في إضافة "${productName}" إلى المفضلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
      autoClose: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }
    });
    return false;
  }
};

// دالة موحدة لحذف منتج من المفضلة
export const removeFromWishlistUnified = async (productId: number, productName: string) => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    console.log('💔 Removing from wishlist:', { productId, productName });

    const response = await fetch(`http://localhost:3001/api/user/${user.id}/wishlist/product/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في حذف المنتج من المفضلة');
    }

    // تحديث العدد فوراً في localStorage
    const currentWishlistCount = localStorage.getItem('lastWishlistCount');
    const newWishlistCount = currentWishlistCount ? Math.max(0, parseInt(currentWishlistCount) - 1) : 0;
    localStorage.setItem('lastWishlistCount', newWishlistCount.toString());
    console.log('🔄 Updated wishlist count in localStorage after removal:', newWishlistCount);
    
    // تحديث فوري للكونتر في الـ DOM مباشرة
    const updateWishlistCountInDOM = () => {
      const wishlistCountElements = document.querySelectorAll('[data-wishlist-count]');
      wishlistCountElements.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 Updated wishlist counter in DOM directly after removal:', newWishlistCount);
      });
      
      // تحديث أي عناصر أخرى قد تحتوي على عدد المفضلة
      const wishlistBadges = document.querySelectorAll('.wishlist-counter-badge, .wishlist-badge, [class*="wishlist-count"]');
      wishlistBadges.forEach(element => {
        element.textContent = newWishlistCount.toString();
      });
    };
    
    updateWishlistCountInDOM();

    // إرسال أحداث متعددة لضمان تحديث الكونتر
    console.log('✅ Product removed from wishlist successfully, triggering events...');
    
    // أحداث فورية
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productRemovedFromWishlist', {
      detail: { productId, productName }
    }));
    
    // تحديث localStorage
    localStorage.setItem('wishlistUpdated', Date.now().toString());
    localStorage.setItem('lastWishlistUpdate', new Date().toISOString());
    
    // إرسال storage event
    window.dispatchEvent(new Event('storage'));
    
    // أحداث مؤجلة للتأكد
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
    }, 100);

    // رسالة حذف بسيطة وفعالة
    toast.info(`🗑️ تم حذف "${productName}" من المفضلة`, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: '#6B7280',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: '12px',
        zIndex: 999999
      }
    });
    
    console.log('🗑️ Remove message displayed for:', productName);

    return true;
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    toast.error(`❌ فشل في حذف "${productName}" من المفضلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
      autoClose: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }
    });
    return false;
  }
}; 