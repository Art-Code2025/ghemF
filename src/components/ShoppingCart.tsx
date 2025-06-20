import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, Sparkles, ArrowRight, Heart, Edit3, X, Check, Upload, Image as ImageIcon, AlertCircle, Truck, Gift } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from '../config/api';
import { calculateTotalWithShipping, getShippingMessage, formatShippingCost, getAmountNeededForFreeShipping, isFreeShippingEligible } from '../utils/shippingUtils';
import size1Image from '../assets/size1.png';
import size2Image from '../assets/size2.png';
import size3Image from '../assets/size3.png';
import AuthModal from './AuthModal';
import CheckoutAuthModal from './CheckoutAuthModal';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  optionsPricing?: Record<string, number>;
  attachments?: {
    images?: string[];
    text?: string;
  };
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    detailedImages?: string[];
    stock: number;
    productType?: string;
    dynamicOptions?: ProductOption[];
    specifications?: { name: string; value: string }[];
    sizeGuideImage?: string;
  };
}

interface ProductOption {
  optionName: string;
  optionType: 'select' | 'text' | 'number' | 'radio';
  required: boolean;
  options?: OptionValue[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface OptionValue {
  value: string;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState<{show: boolean, productType: string}>({show: false, productType: ''});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutAuthModalOpen, setIsCheckoutAuthModalOpen] = useState(false);
  
  // إضافة ref للـ timeout
  const textSaveTimeoutRef = useRef<number | null>(null);

  const navigate = useNavigate();

  // دالة لتحديد صورة المقاس المناسبة من assets
  const getSizeGuideImage = (productType: string): string => {
    // استخدام الصور الأصلية من مجلد src/assets
    const sizeGuideImages = {
      'جاكيت': size1Image,
      'عباية تخرج': size2Image, 
      'مريول مدرسي': size3Image
    };
    return sizeGuideImages[productType as keyof typeof sizeGuideImages] || size1Image;
  };

  // دالة لتحويل أسماء الحقول للعربية
  const getOptionDisplayName = (optionName: string): string => {
    const names: Record<string, string> = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش'
    };
    return names[optionName] || optionName;
  };

  // تحميل السلة من localStorage
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // محاولة تحميل السلة من localStorage أولاً
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            console.log('✅ [Cart] Loaded from localStorage:', parsedCart.length, 'items');
          } else {
            setCartItems([]);
          }
        } catch (parseError) {
          console.error('❌ [Cart] Error parsing localStorage cart:', parseError);
          localStorage.removeItem('cart');
          setCartItems([]);
        }
        setIsInitialLoading(false);
        setLoading(false);
        return;
      }

      // إذا لم تكن هناك سلة محلية، تحقق من وجود مستخدم مسجل
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('📭 [Cart] No user data, empty cart');
        setCartItems([]);
        setIsInitialLoading(false);
        setLoading(false);
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        console.error('❌ [Cart] Error parsing user data:', parseError);
        setCartItems([]);
        setIsInitialLoading(false);
        setLoading(false);
        return;
      }

      if (!user || !user.id) {
        console.log('📭 [Cart] Invalid user data, empty cart');
        setCartItems([]);
        setIsInitialLoading(false);
        setLoading(false);
        return;
      }

      // تحميل السلة من الخادم
      try {
        const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
        
        if (Array.isArray(data)) {
          setCartItems(data);
          // حفظ السلة في localStorage
          localStorage.setItem('cart', JSON.stringify(data));
          console.log('✅ [Cart] Loaded from server:', data.length, 'items');
        } else {
          setCartItems([]);
          console.log('📭 [Cart] Server returned empty cart');
        }
      } catch (serverError) {
        console.error('❌ [Cart] Server error, using empty cart:', serverError);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ [Cart] Error fetching cart:', error);
      setCartItems([]);
      setError(`فشل في تحميل السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  // تحميل السلة عند بداية التشغيل فقط
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // حفظ السلة في localStorage
  const saveCartToLocalStorage = useCallback((items: CartItem[]) => {
    console.log('💾 [ShoppingCart] SAVING TO LOCALSTORAGE:', {
      itemsCount: items.length,
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        optionsPricing: item.optionsPricing,
        attachments: item.attachments,
        hasSelectedOptions: !!(item.selectedOptions && Object.keys(item.selectedOptions).length > 0)
      }))
    });
    
    localStorage.setItem('cart', JSON.stringify(items));
    
    // تحقق فوري من البيانات المحفوظة
    const savedData = localStorage.getItem('cart');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('✅ [ShoppingCart] LOCALSTORAGE VERIFICATION:', {
          parsedItemsCount: parsedData.length,
          sampleItem: parsedData[0] ? {
            id: parsedData[0].id,
            selectedOptions: parsedData[0].selectedOptions,
            hasOptions: !!(parsedData[0].selectedOptions && Object.keys(parsedData[0].selectedOptions).length > 0)
          } : null
        });
      } catch (error) {
        console.error('❌ [ShoppingCart] Error parsing saved localStorage data:', error);
      }
    }
  }, []);

  // تحديث الكمية
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      saveCartToLocalStorage(updated);
      return updated;
    });

    // إذا كان المستخدم مسجل، قم بتحديث الكمية في الخادم
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        await apiCall(API_ENDPOINTS.USER_CART(user.id), {
          method: 'PUT',
          body: JSON.stringify({ itemId, quantity: newQuantity })
        });
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('فشل في تحديث الكمية');
      }
    }
  };

  // حذف منتج
  const removeItem = async (itemId: number) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      saveCartToLocalStorage(updated);
      return updated;
    });

    // إذا كان المستخدم مسجل، قم بحذف المنتج من الخادم
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        await apiCall(API_ENDPOINTS.USER_CART(user.id), {
          method: 'DELETE',
          body: JSON.stringify({ itemId })
        });
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('فشل في حذف المنتج');
      }
    }
  };

  // حساب المجموع الكلي مع الشحن
  const orderCalculation = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => {
      const basePrice = item.product.price;
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + price, 0) : 0;
      return total + ((basePrice + optionsPrice) * item.quantity);
    }, 0);
    
    return calculateTotalWithShipping(subtotal);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Get shipping message for display
  const shippingMessage = useMemo(() => {
    return getShippingMessage(orderCalculation.subtotal);
  }, [orderCalculation.subtotal]);

  // التحقق من صحة البيانات المطلوبة - محدثة وأكثر صرامة
  const validateCartItems = () => {
    const incompleteItems: Array<{
      item: CartItem;
      missingOptions: string[];
      missingRequiredCount: number;
    }> = [];

    cartItems.forEach(item => {
      if (!item.product.dynamicOptions || item.product.dynamicOptions.length === 0) {
        return; // منتج بدون خيارات مطلوبة
      }
      
      const requiredOptions = item.product.dynamicOptions.filter(option => option.required);
      if (requiredOptions.length === 0) {
        return; // لا توجد خيارات مطلوبة
      }

      const missingOptions: string[] = [];
      
      requiredOptions.forEach(option => {
        const isOptionFilled = item.selectedOptions && 
                              item.selectedOptions[option.optionName] && 
                              item.selectedOptions[option.optionName].trim() !== '';
        
        if (!isOptionFilled) {
          missingOptions.push(getOptionDisplayName(option.optionName));
        }
      });

      if (missingOptions.length > 0) {
        incompleteItems.push({
          item,
          missingOptions,
          missingRequiredCount: missingOptions.length
        });
      }
    });
    
    console.log('🔍 [Cart Validation] Incomplete items:', incompleteItems);
    return incompleteItems;
  };

  const incompleteItemsDetailed = validateCartItems();
  const canProceedToCheckout = incompleteItemsDetailed.length === 0;

  // رفع الصور
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(buildApiUrl('/upload'), {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.imageUrl);
        }
      }

      toast.success(`تم رفع ${uploadedImages.length} صورة`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('خطأ في رفع الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  // إفراغ السلة
  const clearCart = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ السلة؟')) return;

    setCartItems([]);
    localStorage.removeItem('cart');
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    toast.success('تم إفراغ السلة بنجاح', {
      position: "top-center",
      autoClose: 2000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        await apiCall(API_ENDPOINTS.USER_CART(user.id), {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
        // Don't show error toast as the local cart is already cleared
      }
    }
  };

  // دمج السلة المحلية مع سلة المستخدم عند تسجيل الدخول
  const mergeCarts = async (userId: number) => {
    const localCart = localStorage.getItem('cart');
    if (!localCart) return;

    try {
      const localItems = JSON.parse(localCart);
      
      // محاولة دمج السلة مع البكند بهدوء
      await apiCall(API_ENDPOINTS.USER_CART(userId), {
        method: 'POST',
        body: JSON.stringify({ items: localItems })
      });

      // تحديث السلة من الخادم
      const serverCart = await apiCall(API_ENDPOINTS.USER_CART(userId));
      setCartItems(serverCart);
      localStorage.setItem('cart', JSON.stringify(serverCart));
      
      console.log('✅ [Cart] Cart merged successfully with server');
    } catch (error) {
      console.log('⚠️ [Cart] Cart merge failed, keeping local cart:', error);
      // لا نظهر رسالة خطأ للمستخدم، السلة المحلية تعمل بدونها
      // السلة المحلية ستبقى كما هي والمستخدم يقدر يكمل بشكل طبيعي
    }
  };

  console.log('🔄 Render state:', { 
    loading, 
    isInitialLoading, 
    error, 
    cartItemsCount: cartItems.length,
    totalItemsCount,
  });

  // إضافة تشخيص إضافي
  console.log('🔍 [Cart Debug] Current states:', {
    loading,
    isInitialLoading,
    error,
    cartItemsLength: cartItems.length,
    userData: !!localStorage.getItem('user')
  });

  // دالة محدثة لحفظ البيانات فوراً - محدثة للعمل مع الضيوف
  const saveOptionsToBackend = async (itemId: number, field: string, value: any) => {
    try {
      // الحصول على البيانات الحالية للمنتج
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) {
        console.error('❌ [Cart] Item not found:', itemId);
        return false;
      }

      console.log('💾 [Cart] SAVE ATTEMPT:', { 
        itemId, 
        field, 
        value, 
        currentItem: {
          id: currentItem.id,
          productId: currentItem.productId,
          currentSelectedOptions: currentItem.selectedOptions,
          currentAttachments: currentItem.attachments
        }
      });

      // تحديث الـ state المحلي أولاً
      const updatedCartItems = cartItems.map(cartItem => 
        cartItem.id === itemId ? { 
          ...cartItem, 
          ...(field === 'selectedOptions' ? { selectedOptions: value } : {}),
          ...(field === 'attachments' ? { attachments: value } : {})
        } : cartItem
      );

      // تحديث state و localStorage
      setCartItems(updatedCartItems);
      saveCartToLocalStorage(updatedCartItems);
      
      console.log('✅ [Cart] State and localStorage updated successfully');

      // تحضير البيانات للبكند
      const updateData = {
        productId: currentItem.productId,
        quantity: currentItem.quantity,
        selectedOptions: field === 'selectedOptions' ? value : (currentItem.selectedOptions || {}),
        optionsPricing: currentItem.optionsPricing || {},
        attachments: field === 'attachments' ? value : (currentItem.attachments || {})
      };

      // محاولة الحفظ في البكند إذا كان المستخدم مسجل دخول
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          const response = await fetch(buildApiUrl(`user/${user.id}/cart/${itemId}`), {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Cart] Backend PUT failed:', {
              status: response.status,
              statusText: response.statusText,
              errorText
            });
            // لا نرمي خطأ هنا، البيانات محفوظة محلياً
            console.log('⚠️ [Cart] Backend save failed, but data is saved locally');
          } else {
            const result = await response.json();
            console.log('✅ [Cart] Backend PUT successful:', result);
          }
        } catch (backendError) {
          console.error('❌ [Cart] Backend error:', backendError);
          // لا نرمي خطأ هنا، البيانات محفوظة محلياً
          console.log('⚠️ [Cart] Backend save failed, but data is saved locally');
        }
      } else {
        console.log('👤 [Cart] No user logged in, data saved locally only');
      }

      return true;
    } catch (error) {
      console.error('❌ [Cart] Error saving data:', error);
      toast.error(`فشل في حفظ البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 4000,
        style: {
          background: '#DC2626',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      return false;
    }
  };

  // دالة لمعالجة نجاح تسجيل الدخول
  const handleLoginSuccess = async (user: any) => {
    // حفظ بيانات المستخدم
    localStorage.setItem('user', JSON.stringify(user));
    
    // دمج السلة المحلية مع سلة المستخدم
    await mergeCarts(user.id);
    
    // إغلاق النافذة
    setIsAuthModalOpen(false);
    
    toast.success('مرحباً بك! تم تسجيل الدخول بنجاح', {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });
  };

  if (isInitialLoading) {
    console.log('🔄 [Cart] Showing initial loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <CartIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-800">جاري تحميل السلة...</h2>
          <p className="text-gray-600 mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ [Cart] Showing error screen:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <CartIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">خطأ في تحميل السلة</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={fetchCart}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              إعادة المحاولة
            </button>
            <Link
              to="/cart/diagnostics"
              className="block w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              🔧 تشخيص المشكلة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    console.log('📦 [Cart] Showing empty cart screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <CartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
          <Link 
            to="/" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold transition-colors"
          >
            استعرض المنتجات
          </Link>
        </div>
      </div>
    );
  }

  console.log('✅ [Cart] Showing main cart content with', cartItems.length, 'items');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center shadow-lg border border-gray-600">
              <CartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                سلة التسوق
              </h1>
              <p className="text-gray-600 mt-2">مراجعة وتعديل طلبك</p>
            </div>
          </div>
          
          {/* Cart Header - Clean and Simple */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Product Count */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتج'} في السلة
                </span>
              </div>
            </div>

            {/* Clear Cart Button */}
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border border-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">إفراغ السلة</span>
              </button>
            )}
          </div>

          {/* تفاصيل المنتجات الناقصة */}
          {!canProceedToCheckout && incompleteItemsDetailed.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 mx-4 mb-6">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                يجب إكمال هذه التفاصيل قبل المتابعة:
              </h3>
              <div className="space-y-4">
                {incompleteItemsDetailed.map(({ item, missingOptions }) => (
                  <div key={item.id} className="bg-white border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-red-600 font-bold text-lg">📦</span>
                      <h4 className="font-bold text-red-800">{item.product?.name}</h4>
                    </div>
                    <p className="text-red-700 mb-2">الاختيارات المطلوبة الناقصة:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      {missingOptions.map((option, index) => (
                        <li key={index} className="font-semibold">
                          <span className="text-red-800">{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-red-800 font-bold text-center">
                  ⚠️ لن تتمكن من إتمام الطلب حتى تحديد جميع الاختيارات المطلوبة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items - Takes 3 columns */}
            <div className="xl:col-span-3">
              <div className="space-y-8">
                {cartItems.map((item, index) => (
                  <div key={item.id} data-item-id={item.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500">
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-600">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{item.product?.name || 'منتج غير معروف'}</h3>
                            <p className="text-gray-300">
                              {item.product?.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-12 h-12 bg-red-600 bg-opacity-80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg transform hover:scale-110 border border-red-500"
                            title="حذف المنتج"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 lg:p-8">
                      {/* Mobile Layout: Stack everything vertically */}
                      <div className="block lg:hidden space-y-6">
                        {/* Mobile: Product Image and Price */}
                        <div className="space-y-4">
                          {/* Main Product Image */}
                          <div className="relative group">
                            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                              {item.product?.mainImage ? (
                                <img 
                                  src={buildImageUrl(item.product.mainImage)}
                                  alt={item.product?.name || 'منتج'}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                  📦
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Mobile: Price and Quantity */}
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border-2 border-gray-700 shadow-lg">
                            <div className="text-center mb-4">
                              <div className="text-2xl font-bold text-white">
                                {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                              </div>
                              <div className="text-gray-300 mt-1">
                                {item.product?.price?.toFixed(2)} ر.س × {item.quantity}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <div className="w-16 text-center">
                                <div className="text-xl font-bold bg-gray-800 text-white py-2 rounded-xl border-2 border-gray-600 shadow-md">
                                  {item.quantity}
                                </div>
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full flex items-center justify-center hover:from-green-700 hover:to-green-800 transition-all shadow-lg transform hover:scale-110 border border-green-500"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile: Product Options - Clean and simple */}
                        {item.product.dynamicOptions && item.product.dynamicOptions.length > 0 && (
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border-2 border-gray-700 shadow-lg">
                            <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <Package className="w-6 h-6 text-blue-400" />
                              خيارات المنتج
                            </h5>
                            
                            <div className="space-y-4">
                              {item.product.dynamicOptions.map((option) => (
                                <div key={option.optionName} className="space-y-2">
                                  <label className="block text-base font-semibold text-white">
                                    {getOptionDisplayName(option.optionName)}
                                    {option.required && <span className="text-red-400 mr-2">*</span>}
                                  </label>
                                  
                                  {option.optionType === 'select' && option.options ? (
                                    <select
                                      value={item.selectedOptions?.[option.optionName] || ''}
                                      onChange={async (e) => {
                                        const newValue = e.target.value;
                                        const newOptions = { 
                                          ...item.selectedOptions, 
                                          [option.optionName]: newValue 
                                        };
                                        const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                        if (saved) {
                                          toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                            position: "top-center",
                                            autoClose: 2000,
                                            hideProgressBar: true,
                                            style: { background: '#10B981', color: 'white', fontSize: '14px', fontWeight: 'bold' }
                                          });
                                        }
                                      }}
                                      className="w-full px-3 py-3 border rounded-xl bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base"
                                      required={option.required}
                                    >
                                      <option value="">اختر {getOptionDisplayName(option.optionName)}</option>
                                      {option.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.value}
                                        </option>
                                      ))}
                                    </select>
                                  ) : option.optionType === 'radio' && option.options ? (
                                    <div className="grid grid-cols-1 gap-2">
                                      {option.options.map((opt) => (
                                        <label key={opt.value} className="flex items-center p-3 border-2 border-gray-600 bg-gray-700 rounded-xl hover:bg-gray-600 hover:border-gray-500 cursor-pointer transition-all shadow-sm">
                                          <input
                                            type="radio"
                                            name={`${item.id}-${option.optionName}`}
                                            value={opt.value}
                                            checked={item.selectedOptions?.[option.optionName] === opt.value}
                                            onChange={async (e) => {
                                              const newValue = e.target.value;
                                              const newOptions = { 
                                                ...item.selectedOptions, 
                                                [option.optionName]: newValue 
                                              };
                                              const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                              if (saved) {
                                                toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                  position: "top-center",
                                                  autoClose: 2000,
                                                  hideProgressBar: true,
                                                  style: { background: '#10B981', color: 'white', fontSize: '14px', fontWeight: 'bold' }
                                                });
                                              }
                                            }}
                                            className="ml-3 text-blue-400 scale-125"
                                          />
                                          <span className="font-medium text-white text-base">{opt.value}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <input
                                      type={option.optionType === 'number' ? 'number' : 'text'}
                                      value={item.selectedOptions?.[option.optionName] || ''}
                                      onChange={async (e) => {
                                        const newValue = e.target.value;
                                        const newOptions = { 
                                          ...item.selectedOptions, 
                                          [option.optionName]: newValue 
                                        };
                                        const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                        if (saved) {
                                          toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                            position: "top-center",
                                            autoClose: 2000,
                                            hideProgressBar: true,
                                            style: { background: '#10B981', color: 'white', fontSize: '14px', fontWeight: 'bold' }
                                          });
                                        }
                                      }}
                                      placeholder={option.placeholder}
                                      className="w-full px-3 py-3 border rounded-xl bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base"
                                      required={option.required}
                                    />
                                  )}
                                  
                                  {/* Size Guide - Only for size option */}
                                  {option.optionName === 'size' && 
                                   item.product.productType && 
                                   (item.product.productType === 'جاكيت' || item.product.productType === 'عباية تخرج' || item.product.productType === 'مريول مدرسي') && (
                                    <div className="mt-2">
                                      <button
                                        type="button"
                                        onClick={() => setShowSizeGuide({show: true, productType: item.product.productType || ''})}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500"
                                      >
                                        <span className="flex items-center justify-center gap-2">
                                          <span>👁️</span>
                                          <span>عرض دليل المقاسات</span>
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* Validation Error */}
                                  {option.required && !item.selectedOptions?.[option.optionName] && (
                                    <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-lg p-2">
                                      <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                                        <span>⚠️</span>
                                        هذا الحقل مطلوب
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mobile: Selected Options Summary */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl border-2 border-blue-700 shadow-lg">
                            <h5 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-400" />
                              المواصفات المختارة
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(item.selectedOptions).map(([key, value]) => (
                                <div key={key} className="bg-blue-700 p-3 rounded-lg border border-blue-600 shadow-sm">
                                  <span className="text-xs text-blue-200 font-medium block mb-1">{getOptionDisplayName(key)}:</span>
                                  <span className="font-bold text-white text-sm">{value}</span>
                                  {item.optionsPricing && item.optionsPricing[key] && item.optionsPricing[key] > 0 && (
                                    <span className="block text-xs text-green-300 mt-1">
                                      +{item.optionsPricing[key]} ر.س
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mobile: Attachments */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border-2 border-gray-700 shadow-lg">
                          <h5 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            ملاحظات وصور إضافية
                          </h5>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-base font-bold text-white mb-2">
                                ملاحظات خاصة
                              </label>
                              <textarea
                                value={item.attachments?.text || ''}
                                onChange={async (e) => {
                                  const newText = e.target.value;
                                  const newAttachments = { 
                                    ...item.attachments, 
                                    text: newText 
                                  };
                                  
                                  setCartItems(prev => prev.map(cartItem => 
                                    cartItem.id === item.id ? { 
                                      ...cartItem, 
                                      attachments: newAttachments 
                                    } : cartItem
                                  ));
                                  
                                  if (textSaveTimeoutRef.current) {
                                    clearTimeout(textSaveTimeoutRef.current);
                                  }
                                  
                                  textSaveTimeoutRef.current = setTimeout(async () => {
                                    const saved = await saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                    if (saved) {
                                      toast.success('✅ تم حفظ الملاحظات', {
                                        position: "bottom-right",
                                        autoClose: 1500,
                                        hideProgressBar: true,
                                        style: { background: '#8B5CF6', color: 'white', fontSize: '12px' }
                                      });
                                    }
                                  }, 1000);
                                }}
                                placeholder="أضف أي ملاحظات أو تعليمات خاصة..."
                                className="w-full px-3 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-md transition-all placeholder-gray-400 text-sm"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="block text-base font-bold text-white mb-2">
                                صور إضافية
                              </label>
                              <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg transform hover:scale-105 border border-purple-500 text-sm">
                                <Upload className="w-4 h-4" />
                                <span className="font-medium">رفع صور</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                  className="hidden"
                                />
                              </label>
                              
                              {item.attachments?.images && item.attachments.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {item.attachments.images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                      <img
                                        src={img}
                                        alt={`مرفق ${idx + 1}`}
                                        className="w-full h-16 object-cover rounded-lg border-2 border-gray-600 shadow-md group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <button
                                        onClick={() => {
                                          const newImages = item.attachments?.images?.filter((_, i) => i !== idx) || [];
                                          const newAttachments = { ...item.attachments, images: newImages };
                                          setCartItems(prev => prev.map(cartItem => 
                                            cartItem.id === item.id ? { ...cartItem, attachments: newAttachments } : cartItem
                                          ));
                                          saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110 border border-red-500"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout: Grid */}
                      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                        {/* Product Image and Price */}
                        <div className="lg:col-span-1 order-1 lg:order-1">
                          <div className="space-y-6">
                            {/* Main Product Image */}
                            <div className="relative group">
                              <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                                {item.product?.mainImage ? (
                                  <img 
                                    src={buildImageUrl(item.product.mainImage)}
                                    alt={item.product?.name || 'منتج'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                    📦
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price and Quantity */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-gray-700 shadow-lg">
                              <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-white">
                                  {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                                </div>
                                <div className="text-gray-300 mt-1">
                                  {item.product?.price?.toFixed(2)} ر.س × {item.quantity}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center gap-4">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-6 h-6" />
                                </button>
                                <div className="w-20 text-center">
                                  <div className="text-2xl font-bold bg-gray-800 text-white py-3 rounded-xl border-2 border-gray-600 shadow-md">
                                    {item.quantity}
                                  </div>
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full flex items-center justify-center hover:from-green-700 hover:to-green-800 transition-all shadow-lg transform hover:scale-110 border border-green-500"
                                >
                                  <Plus className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Options and Details - Show on all devices */}
                        <div className="lg:col-span-2 order-2 lg:order-2">
                          <div className="space-y-6">
                            {/* Product Options - Always visible */}
                            {item.product.dynamicOptions && item.product.dynamicOptions.length > 0 && (
                              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-gray-700 shadow-lg">
                                <h5 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                  <Package className="w-7 h-7 text-blue-400" />
                                  خيارات المنتج
                                </h5>
                                
                                <div className="space-y-6">
                                  {item.product.dynamicOptions.map((option) => (
                                    <div key={option.optionName} className="space-y-3">
                                      <label className="block text-lg font-semibold text-white">
                                        {getOptionDisplayName(option.optionName)}
                                        {option.required && <span className="text-red-400 mr-2">*</span>}
                                      </label>
                                      
                                      {option.optionType === 'select' && option.options ? (
                                        <select
                                          value={item.selectedOptions?.[option.optionName] || ''}
                                          onChange={async (e) => {
                                            const newValue = e.target.value;
                                            
                                            console.log('🎯 [Cart] BEFORE UPDATE:', {
                                              itemId: item.id,
                                              optionName: option.optionName,
                                              oldValue: item.selectedOptions?.[option.optionName],
                                              newValue: newValue,
                                              currentSelectedOptions: item.selectedOptions
                                            });
                                            
                                            // تحضير البيانات المحدثة
                                            const newOptions = { 
                                              ...item.selectedOptions, 
                                              [option.optionName]: newValue 
                                            };
                                            
                                            console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                            
                                            // حفظ البيانات - سيحدث الـ state تلقائياً
                                            const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                            console.log('🎯 [Cart] SAVE RESULT:', saved);
                                            
                                            if (saved) {
                                              toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                position: "top-center",
                                                autoClose: 2000,
                                                hideProgressBar: true,
                                                style: {
                                                  background: '#10B981',
                                                  color: 'white',
                                                  fontSize: '16px',
                                                  fontWeight: 'bold'
                                                }
                                              });
                                            }
                                          }}
                                          className={`w-full px-4 py-3 border rounded-xl bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
                                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-600'
                                          }`}
                                          required={option.required}
                                        >
                                          <option value="">اختر {getOptionDisplayName(option.optionName)}</option>
                                          {option.options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.value}
                                            </option>
                                          ))}
                                        </select>
                                      ) : option.optionType === 'radio' && option.options ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {option.options.map((opt) => (
                                            <label key={opt.value} className="flex items-center p-4 border-2 border-gray-600 bg-gray-700 rounded-xl hover:bg-gray-600 hover:border-gray-500 cursor-pointer transition-all shadow-sm">
                                              <input
                                                type="radio"
                                                name={`${item.id}-${option.optionName}`}
                                                value={opt.value}
                                                checked={item.selectedOptions?.[option.optionName] === opt.value}
                                                onChange={async (e) => {
                                                  const newValue = e.target.value;
                                                  
                                                  console.log('🎯 [Cart] BEFORE UPDATE:', {
                                                    itemId: item.id,
                                                    optionName: option.optionName,
                                                    oldValue: item.selectedOptions?.[option.optionName],
                                                    newValue: newValue,
                                                    currentSelectedOptions: item.selectedOptions
                                                  });
                                                  
                                                  // تحضير البيانات المحدثة
                                                  const newOptions = { 
                                                    ...item.selectedOptions, 
                                                    [option.optionName]: newValue 
                                                  };
                                                  
                                                  console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                                  
                                                  // حفظ البيانات - سيحدث الـ state تلقائياً
                                                  const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                                  console.log('🎯 [Cart] SAVE RESULT:', saved);
                                                  
                                                  if (saved) {
                                                    toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                      position: "top-center",
                                                      autoClose: 2000,
                                                      hideProgressBar: true,
                                                      style: {
                                                        background: '#10B981',
                                                        color: 'white',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                      }
                                                    });
                                                  }
                                                }}
                                                className="ml-3 text-blue-400 scale-125"
                                              />
                                              <span className="font-medium text-white">{opt.value}</span>
                                            </label>
                                          ))}
                                        </div>
                                      ) : (
                                        <input
                                          type={option.optionType === 'number' ? 'number' : 'text'}
                                          value={item.selectedOptions?.[option.optionName] || ''}
                                          onChange={async (e) => {
                                            const newValue = e.target.value;
                                            
                                            console.log('🎯 [Cart] BEFORE UPDATE:', {
                                              itemId: item.id,
                                              optionName: option.optionName,
                                              oldValue: item.selectedOptions?.[option.optionName],
                                              newValue: newValue,
                                              currentSelectedOptions: item.selectedOptions
                                            });
                                            
                                            // تحضير البيانات المحدثة
                                            const newOptions = { 
                                              ...item.selectedOptions, 
                                              [option.optionName]: newValue 
                                            };
                                            
                                            console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                            
                                            // حفظ البيانات - سيحدث الـ state تلقائياً
                                            const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                            console.log('🎯 [Cart] SAVE RESULT:', saved);
                                            
                                            if (saved) {
                                              toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                position: "top-center",
                                                autoClose: 2000,
                                                hideProgressBar: true,
                                                style: {
                                                  background: '#10B981',
                                                  color: 'white',
                                                  fontSize: '16px',
                                                  fontWeight: 'bold'
                                                }
                                              });
                                            }
                                          }}
                                          placeholder={option.placeholder}
                                          className={`w-full px-4 py-3 border rounded-xl bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
                                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-600'
                                          }`}
                                          required={option.required}
                                        />
                                      )}
                                      
                                      {/* Size Guide - Only for size option */}
                                      {option.optionName === 'size' && 
                                       item.product.productType && 
                                       (item.product.productType === 'جاكيت' || item.product.productType === 'عباية تخرج' || item.product.productType === 'مريول مدرسي') && (
                                        <div className="mt-3">
                                          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                              <h6 className="font-bold text-white flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                                دليل المقاسات
                                              </h6>
                                              <button
                                                type="button"
                                                onClick={() => setShowSizeGuide({show: true, productType: item.product.productType || ''})}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500"
                                              >
                                                <span className="flex items-center gap-2">
                                                  <span>👁️</span>
                                                  <span>عرض دليل المقاسات</span>
                                                </span>
                                              </button>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">اضغط على الزر لعرض جدول المقاسات</p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Validation Error */}
                                      {option.required && !item.selectedOptions?.[option.optionName] && (
                                        <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-lg p-3">
                                          <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                                            <span>⚠️</span>
                                            هذا الحقل مطلوب
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Selected Options Summary */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-700 shadow-lg mb-4">
                                <h5 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                  المواصفات المختارة
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                                    <div key={key} className="bg-blue-700 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-600 shadow-sm">
                                      <span className="text-xs sm:text-sm text-blue-200 font-medium block mb-1">{getOptionDisplayName(key)}:</span>
                                      <span className="font-bold text-white text-sm sm:text-lg">{value}</span>
                                      {/* عرض السعر الإضافي إذا كان موجود */}
                                      {item.optionsPricing && item.optionsPricing[key] && item.optionsPricing[key] > 0 && (
                                        <span className="block text-xs text-green-300 mt-1">
                                          +{item.optionsPricing[key]} ر.س
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {/* إجمالي السعر مع الإضافات */}
                                {item.optionsPricing && Object.values(item.optionsPricing).some(price => price > 0) && (
                                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-700 rounded-lg sm:rounded-xl border border-green-600">
                                    <span className="text-xs sm:text-sm text-green-200 font-medium">إجمالي الإضافات:</span>
                                    <span className="font-bold text-white text-sm sm:text-lg mr-2">
                                      {Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0)} ر.س
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* رسالة تحذيرية إذا لم يتم اختيار مواصفات مطلوبة */}
                            {(!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) && 
                             item.product.dynamicOptions && 
                             item.product.dynamicOptions.some(option => option.required) && (
                              <div className="bg-gradient-to-br from-red-800 to-red-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-red-700 shadow-lg mb-4">
                                <h5 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                                  مواصفات مطلوبة
                                </h5>
                                <p className="text-red-200 text-sm sm:text-base">
                                  يجب تحديد المقاسات والمواصفات المطلوبة لهذا المنتج قبل المتابعة
                                </p>
                              </div>
                            )}

                            {/* Attachments */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-gray-700 shadow-lg">
                              <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                                ملاحظات وصور إضافية
                              </h5>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-lg font-bold text-white mb-3">
                                    ملاحظات خاصة
                                  </label>
                                  <textarea
                                    value={item.attachments?.text || ''}
                                    onChange={async (e) => {
                                      const newText = e.target.value;
                                      
                                      // تحضير البيانات المحدثة
                                      const newAttachments = { 
                                        ...item.attachments, 
                                        text: newText 
                                      };
                                      
                                      console.log('📝 [Cart] Text attachment changed:', {
                                        itemId: item.id,
                                        newText,
                                        allAttachments: newAttachments
                                      });
                                      
                                      // حفظ البيانات مع debounce
                                      if (textSaveTimeoutRef.current) {
                                        clearTimeout(textSaveTimeoutRef.current);
                                      }
                                      
                                      // تحديث الـ state فوراً للـ UI
                                      setCartItems(prev => prev.map(cartItem => 
                                        cartItem.id === item.id ? { 
                                          ...cartItem, 
                                          attachments: newAttachments 
                                        } : cartItem
                                      ));
                                      
                                      textSaveTimeoutRef.current = setTimeout(async () => {
                                        const saved = await saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                        if (saved) {
                                          toast.success('✅ تم حفظ الملاحظات', {
                                            position: "bottom-right",
                                            autoClose: 1500,
                                            hideProgressBar: true,
                                            style: { background: '#8B5CF6', color: 'white', fontSize: '14px' }
                                          });
                                        }
                                      }, 1000);
                                    }}
                                    placeholder="أضف أي ملاحظات أو تعليمات خاصة..."
                                    className="w-full px-4 py-4 border-2 border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-md transition-all placeholder-gray-400"
                                    rows={4}
                                  />
                                </div>

                                <div>
                                  <label className="block text-lg font-bold text-white mb-3">
                                    صور إضافية
                                  </label>
                                  <div className="flex items-center gap-3 mb-4">
                                    <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg transform hover:scale-105 border border-purple-500">
                                      <Upload className="w-5 h-5" />
                                      <span className="font-medium">رفع صور</span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        className="hidden"
                                      />
                                    </label>
                                    {uploadingImages && (
                                      <div className="text-purple-400 font-medium">جاري الرفع...</div>
                                    )}
                                  </div>
                                  
                                  {/* Uploaded Images */}
                                  {item.attachments?.images && item.attachments.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {item.attachments.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <img
                                            src={img}
                                            alt={`مرفق ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-xl border-2 border-gray-600 shadow-md group-hover:scale-105 transition-transform duration-300"
                                          />
                                          <button
                                            onClick={() => {
                                              const newImages = item.attachments?.images?.filter((_, i) => i !== idx) || [];
                                              const newAttachments = { ...item.attachments, images: newImages };
                                              setCartItems(prev => prev.map(cartItem => 
                                                cartItem.id === item.id ? { ...cartItem, attachments: newAttachments } : cartItem
                                              ));
                                              saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110 border border-red-500"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary - Takes 1 column */}
            <div className="xl:col-span-1">
              <div className="bg-gray-800 rounded-3xl shadow-xl overflow-hidden sticky top-8 border border-gray-700">
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-6 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-center">ملخص الطلب</h3>
                  <p className="text-center text-gray-300 mt-2">مراجعة نهائية</p>
                </div>
                
                <div className="p-6">
                  {/* Free Shipping Progress Bar */}
                  {!orderCalculation.isFreeShipping && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-300">
                            أضف {getAmountNeededForFreeShipping(orderCalculation.subtotal).toFixed(0)} ر.س للحصول على شحن مجاني
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((orderCalculation.subtotal / 500) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-2 text-center">
                        {orderCalculation.subtotal.toFixed(0)} / 500 ر.س
                      </div>
                    </div>
                  )}

                  {/* Free Shipping Achievement */}
                  {orderCalculation.isFreeShipping && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-green-300">
                            🎉 مبروك! حصلت على شحن مجاني
                          </div>
                          <div className="text-xs text-green-400">
                            وفرت 50 ر.س في رسوم الشحن
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6 mb-8">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">المجموع الفرعي:</span>
                      <span className="font-bold text-white">{orderCalculation.subtotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">رسوم التوصيل:</span>
                      <span className={`font-bold ${orderCalculation.isFreeShipping ? 'text-green-400' : 'text-yellow-400'}`}>
                        {formatShippingCost(orderCalculation.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">الضريبة:</span>
                      <span className="text-gray-300">محتسبة</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-white">المجموع الكلي:</span>
                      <span className="text-green-400">
                        {orderCalculation.total.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-8">
                    <label className="block text-lg font-bold text-white mb-3">كود الخصم</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="أدخل كود الخصم"
                        className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-md transition-all placeholder-gray-400"
                      />
                      <button 
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all font-bold shadow-lg transform hover:scale-105 border border-gray-600"
                        onClick={() => {
                          if (promoCode.trim()) {
                            toast.info('جاري التحقق من كود الخصم...');
                            // Add promo code logic here
                          } else {
                            toast.error('يرجى إدخال كود الخصم');
                          }
                        }}
                      >
                        تطبيق الكود
                      </button>
                    </div>
                  </div>

                  {/* Validation Warning */}
                  {!canProceedToCheckout && (
                    <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-red-600 rounded-xl p-4 mb-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-300 text-xl">⚠️</span>
                        <span className="font-bold text-red-200">يجب إكمال التفاصيل</span>
                      </div>
                      <p className="text-red-300 text-sm">
                        {incompleteItemsDetailed.length} منتج يحتاج تحديد المقاسات
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={(e) => {
                        if (!canProceedToCheckout) {
                          e.preventDefault();
                          // رسالة تفصيلية عن المشاكل
                          const totalMissing = incompleteItemsDetailed.reduce((sum, item) => sum + item.missingRequiredCount, 0);
                          const itemsText = incompleteItemsDetailed.length === 1 ? 'منتج واحد' : `${incompleteItemsDetailed.length} منتجات`;
                          const optionsText = totalMissing === 1 ? 'اختيار واحد' : `${totalMissing} اختيارات`;
                          
                          toast.error(
                            `❌ لا يمكن إتمام الطلب!\n` +
                            `${itemsText} يحتاج إلى ${optionsText} مطلوبة\n` +
                            `يرجى إكمال جميع المقاسات والتفاصيل أولاً`, 
                            {
                              position: "top-center",
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              style: {
                                background: '#DC2626',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                borderRadius: '12px',
                                zIndex: 999999,
                                lineHeight: '1.5'
                              }
                            }
                          );
                          
                          // التمرير إلى أول منتج ناقص
                          if (incompleteItemsDetailed.length > 0) {
                            const firstIncompleteElement = document.querySelector(`[data-item-id="${incompleteItemsDetailed[0].item.id}"]`);
                            if (firstIncompleteElement) {
                              firstIncompleteElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                              });
                            }
                          }
                        } else {
                          // تأكيد إضافي قبل الانتقال
                          console.log('✅ [Cart] All validations passed, proceeding to checkout');
                          
                          // التحقق من تسجيل الدخول
                          const userData = localStorage.getItem('user');
                          if (!userData) {
                            // إذا لم يكن المستخدم مسجل، اعرض نافذة اختيار طريقة الإتمام
                            setIsCheckoutAuthModalOpen(true);
                          } else {
                            // إذا كان المستخدم مسجل، انتقل إلى صفحة الشيك اوت مباشرة
                            navigate('/checkout');
                          }
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-center block transition-all text-lg shadow-lg transform ${
                        canProceedToCheckout 
                          ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:scale-105 border border-green-500' 
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500 opacity-50'
                      }`}
                    >
                      {canProceedToCheckout ? (
                        <span className="flex items-center justify-center gap-2">
                          <span>🛒</span>
                          <span>إتمام الطلب</span>
                          <span className="text-green-200">({cartItems.length} منتج)</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>⚠️</span>
                          <span>أكمل التفاصيل أولاً</span>
                          <span className="text-gray-400">({incompleteItemsDetailed.length} ناقص)</span>
                        </span>
                      )}
                    </button>
                    <Link
                      to="/"
                      className="w-full border-2 border-gray-600 bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-600 hover:border-gray-500 font-bold text-center block transition-all transform hover:scale-105"
                    >
                      ← متابعة التسوق
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSizeGuide({show: false, productType: ''})}
        >
          <div 
            className="bg-gray-800 rounded-2xl max-w-6xl max-h-[95vh] overflow-auto relative border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-white">جدول المقاسات</h3>
                <button
                  onClick={() => setShowSizeGuide({show: false, productType: ''})}
                  className="text-gray-400 hover:text-white text-3xl font-bold hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="text-center">
                <img
                  src={getSizeGuideImage(showSizeGuide.productType)}
                  alt="دليل المقاسات"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-xl border border-gray-600"
                  onError={(e) => {
                    // في حالة فشل تحميل الصورة، استخدام صورة بديلة
                    e.currentTarget.src = size1Image;
                  }}
                />
                <p className="text-gray-400 mt-6 text-lg font-medium">
                  اضغط في أي مكان خارج الصورة للإغلاق
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Auth Modal - NEW */}
      <CheckoutAuthModal
        isOpen={isCheckoutAuthModalOpen}
        onClose={() => setIsCheckoutAuthModalOpen(false)}
        onContinueAsGuest={() => {
          setIsCheckoutAuthModalOpen(false);
          navigate('/checkout');
        }}
        onLoginSuccess={(user) => {
          setIsCheckoutAuthModalOpen(false);
          handleLoginSuccess(user);
          navigate('/checkout');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default ShoppingCart;