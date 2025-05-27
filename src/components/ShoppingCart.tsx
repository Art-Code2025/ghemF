import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, Sparkles, ArrowRight, Heart, Edit3, X, Check } from 'lucide-react';

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
  // تحميل البيانات فوراً من localStorage لتجنب الفلاش
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cachedCartItems');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // No loading state - instant display
  const [updating, setUpdating] = useState(false);

  // Memoized calculations for better performance
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.product.price), 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setCartItems([]);
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        setCartItems([]);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart`);
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        setCartItems(items);
        // حفظ في localStorage لتجنب الفلاش في المرة القادمة
        localStorage.setItem('cachedCartItems', JSON.stringify(items));
      } else {
        setCartItems([]);
        localStorage.setItem('cachedCartItems', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      // No loading state needed
    }
  }, []);

  useEffect(() => {
    fetchCart();
    
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(userData);
      
      console.log('🔄 Updating quantity for item:', itemId, 'new quantity:', newQuantity);
      
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update failed:', errorText);
        throw new Error(`Failed to update quantity: ${response.status}`);
      }
      
      console.log('✅ Quantity updated successfully');
      
      // إرسال أحداث تحديث الكونتر فوراً
      window.dispatchEvent(new Event('cartUpdated'));
      localStorage.setItem('cartUpdated', Date.now().toString());
      localStorage.setItem('lastCartUpdate', new Date().toISOString());
      window.dispatchEvent(new Event('storage'));
      
      await fetchCart();
      
      // إرسال أحداث إضافية للتأكد
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 100);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('فشل في تحديث الكمية');
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      setUpdating(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(userData);
      
      console.log('🗑️ Starting delete process...');
      console.log('🗑️ Item ID to delete:', itemId, 'Type:', typeof itemId);
      console.log('🗑️ User ID:', user.id, 'Type:', typeof user.id);
      console.log('🗑️ Full URL:', `http://localhost:3001/api/user/${user.id}/cart/${itemId}`);
      
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🗑️ Response status:', response.status);
      console.log('🗑️ Response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('🗑️ Response text:', responseText);
      
      if (!response.ok) {
        console.error('❌ Delete failed with status:', response.status);
        console.error('❌ Error response:', responseText);
        throw new Error(`Failed to delete item: ${response.status} - ${responseText}`);
      }
      
      console.log('✅ Item deleted successfully from server');
      
      // إرسال أحداث تحديث الكونتر فوراً
      window.dispatchEvent(new Event('cartUpdated'));
      localStorage.setItem('cartUpdated', Date.now().toString());
      localStorage.setItem('lastCartUpdate', new Date().toISOString());
      window.dispatchEvent(new Event('storage'));
      
      // Update local state immediately
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      // Then fetch fresh data
      await fetchCart();
      toast.success('تم حذف المنتج من السلة');
      
      // إرسال أحداث إضافية للتأكد
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 100);
    } catch (error) {
      console.error('❌ Error removing item:', error);
      toast.error('فشل في حذف المنتج: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ سلة التسوق؟')) return;
    
    try {
      setUpdating(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(userData);
      
      await fetch(`http://localhost:3001/api/user/${user.id}/cart`, {
        method: 'DELETE'
      });
      
      // إرسال أحداث تحديث الكونتر فوراً
      window.dispatchEvent(new Event('cartUpdated'));
      localStorage.setItem('cartUpdated', Date.now().toString());
      localStorage.setItem('lastCartUpdate', new Date().toISOString());
      window.dispatchEvent(new Event('storage'));
      
      await fetchCart();
      toast.success('تم إفراغ سلة التسوق');
      
      // إرسال أحداث إضافية للتأكد
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 100);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('فشل في إفراغ السلة');
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSizeGuideProduct, setSelectedSizeGuideProduct] = useState<CartItem | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<{ item: CartItem; imageIndex: number } | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editingOptions, setEditingOptions] = useState<Record<string, string>>({});
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [editingAttachmentImages, setEditingAttachmentImages] = useState<File[]>([]);



  // Utility functions
  const formatOptionName = useCallback((optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش',
      fabric: 'نوع القماش',
      length: 'الطول',
      width: 'العرض'
    };
    return optionNames[optionName] || optionName;
  }, []);

  const getOptionDisplayName = useCallback((optionName: string): string => {
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
  }, []);

  const formatOptionValue = useCallback((optionName: string, value: string): string => {
    const colorTranslations: { [key: string]: string } = {
      gold: 'ذهبي',
      silver: 'فضي',
      black: 'أسود',
      white: 'أبيض',
      red: 'أحمر',
      blue: 'أزرق',
      navy: 'كحلي',
      gray: 'رمادي',
      brown: 'بني',
      burgundy: 'عنابي',
      pink: 'وردي',
      green: 'أخضر',
      purple: 'بنفسجي',
      cotton: 'قطن',
      silk: 'حرير',
      polyester: 'بوليستر',
      wool: 'صوف',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير',
      xlarge: 'كبير جداً'
    };
    
    return colorTranslations[value] || value;
  }, []);

  // دالة لتحديد صورة المقاس المناسبة
  const getSizeGuideImage = useCallback((productType: string): string => {
    const sizeGuideImages = {
      'جاكيت': '/src/assets/size1.png',
      'عباية تخرج': '/src/assets/size2.png', 
      'مريول مدرسي': '/src/assets/size3.png'
    };
    return sizeGuideImages[productType as keyof typeof sizeGuideImages] || '/src/assets/size1.png';
  }, []);

  // دالة لتوسيع/طي تفاصيل المنتج
  const toggleItemExpansion = useCallback((itemId: number) => {
    setExpandedItem(prev => prev === itemId ? null : itemId);
  }, []);

  // دالة لعرض دليل المقاسات
  const showSizeGuideModal = useCallback((item: CartItem) => {
    setSelectedSizeGuideProduct(item);
    setShowSizeGuide(true);
    document.body.style.overflow = 'hidden';
  }, []);

  // دالة لعرض الصور في مودال
  const showImageModal = useCallback((item: CartItem, imageIndex: number) => {
    setSelectedImageModal({ item, imageIndex });
  }, []);

  // دالة لفتح مودال تعديل الخيارات
  const openEditModal = useCallback((item: CartItem) => {
    setEditingItem(item);
    document.body.style.overflow = 'hidden';
    
    // تحميل الخيارات المحفوظة
    const savedOptions = localStorage.getItem(`productOptions_${item.productId}`);
    let initialOptions = item.selectedOptions || {};
    
    if (savedOptions) {
      try {
        const parsedOptions = JSON.parse(savedOptions);
        initialOptions = { ...initialOptions, ...parsedOptions };
      } catch (error) {
        console.error('Error parsing saved options:', error);
      }
    }
    
    // لا نضع قيم افتراضية - نترك الخيارات فارغة ليختار المستخدم
    // if (item.product.dynamicOptions && Object.keys(initialOptions).length === 0) {
    //   const defaultOptions: Record<string, string> = {};
    //   item.product.dynamicOptions.forEach((option: ProductOption) => {
    //     if (option.options && option.options.length > 0) {
    //       defaultOptions[option.optionName] = option.options[0].value;
    //     }
    //   });
    //   initialOptions = { ...defaultOptions, ...initialOptions };
    // }
    
    setEditingOptions(initialOptions);
    setEditingNotes(item.attachments?.text || '');
    setEditingAttachmentImages([]);
  }, []);

  // دوال التعامل مع الصور في التعديل
  const handleEditAttachmentImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditingAttachmentImages(prev => [...prev, ...files]);
  }, []);

  const removeEditAttachmentImage = useCallback((index: number) => {
    setEditingAttachmentImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // دالة للتحقق من اكتمال البيانات المطلوبة لعنصر واحد
  const validateRequiredFields = useCallback((item: CartItem): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    if (item.product.dynamicOptions) {
      item.product.dynamicOptions.forEach((option: ProductOption) => {
        if (option.required) {
          const value = editingOptions[option.optionName];
          if (!value || value.trim() === '') {
            missingFields.push(getOptionDisplayName(option.optionName));
          }
        }
      });
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }, [editingOptions, getOptionDisplayName]);

  // دالة للتحقق من جميع عناصر السلة
  const validateAllCartItems = useCallback((): { isValid: boolean; invalidItems: { item: CartItem; missingFields: string[] }[] } => {
    const invalidItems: { item: CartItem; missingFields: string[] }[] = [];
    
    cartItems.forEach(item => {
      const missingFields: string[] = [];
      
      if (item.product.dynamicOptions) {
        item.product.dynamicOptions.forEach((option: ProductOption) => {
          if (option.required) {
            const value = item.selectedOptions?.[option.optionName];
            if (!value || value.trim() === '') {
              missingFields.push(getOptionDisplayName(option.optionName));
            }
          }
        });
      }
      
      if (missingFields.length > 0) {
        invalidItems.push({ item, missingFields });
      }
    });
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  }, [cartItems, getOptionDisplayName]);

  const saveEditedOptions = useCallback(async () => {
    if (!editingItem) return;
    
    // التحقق من البيانات المطلوبة
    const validation = validateRequiredFields(editingItem);
    if (!validation.isValid) {
      toast.error(`يرجى ملء الحقول المطلوبة: ${validation.missingFields.join(', ')}`);
      return;
    }
    
    try {
      setUpdating(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(userData);
      
      // Prepare attachments
      const attachments = {
        text: editingNotes.trim() || undefined,
        images: editingAttachmentImages.map(file => file.name)
      };
      
      // Update options on server
      console.log('🔄 Updating cart options for product:', editingItem.productId);
      console.log('📝 New options:', editingOptions);
      console.log('📎 Attachments:', attachments);
      
      const response = await fetch(`http://localhost:3001/api/user/${user.id}/cart/update-options`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingItem.productId,
          selectedOptions: editingOptions,
          attachments: attachments
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response error:', errorText);
        throw new Error(`Failed to update options on server: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Options updated successfully:', result);
      
      // Close modal and refresh cart
      setEditingItem(null);
      document.body.style.overflow = 'auto';
      await fetchCart();
      
      // Show success message with details
      const optionsList = Object.entries(editingOptions)
        .map(([key, value]) => `${getOptionDisplayName(key)}: ${value}`)
        .join(', ');
      
      toast.success(
        `✅ تم تحديث خيارات ${editingItem.product.name} بنجاح!\n${optionsList}`,
        { 
          autoClose: 5000,
          style: { whiteSpace: 'pre-line' }
        }
      );
      
      // Save options in localStorage
      localStorage.setItem(`productOptions_${editingItem.productId}`, JSON.stringify(editingOptions));
      
      console.log('✅ Cart options update completed successfully');
      console.log('📋 Final options:', editingOptions);
      console.log('📎 Final attachments:', attachments);
    } catch (error) {
      console.error('Error updating options:', error);
      toast.error('فشل في تحديث خيارات المنتج');
    } finally {
      setUpdating(false);
    }
  }, [editingItem, editingOptions, editingNotes, editingAttachmentImages, validateRequiredFields, fetchCart]);

  // No loading screen - instant display

  // Empty cart state - بس لو فعلاً فارغة ومش أول تحميل
  const isInitialLoad = cartItems.length === 0 && !localStorage.getItem('cachedCartItems');
  if (cartItems.length === 0 && !isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4" dir="rtl">
        <div className="cart-empty-instant cart-no-transition cart-critical">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <CartIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
            سلة التسوق فارغة
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
          </p>
          <Link 
            to="/products" 
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:from-pink-600 hover:to-purple-700 font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center gap-2 sm:gap-3"
          >
            <span>استعرض المنتجات</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" dir="rtl">

      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <CartIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
              سلة التسوق
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <p className="text-lg text-gray-600">
              لديك {totalItemsCount} منتج في سلة التسوق
            </p>
            <button
              onClick={() => fetchCart()}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
              title="إعادة تحميل السلة"
            >
              🔄 تحديث
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-black px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white space-y-2 sm:space-y-0">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    <h2 className="text-lg sm:text-xl font-bold">منتجاتك المختارة</h2>
                  </div>
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold text-sm sm:text-base"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">إفراغ السلة</span>
                    <span className="sm:hidden">إفراغ</span>
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="space-y-4 sm:space-y-6">
                  {cartItems.map((item, index) => {
                    // التحقق من وجود بيانات مطلوبة ناقصة لهذا العنصر
                    const missingFields: string[] = [];
                    if (item.product.dynamicOptions) {
                      item.product.dynamicOptions.forEach((option: ProductOption) => {
                        if (option.required) {
                          const value = item.selectedOptions?.[option.optionName];
                          if (!value || value.trim() === '') {
                            missingFields.push(getOptionDisplayName(option.optionName));
                          }
                        }
                      });
                    }
                    const hasIncompleteData = missingFields.length > 0;

                    return (
                      <div 
                        key={item.id}
                        data-item-id={item.id}
                        className={`cart-item-instant cart-no-transition cart-critical bg-white rounded-xl border overflow-hidden shadow-sm ${
                          hasIncompleteData 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {/* تحذير البيانات الناقصة */}
                        {hasIncompleteData && (
                          <div className="bg-red-100 border-b border-red-200 px-4 sm:px-6 py-2 sm:py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">!</span>
                              <span className="text-xs sm:text-sm font-medium text-red-700">
                                يرجى إكمال البيانات المطلوبة: {missingFields.join(', ')}
                              </span>
                            </div>
                          </div>
                        )}
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-200">
                              <img 
                                src={`http://localhost:3001${item.product.mainImage}`} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 space-y-4">
                            {/* Product Name and Price */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.product.name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-gray-900">{item.product.price} ر.س</span>
                                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                    <span className="text-sm text-gray-400 line-through">{item.product.originalPrice} ر.س</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Dynamic Product Options - نفس خيارات صفحة المنتج بالضبط */}
                            {item.product.dynamicOptions && item.product.dynamicOptions.length > 0 && (
                              <div className="space-y-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">⚙️</span>
                                    خيارات المنتج
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-green-600 font-medium">متزامن مع صفحة المنتج</span>
                                  </div>
                                </h4>
                                
                                {item.product.dynamicOptions.map((option: ProductOption, index) => (
                                  <div key={index} className="space-y-3 bg-white rounded-lg p-3 border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                      <span className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs mr-2">
                                        {option.required ? '!' : '?'}
                                      </span>
                                      {getOptionDisplayName(option.optionName)}
                                      {option.required && <span className="text-red-500 mr-1">*</span>}
                                    </label>
                                    
                                    {option.optionType === 'select' && option.options && (
                                      <div className="space-y-2">
                                        {item.selectedOptions?.[option.optionName] ? (
                                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                              <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                                              <span className="text-sm font-medium text-green-800">
                                                {item.selectedOptions[option.optionName]}
                                              </span>
                                            </div>
                                            <button 
                                              onClick={() => openEditModal(item)}
                                              className="text-blue-600 text-sm hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 transition-all duration-200"
                                            >
                                              تعديل
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                              <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                                              <span className="text-sm text-yellow-800">
                                                لم يتم اختيار {getOptionDisplayName(option.optionName)}
                                              </span>
                                            </div>
                                            <button 
                                              onClick={() => openEditModal(item)}
                                              className="text-blue-600 text-sm hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 transition-all duration-200"
                                            >
                                              اختر الآن
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {option.optionType === 'text' && (
                                      <div className="space-y-2">
                                        {item.selectedOptions?.[option.optionName] ? (
                                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                              <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                                              <span className="text-sm font-medium text-green-800">
                                                "{item.selectedOptions[option.optionName]}"
                                              </span>
                                            </div>
                                            <button 
                                              onClick={() => openEditModal(item)}
                                              className="text-blue-600 text-sm hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 transition-all duration-200"
                                            >
                                              تعديل
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                              <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                                              <span className="text-sm text-yellow-800">
                                                لم يتم إدخال {getOptionDisplayName(option.optionName)}
                                              </span>
                                            </div>
                                            <button 
                                              onClick={() => openEditModal(item)}
                                              className="text-blue-600 text-sm hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 transition-all duration-200"
                                            >
                                              أدخل الآن
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Size Guide Link - Only for size option and specific product types */}
                                    {option.optionName === 'size' && 
                                     (item.product.productType === 'جاكيت' || item.product.productType === 'عباية تخرج' || item.product.productType === 'مريول مدرسي') && (
                                      <div className="mt-2">
                                        <button
                                          onClick={() => showSizeGuideModal(item)}
                                          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                        >
                                          <span className="text-sm">📐</span>
                                          <span>دليل المقاسات</span>
                                          <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                                            <span className="text-xs">👁️</span>
                                          </div>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Attachments */}
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <div className="text-sm font-medium text-purple-700 mb-2 flex items-center justify-between">
                                <span>المرفقات:</span>
                                <button 
                                  onClick={() => openEditModal(item)}
                                  className="text-blue-600 text-xs hover:text-blue-700"
                                >
                                  إضافة ملاحظات
                                </button>
                              </div>
                              {item.attachments && item.attachments.text ? (
                                <div className="text-sm text-purple-600 mb-2">
                                  <span className="font-medium">ملاحظات:</span> {item.attachments.text}
                                </div>
                              ) : (
                                <div className="text-sm text-purple-500 italic mb-2">
                                  لا توجد ملاحظات
                                </div>
                              )}
                              {item.attachments && item.attachments.images && item.attachments.images.length > 0 ? (
                                <div className="text-sm text-purple-600">
                                  <span className="font-medium">صور مرفقة:</span> {item.attachments.images.length} صورة
                                </div>
                              ) : (
                                <div className="text-sm text-purple-500 italic">
                                  لا توجد صور مرفقة
                                </div>
                              )}
                            </div>

                            {/* Quantity and Total */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">الكمية:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                                <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="cart-btn-instant px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-1 font-medium text-gray-800 bg-gray-50 min-w-12 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="cart-btn-instant px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Total Price */}
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  المجموع: {(item.quantity * item.product.price).toFixed(2)} ر.س
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                  ملخص الطلب
                </h3>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Validation Warning */}
                {(() => {
                  const validation = validateAllCartItems();
                  if (!validation.isValid) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">!</span>
                          <span className="text-red-700 font-bold">تحذير: بيانات ناقصة</span>
                        </div>
                        <div className="text-sm text-red-600">
                          <p className="mb-2">يجب إكمال البيانات المطلوبة قبل إتمام الطلب:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.invalidItems.map((invalidItem, index) => (
                              <li key={index}>
                                <span className="font-medium">{invalidItem.item.product.name}</span>: {invalidItem.missingFields.join(', ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold">عدد المنتجات</span>
                  <span className="font-bold text-base text-gray-800">{totalItemsCount}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold">المجموع الفرعي</span>
                  <span className="font-bold text-base text-gray-800">{totalPrice.toFixed(2)} ر.س</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg font-bold text-gray-800">المجموع الكلي</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                      {totalPrice.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              {(() => {
                const validation = validateAllCartItems();
                const isValid = validation.isValid;
                
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      
                      if (!isValid) {
                        // Show detailed error message
                        const errorMessages = validation.invalidItems.map(item => 
                          `${item.item.product.name}: ${item.missingFields.join(', ')}`
                        ).join('\n');
                        
                        toast.error(
                          `يرجى إكمال البيانات المطلوبة:\n${errorMessages}`,
                          { 
                            autoClose: 8000,
                            style: { whiteSpace: 'pre-line' }
                          }
                        );
                        
                        // Scroll to first invalid item
                        const firstInvalidItem = validation.invalidItems[0];
                        if (firstInvalidItem) {
                          const itemElement = document.querySelector(`[data-item-id="${firstInvalidItem.item.id}"]`);
                          if (itemElement) {
                            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight the item
                            itemElement.classList.add('animate-pulse', 'ring-4', 'ring-red-500');
                            setTimeout(() => {
                              itemElement.classList.remove('animate-pulse', 'ring-4', 'ring-red-500');
                            }, 3000);
                          }
                        }
                        
                        return;
                      }
                      
                      // If validation passes, navigate to checkout
                      window.location.href = '/checkout';
                    }}
                    disabled={!isValid}
                    className={`block w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 text-center ${
                      isValid 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 hover:shadow-lg cursor-pointer'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isValid ? 'إتمام الطلب' : 'يجب إكمال البيانات المطلوبة'}
                  </button>
                );
              })()}

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block w-full mt-3 py-2 border border-gray-900 text-gray-900 rounded-xl hover:bg-gray-100 font-semibold text-center"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && selectedSizeGuideProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => {
            setShowSizeGuide(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl max-h-[95vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-gray-800">جدول المقاسات - {selectedSizeGuideProduct.product.name}</h3>
                <button
                  onClick={() => {
              setShowSizeGuide(false);
              document.body.style.overflow = 'auto';
            }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="text-center">
                <img
                  src={getSizeGuideImage(selectedSizeGuideProduct.product.productType || '')}
                  alt="دليل المقاسات"
                  className="max-w-full h-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-size-guide.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {editingItem && (
        <div 
          className="cart-modal-fast fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9998 }}
          onClick={() => {
            setEditingItem(null);
            document.body.style.overflow = 'auto';
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">تعديل خيارات المنتج</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-green-600 font-medium">متزامن مع صفحة المنتج</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    document.body.style.overflow = 'auto';
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">{editingItem.product.name}</h4>
                <div className="text-sm text-gray-600">السعر: {editingItem.product.price} ر.س</div>
              </div>

              <div className="space-y-6">
                {/* Product Info Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`http://localhost:3001${editingItem.product.mainImage}`}
                      alt={editingItem.product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{editingItem.product.name}</h4>
                      <p className="text-sm text-gray-600">{editingItem.product.productType}</p>
                      <p className="text-sm font-medium text-green-600">السعر: {editingItem.product.price} ر.س</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Options - نفس خيارات صفحة المنتج بالضبط */}
                {editingItem.product.dynamicOptions && editingItem.product.dynamicOptions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">⚙️</span>
                      خيارات المنتج
                    </h3>
                    
                    {editingItem.product.dynamicOptions.map((option: ProductOption, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                            {option.required ? '!' : '?'}
                          </span>
                          {getOptionDisplayName(option.optionName)}
                          {option.required && <span className="text-red-500 mr-1">*</span>}
                        </label>
                        
                        {option.optionType === 'select' && option.options && (
                          <div className="space-y-3">
                            <select
                              value={editingOptions[option.optionName] || ''}
                              onChange={(e) => setEditingOptions({...editingOptions, [option.optionName]: e.target.value})}
                              className="cart-option-select w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                            >
                              <option value="">اختر {getOptionDisplayName(option.optionName)}</option>
                              {option.options.map((opt, optIndex) => (
                                <option key={optIndex} value={opt.value}>
                                  {opt.value}
                                </option>
                              ))}
                            </select>
                            
                            {/* Current Selection Display */}
                            {editingOptions[option.optionName] && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                                  <span className="text-sm font-medium text-green-800">
                                    تم اختيار: {editingOptions[option.optionName]}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {option.optionType === 'text' && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingOptions[option.optionName] || ''}
                              onChange={(e) => setEditingOptions({...editingOptions, [option.optionName]: e.target.value})}
                              placeholder={option.placeholder || `أدخل ${getOptionDisplayName(option.optionName)}`}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                            
                            {/* Current Input Display */}
                            {editingOptions[option.optionName] && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                                  <span className="text-sm font-medium text-green-800">
                                    تم إدخال: "{editingOptions[option.optionName]}"
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Validation Info */}
                            {option.validation && (
                              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                                {option.validation.minLength && (
                                  <div>الحد الأدنى: {option.validation.minLength} أحرف</div>
                                )}
                                {option.validation.maxLength && (
                                  <div>الحد الأقصى: {option.validation.maxLength} أحرف</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Size Guide Link - Only for size option and specific product types */}
                        {option.optionName === 'size' && 
                         (editingItem.product.productType === 'جاكيت' || editingItem.product.productType === 'عباية تخرج' || editingItem.product.productType === 'مريول مدرسي') && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => showSizeGuideModal(editingItem)}
                              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            >
                              <span className="text-lg">📐</span>
                              <span>عرض جدول المقاسات</span>
                              <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                                <span className="text-xs">👁️</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes/Attachments */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</span>
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="أضف أي ملاحظات خاصة بالمنتج، طلبات تخصيص، أو تعليمات خاصة..."
                    rows={4}
                  />
                  {editingNotes && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                        <span className="text-sm font-medium text-green-800">
                          تم إضافة ملاحظات ({editingNotes.length} حرف)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attachment Images */}
                  <div className="mt-4">
                    <label className="block text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs mr-2">📷</span>
                      صور إضافية (اختياري)
                    </label>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <input
                          type="file"
                          onChange={handleEditAttachmentImagesChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                          id="editAttachmentImages"
                        />
                        <label htmlFor="editAttachmentImages" className="cursor-pointer">
                          <div className="flex items-center gap-2 p-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition-colors bg-purple-50 hover:bg-purple-100">
                            <span className="text-lg">📷</span>
                            <span className="text-sm text-purple-700 font-medium">إضافة صور</span>
                          </div>
                        </label>
                      </div>
                      {editingAttachmentImages.length > 0 && (
                        <span className="text-xs text-purple-600 bg-purple-100 px-3 py-2 rounded-lg font-medium">
                          {editingAttachmentImages.length} صورة
                        </span>
                      )}
                    </div>

                    {editingAttachmentImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {editingAttachmentImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`مرفق ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-purple-200"
                            />
                            <button
                              onClick={() => removeEditAttachmentImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={saveEditedOptions}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>حفظ التغييرات</span>
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    document.body.style.overflow = 'auto';
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  <span>إلغاء</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          style={{ zIndex: 9997 }}
          onClick={() => setSelectedImageModal(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 z-10"
            >
              ✕
            </button>
            
            <div className="bg-white rounded-2xl p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {selectedImageModal.item.product.name}
              </h3>
              
              <div className="text-center">
                <img
                  src={selectedImageModal.imageIndex === 0 
                    ? `http://localhost:3001${selectedImageModal.item.product.mainImage}`
                    : `http://localhost:3001${selectedImageModal.item.product.detailedImages?.[selectedImageModal.imageIndex - 1]}`
                  }
                  alt={`صورة ${selectedImageModal.imageIndex + 1}`}
                  className="max-w-full h-auto rounded-xl shadow-lg"
                />
              </div>
              
              {/* Image Navigation */}
              {selectedImageModal.item.product.detailedImages && selectedImageModal.item.product.detailedImages.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setSelectedImageModal({
                      ...selectedImageModal,
                      imageIndex: 0
                    })}
                    className={`w-12 h-12 rounded border-2 overflow-hidden transition-all duration-300 ${
                      selectedImageModal.imageIndex === 0 ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={`http://localhost:3001${selectedImageModal.item.product.mainImage}`}
                      alt="صورة رئيسية"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  
                  {selectedImageModal.item.product.detailedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageModal({
                        ...selectedImageModal,
                        imageIndex: index + 1
                      })}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition-all duration-300 ${
                        selectedImageModal.imageIndex === index + 1 ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={`http://localhost:3001${image}`}
                        alt={`صورة ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;