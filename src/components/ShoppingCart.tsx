import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, Sparkles, ArrowRight, Heart, Edit3, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from '../config/api';
import size1Image from '../assets/size1.png';
import size2Image from '../assets/size2.png';
import size3Image from '../assets/size3.png';

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

  // تحميل السلة من الخادم
  const fetchCart = useCallback(async () => {
    try {
      console.log('🛒 Loading cart...');
      setError(null);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('👤 No user logged in');
        setCartItems([]);
        setIsInitialLoading(false);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      console.log('👤 User found:', user);

      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      console.log('✅ Cart data:', data);
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setError('خطأ في تحميل السلة. تأكد من الاتصال بالإنترنت.');
      setCartItems([]);
    } finally {
      setIsInitialLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // تحديث كمية المنتج
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const userData = localStorage.getItem('user');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      await apiCall(API_ENDPOINTS.USER_CART(user.id) + `/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('فشل في تحديث الكمية');
    }
  };

  // حذف منتج من السلة
  const removeItem = async (itemId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      await apiCall(API_ENDPOINTS.USER_CART(user.id) + `/${itemId}`, {
        method: 'DELETE'
      });
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('تم حذف المنتج من السلة');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('فشل في حذف المنتج');
    }
  };

  // حساب المجموع الكلي
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.product.price;
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + price, 0) : 0;
      return total + ((basePrice + optionsPrice) * item.quantity);
    }, 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // التحقق من صحة البيانات المطلوبة
  const validateCartItems = () => {
    const incompleteItems = cartItems.filter(item => {
      if (!item.product.dynamicOptions) return false;
      
      const requiredOptions = item.product.dynamicOptions.filter(option => option.required);
      return requiredOptions.some(option => 
        !item.selectedOptions || !item.selectedOptions[option.optionName]
      );
    });
    
    return incompleteItems;
  };

  const incompleteItems = validateCartItems();
  const canProceedToCheckout = incompleteItems.length === 0;

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

    try {
      // إفراغ فوري من الواجهة
      setCartItems([]);

      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      await apiCall(API_ENDPOINTS.USER_CART(user.id), {
        method: 'DELETE'
      });

      toast.success('تم إفراغ السلة');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('خطأ في إفراغ السلة');
      fetchCart();
    }
  };

  console.log('🔄 Render state:', { 
    loading, 
    isInitialLoading, 
    error, 
    cartItemsCount: cartItems.length,
    totalItemsCount,
  });

  if (isInitialLoading) {
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
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-md border border-gray-600">
              <span className="text-lg font-bold">
                {totalItemsCount} منتج في السلة
              </span>
            </div>
            <button
              onClick={() => fetchCart()}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-full hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg transform hover:scale-105 border border-gray-600"
            >
              🔄 تحديث
            </button>
            <button
              onClick={clearCart}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-lg transform hover:scale-105 border border-red-500"
            >
              🗑️ إفراغ السلة
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-4">
            {!canProceedToCheckout && (
              <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-red-600 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-300 text-xl">⚠️</span>
                  <span className="font-bold text-red-200">
                    {incompleteItems.length} منتج يحتاج إكمال التفاصيل
                  </span>
                </div>
              </div>
            )}
            {canProceedToCheckout && (
              <div className="bg-gradient-to-r from-green-900 to-green-800 border-2 border-green-600 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-300 text-xl">✅</span>
                  <span className="font-bold text-green-200">جاهز للمتابعة</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items - Takes 3 columns */}
            <div className="xl:col-span-3">
              <div className="space-y-8">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500">
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
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Image and Price */}
                        <div className="lg:col-span-1">
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

                        {/* Product Options and Details */}
                        <div className="lg:col-span-2">
                          <div className="space-y-6">
                            {/* Product Options */}
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
                                          onChange={(e) => {
                                            const newOptions = { ...item.selectedOptions, [option.optionName]: e.target.value };
                                            setCartItems(prev => prev.map(cartItem => 
                                              cartItem.id === item.id ? { ...cartItem, selectedOptions: newOptions } : cartItem
                                            ));
                                            // Auto-save to backend
                                            apiCall(API_ENDPOINTS.USER_CART(JSON.parse(localStorage.getItem('user') || '{}').id) + `/${item.id}`, {
                                              method: 'PUT',
                                              body: JSON.stringify({ selectedOptions: newOptions })
                                            });
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
                                                onChange={(e) => {
                                                  const newOptions = { ...item.selectedOptions, [option.optionName]: e.target.value };
                                                  setCartItems(prev => prev.map(cartItem => 
                                                    cartItem.id === item.id ? { ...cartItem, selectedOptions: newOptions } : cartItem
                                                  ));
                                                  // Auto-save to backend
                                                  apiCall(API_ENDPOINTS.USER_CART(JSON.parse(localStorage.getItem('user') || '{}').id) + `/${item.id}`, {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ selectedOptions: newOptions })
                                                  });
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
                                          onChange={(e) => {
                                            const newOptions = { ...item.selectedOptions, [option.optionName]: e.target.value };
                                            setCartItems(prev => prev.map(cartItem => 
                                              cartItem.id === item.id ? { ...cartItem, selectedOptions: newOptions } : cartItem
                                            ));
                                            // Auto-save to backend
                                            apiCall(API_ENDPOINTS.USER_CART(JSON.parse(localStorage.getItem('user') || '{}').id) + `/${item.id}`, {
                                              method: 'PUT',
                                              body: JSON.stringify({ selectedOptions: newOptions })
                                            });
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
                              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-gray-700 shadow-lg">
                                <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                  <Check className="w-6 h-6 text-green-400" />
                                  الخيارات المختارة
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                                    <div key={key} className="bg-gray-700 p-4 rounded-xl border border-gray-600 shadow-sm">
                                      <span className="text-sm text-gray-300 font-medium block">{getOptionDisplayName(key)}:</span>
                                      <span className="font-bold text-white text-lg">{value}</span>
                                    </div>
                                  ))}
                                </div>
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
                                    onChange={(e) => {
                                      const newAttachments = { ...item.attachments, text: e.target.value };
                                      setCartItems(prev => prev.map(cartItem => 
                                        cartItem.id === item.id ? { ...cartItem, attachments: newAttachments } : cartItem
                                      ));
                                      // Auto-save to backend
                                      apiCall(API_ENDPOINTS.USER_CART(JSON.parse(localStorage.getItem('user') || '{}').id) + `/${item.id}`, {
                                        method: 'PUT',
                                        body: JSON.stringify({ attachments: newAttachments })
                                      });
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
                  <div className="space-y-6 mb-8">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">المجموع الفرعي:</span>
                      <span className="font-bold text-white">{totalPrice.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">رسوم التوصيل:</span>
                      <span className="text-green-400 font-bold">مجاني</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">الضريبة:</span>
                      <span className="text-gray-300">محتسبة</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-white">المجموع الكلي:</span>
                      <span className="text-green-400">
                        {totalPrice.toFixed(2)} ر.س
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
                        {incompleteItems.length} منتج يحتاج تحديد المقاسات
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Link
                      to={canProceedToCheckout ? "/checkout" : "#"}
                      onClick={(e) => {
                        if (!canProceedToCheckout) {
                          e.preventDefault();
                          toast.error('يجب إكمال تفاصيل جميع المنتجات أولاً');
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-center block transition-all text-lg shadow-lg transform ${
                        canProceedToCheckout 
                          ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:scale-105 border border-green-500' 
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
                      }`}
                    >
                      {canProceedToCheckout ? '🛒 إتمام الطلب' : '⚠️ أكمل التفاصيل أولاً'}
                    </Link>
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
    </div>
  );
};

export default ShoppingCart;