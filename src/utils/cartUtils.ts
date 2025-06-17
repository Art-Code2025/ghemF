import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildApiUrl } from '../config/api';

// دالة موحدة لإضافة منتج إلى السلة
export const addToCartUnified = async (
  productId: number, 
  productName: string, 
  quantity: number = 1,
  selectedOptions?: Record<string, string>,
  attachments?: any,
  productPrice?: number,
  productImage?: string
) => {
  try {
    console.log('🛒 [CartUtils] Adding to cart:', { productId, productName, quantity, selectedOptions, attachments, productPrice, productImage });

    // محاولة الحصول على بيانات المنتج من API إذا لم تكن متوفرة
    let productData = null;
    if (!productPrice || !productImage) {
      try {
        productData = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(productId));
        console.log('📦 [CartUtils] Fetched product data:', productData);
      } catch (error) {
        console.warn('⚠️ [CartUtils] Could not fetch product data:', error);
      }
    }

    const finalPrice = productPrice || productData?.price || 0;
    const finalImage = productImage || productData?.mainImage || '';

    const requestBody: any = {
      productId,
      quantity,
      productName,
      price: finalPrice,
      image: finalImage
    };

    // فقط أضف selectedOptions إذا كانت موجودة وليست فارغة
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      requestBody.selectedOptions = selectedOptions;
      console.log('📝 [CartUtils] Including selectedOptions in request:', selectedOptions);
    }

    // فقط أضف attachments إذا كانت موجودة
    if (attachments && (attachments.images?.length > 0 || attachments.text?.trim())) {
      requestBody.attachments = attachments;
      console.log('📎 [CartUtils] Including attachments in request:', attachments);
    }

    console.log('📤 [CartUtils] Final request body:', requestBody);

    // محاولة الحصول على بيانات المستخدم
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // المستخدم مسجل - حفظ في الخادم
      try {
        const user = JSON.parse(userData);
        if (!user?.id) {
          throw new Error('بيانات المستخدم غير صحيحة');
        }

        console.log('👤 [CartUtils] User is logged in, saving to server:', user.id);

        const response = await apiCall(API_ENDPOINTS.USER_CART(user.id), {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        console.log('✅ [CartUtils] Successfully added to server cart:', response);
        
        toast.success(`تم إضافة ${productName} إلى السلة بنجاح! 🛒`, {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        });

        // إطلاق حدث لتحديث عداد السلة
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return true;
      } catch (serverError) {
        console.error('❌ [CartUtils] Server error, falling back to localStorage:', serverError);
        // في حالة فشل الخادم، احفظ في localStorage
      }
    }

    // المستخدم غير مسجل أو فشل الخادم - حفظ في localStorage
    console.log('💾 [CartUtils] Saving to localStorage');
    
    // الحصول على السلة الحالية من localStorage
    const existingCart = localStorage.getItem('cart');
    let cartItems = [];
    
    if (existingCart) {
      try {
        cartItems = JSON.parse(existingCart);
        if (!Array.isArray(cartItems)) {
          cartItems = [];
        }
      } catch (parseError) {
        console.error('❌ [CartUtils] Error parsing existing cart:', parseError);
        cartItems = [];
      }
    }

    // إنشاء عنصر جديد للسلة
    const newCartItem = {
      id: Date.now(), // استخدام timestamp كـ ID مؤقت
      productId,
      quantity,
      selectedOptions: selectedOptions || {},
      optionsPricing: {},
      attachments: attachments || {},
      product: {
        id: productId,
        name: productName,
        price: finalPrice,
        mainImage: finalImage,
        stock: 999,
        productType: productData?.productType || '',
        dynamicOptions: productData?.dynamicOptions || [],
        specifications: productData?.specifications || []
      }
    };

    // البحث عن منتج مماثل في السلة
    const existingItemIndex = cartItems.findIndex((item: any) => 
      item.productId === productId && 
      JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})
    );

    if (existingItemIndex >= 0) {
      // تحديث الكمية للمنتج الموجود
      cartItems[existingItemIndex].quantity += quantity;
      // تحديث بيانات المنتج إذا كانت أحدث
      if (finalPrice > 0) cartItems[existingItemIndex].product.price = finalPrice;
      if (finalImage) cartItems[existingItemIndex].product.mainImage = finalImage;
      console.log('📝 [CartUtils] Updated existing item quantity');
    } else {
      // إضافة منتج جديد
      cartItems.push(newCartItem);
      console.log('➕ [CartUtils] Added new item to cart');
    }

    // حفظ السلة المحدثة
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    toast.success(`تم إضافة ${productName} إلى السلة بنجاح! 🛒`, {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    // إطلاق حدث لتحديث عداد السلة
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    return true;

  } catch (error) {
    console.error('❌ [CartUtils] Error adding to cart:', error);
    
    let errorMessage = 'فشل في إضافة المنتج إلى السلة';
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        errorMessage = 'المنتج غير موجود';
      } else if (error.message.includes('400')) {
        errorMessage = 'بيانات غير صحيحة';
      } else if (error.message.includes('500')) {
        errorMessage = 'خطأ في الخادم';
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 5000,
      style: {
        background: '#DC2626',
        color: 'white',
        fontWeight: 'bold'
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
      toast.error('يجب تسجيل الدخول لإضافة المنتج إلى المفضلة');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول لإضافة المنتج إلى المفضلة');
      return false;
    }

    console.log('❤️ Adding to wishlist:', { productId, productName });

    const response = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id), {
      method: 'POST',
      body: JSON.stringify({ productId })
    });

    toast.success(`تم إضافة ${productName} إلى المفضلة! ❤️`, {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#EC4899',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    // إطلاق أحداث لتحديث الواجهة
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productAddedToWishlist', { 
      detail: { productId } 
    }));
    
    return true;
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    
    let errorMessage = 'فشل في إضافة المنتج إلى المفضلة';
    if (error instanceof Error && error.message.includes('400')) {
      errorMessage = 'المنتج موجود بالفعل في المفضلة';
    }

    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 5000,
      style: {
        background: '#DC2626',
        color: 'white',
        fontWeight: 'bold'
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

    await apiCall(API_ENDPOINTS.WISHLIST_PRODUCT(user.id, productId), {
      method: 'DELETE'
    });

    toast.success(`تم حذف ${productName} من المفضلة`, {
      position: "top-center",
      autoClose: 2000,
      style: {
        background: '#6B7280',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    // إطلاق أحداث لتحديث الواجهة
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productRemovedFromWishlist', { 
      detail: { productId } 
    }));
    
    return true;
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    
    toast.error('فشل في حذف المنتج من المفضلة', {
      position: "top-center",
      autoClose: 5000,
      style: {
        background: '#DC2626',
        color: 'white',
        fontWeight: 'bold'
      }
    });
    
    return false;
  }
}; 