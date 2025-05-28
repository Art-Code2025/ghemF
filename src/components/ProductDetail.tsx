import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { extractIdFromSlug, isValidSlug, createProductSlug } from '../utils/slugify';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Plus, 
  Minus, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Check
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { addToCartUnified, addToWishlistUnified } from '../utils/cartUtils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: ProductOption[];
  mainImage: string;
  detailedImages: string[];
  sizeGuideImage?: string;
  specifications: { name: string; value: string }[];
  createdAt: string;
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

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Review {
  id: number;
  productId: number;
  customerId: string;
  customerName: string;
  comment: string;
  createdAt: string;
}

const ProductDetail: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [attachments, setAttachments] = useState<{
    images: File[];
    text: string;
  }>({
    images: [],
    text: ''
  });
  const [loading, setLoading] = useState(false);
  const [defaultOptions, setDefaultOptions] = useState<any[]>([]);

  const getSizeGuideImage = (productType: string): string => {
    const sizeGuideImages = {
      'جاكيت': '/src/assets/size1.png',
      'عباية تخرج': '/src/assets/size2.png', 
      'مريول مدرسي': '/src/assets/size3.png'
    };
    return sizeGuideImages[productType as keyof typeof sizeGuideImages] || '/src/assets/size1.png';
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchDefaultOptions();
    }
  }, [id]);

  useEffect(() => {
    const handleOptionsUpdate = (event: CustomEvent) => {
      const { productId, options, source } = event.detail;
      if (product && productId === product.id && source === 'cart') {
        console.log(`🔄 Updating product options from cart for product ${productId}:`, options);
        setSelectedOptions(options);
      }
    };
    
    window.addEventListener('productOptionsUpdated', handleOptionsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('productOptionsUpdated', handleOptionsUpdate as EventListener);
    };
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      calculatePrice();
      fetchReviews();
    }
  }, [product, selectedOptions]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id!));
      setProduct(data);
      setSelectedImage(data.mainImage);
      
      if (data.dynamicOptions && data.dynamicOptions.length > 0) {
        const initialOptions: { [key: string]: string } = {};
        data.dynamicOptions.forEach((option: any) => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.name] = option.values[0];
          }
        });
        setSelectedOptions(initialOptions);
      }
      
      if (data.categoryId) fetchCategory(data.categoryId);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('فشل في تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultOptions = async () => {
    if (!product?.productType) return;
    
    try {
      const data = await apiCall(API_ENDPOINTS.PRODUCT_DEFAULT_OPTIONS(product.productType));
      setDefaultOptions(data);
    } catch (error) {
      console.error('Error fetching default options:', error);
    }
  };

  const fetchCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}`);
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('يجب تسجيل الدخول لإضافة تعليق');
        return;
      }

      const user = JSON.parse(userData);
      if (!newReview.comment.trim()) {
        toast.error('يرجى كتابة تعليق');
        return;
      }

      setSubmittingReview(true);

      const tempReview = {
        id: Date.now(),
        productId: parseInt(id || '0'),
        customerId: user.id.toString(),
        customerName: user.name || 'مستخدم',
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      };

      setReviews(prev => [tempReview, ...prev]);
      setNewReview({ comment: '' });

      const response = await fetch(`http://localhost:3001/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id.toString(),
          customerName: user.name,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchReviews();
      } else {
        setReviews(prev => prev.filter(review => review.id !== tempReview.id));
        setNewReview({ comment: newReview.comment });
        const errorData = await response.json();
        toast.error(errorData.message || 'فشل في إضافة التعليق');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      fetchReviews();
      setNewReview({ comment: newReview.comment });
      toast.error('فشل في إضافة التعليق');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculatePrice = () => {
    if (!product) return;
    
    setCalculatedPrice(product.price);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = {
      ...selectedOptions,
      [optionName]: value
    };
    
    setSelectedOptions(newOptions);
    
    if (product) {
      localStorage.setItem(`productOptions_${product.id}`, JSON.stringify(newOptions));
      
      window.dispatchEvent(new CustomEvent('productOptionsUpdated', {
        detail: { 
          productId: product.id, 
          options: newOptions,
          source: 'product'
        }
      }));
      
      console.log(`✅ Options updated for product ${product.id}:`, newOptions);
      console.log(`💾 Options saved to localStorage: productOptions_${product.id}`);
    }
    
    setFormErrors(prev => ({
      ...prev,
      [optionName]: ''
    }));
  };

  const handleAttachmentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleAttachmentTextChange = (text: string) => {
    setAttachments(prev => ({
      ...prev,
      text
    }));
  };

  const removeAttachmentImage = (index: number) => {
    setAttachments(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (product?.dynamicOptions) {
      product.dynamicOptions.forEach((option: ProductOption) => {
        if (option.required && !selectedOptions[option.optionName]) {
          errors[option.optionName] = `${getOptionDisplayName(option.optionName)} مطلوب`;
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.stock || 1));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const addToCart = async () => {
    if (!product) {
      toast.error('خطأ: لا يوجد منتج محدد');
      return;
    }

    if (!validateForm()) {
      toast.error('يرجى إكمال جميع البيانات المطلوبة قبل الإضافة للسلة');
      return;
    }
    
    setAddingToCart(true);

    try {
      const attachmentsData = {
        images: attachments.images.map(file => file.name),
        text: attachments.text
      };

      const success = await addToCartUnified(
        product.id, 
        product.name, 
        quantity, 
        selectedOptions, 
        attachmentsData
      );
      
      if (success) {
        // يمكن إضافة أي منطق إضافي هنا إذا لزم الأمر
      }
    } catch (error) {
      console.error('❌ Error in addToCart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!product) {
      toast.error('خطأ: لا يوجد منتج محدد');
      return;
    }

    try {
      const success = await addToWishlistUnified(product.id, product.name);
      if (success) {
        // يمكن إضافة أي منطق إضافي هنا إذا لزم الأمر
      }
    } catch (error) {
      console.error('❌ Error in addToWishlist:', error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">المنتج غير موجود</h2>
          <button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm sm:text-base"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex items-center space-x-2 text-xs sm:text-sm mb-6 sm:mb-8 overflow-x-auto" dir="ltr">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap">
            الرئيسية
          </button>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          {category && (
            <>
              <span className="text-gray-600 whitespace-nowrap">{category.name}</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            </>
          )}
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
              <div className="aspect-square overflow-hidden rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <img
                  src={selectedImage ? `http://localhost:3001${selectedImage}` : '/placeholder-image.png'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              {product.detailedImages && product.detailedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedImage(product.mainImage)}
                    className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === product.mainImage ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={`http://localhost:3001${product.mainImage}`}
                      alt="صورة رئيسية"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {product.detailedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === image ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={`http://localhost:3001${image}`}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-3 sm:mb-4">{product.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-lg sm:text-xl text-gray-400 line-through font-medium">
                            {product.originalPrice.toFixed(2)} ر.س
                          </span>
                          <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% خصم
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-pink-600">
                          {calculatedPrice.toFixed(2)} <span className="text-lg sm:text-xl lg:text-2xl">ر.س</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-pink-600">
                        {calculatedPrice.toFixed(2)} <span className="text-lg sm:text-xl lg:text-2xl">ر.س</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {product.productType && (
                  <div className="mb-3 sm:mb-4">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      {product.productType}
                    </span>
                  </div>
                )}
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">{product.description}</p>
              </div>

              {product.dynamicOptions && product.dynamicOptions.length > 0 && (
                <div className="space-y-6 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">خيارات المنتج</h3>
                  
                  {product.dynamicOptions.map((option: ProductOption, index) => (
                    <div key={index} className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-800">
                        {getOptionDisplayName(option.optionName)}
                        {option.required && <span className="text-red-500 mr-1">*</span>}
                      </label>
                      
                      {option.optionType === 'select' && option.options && (
                        <select
                          value={selectedOptions[option.optionName] || ''}
                          onChange={(e) => handleOptionChange(option.optionName, e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">اختر {getOptionDisplayName(option.optionName)}</option>
                          {option.options.map((opt, optIndex) => (
                            <option key={optIndex} value={opt.value}>
                              {opt.value}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {option.optionType === 'text' && (
                        <input
                          type="text"
                          value={selectedOptions[option.optionName] || ''}
                          onChange={(e) => handleOptionChange(option.optionName, e.target.value)}
                          placeholder={option.placeholder}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                      
                      {formErrors[option.optionName] && (
                        <p className="text-red-500 text-sm">{formErrors[option.optionName]}</p>
                      )}
                      
                      {option.optionName === 'size' && 
                       (product.productType === 'جاكيت' || product.productType === 'عباية تخرج' || product.productType === 'مريول مدرسي') && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setShowSizeGuide(true)}
                            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📐</span>
                              <span>دليل المقاسات</span>
                              <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                                <span className="text-xs">👁️</span>
                              </div>
                            </div>
                            
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse"></div>
                            
                            <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                          </button>
                          
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span>💡</span>
                            <span>اضغط لمشاهدة جدول المقاسات</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-5 h-5 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs mr-2">📎</span>
                    مرفقات إضافية (اختياري)
                  </h3>
                  
                  <div className="mb-3">
                    <textarea
                      value={attachments.text}
                      onChange={(e) => handleAttachmentTextChange(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                      placeholder="ملاحظات أو تفاصيل إضافية..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        onChange={handleAttachmentImagesChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="attachmentImages"
                      />
                      <label htmlFor="attachmentImages" className="cursor-pointer">
                        <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-500 transition-colors">
                          <span className="text-lg">📷</span>
                          <span className="text-sm text-gray-600">إضافة صور</span>
                        </div>
                      </label>
                    </div>
                    {attachments.images.length > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {attachments.images.length} صورة
                      </span>
                    )}
                  </div>

                  {attachments.images.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {attachments.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`مرفق ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeAttachmentImage(index)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-lg font-semibold text-gray-800">الكمية:</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-gray-800">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    متوفر: {product.stock} قطعة
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الإضافة...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>أضف إلى السلة</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={addToWishlist}
                    className="px-6 py-4 border-2 border-pink-500 text-pink-500 rounded-xl hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">💬</span>
                  التعليقات ({reviews.length})
                </h3>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center">
                  <span className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs mr-2">✍️</span>
                  أضف تعليقك
                </h4>
                
                <div className="mb-3">
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    placeholder="شاركنا رأيك في المنتج..."
                  />
                </div>

                <button 
                  onClick={submitReview}
                  disabled={submittingReview || !newReview.comment.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm"
                >
                  {submittingReview ? 'جاري الإرسال...' : 'إرسال التعليق'}
                </button>
              </div>

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {review.customerName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-bold text-gray-800 text-sm">{review.customerName}</h5>
                            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-600 mb-1">لا توجد تعليقات بعد</h4>
                    <p className="text-gray-500 text-sm">كن أول من يعلق على هذا المنتج</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
      </div>

      {showSizeGuide && product && (product.productType === 'جاكيت' || product.productType === 'عباية تخرج' || product.productType === 'مريول مدرسي') && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl max-h-[95vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-gray-800">جدول المقاسات</h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="text-center">
                <img
                  src={getSizeGuideImage(product.productType || '')}
                  alt="دليل المقاسات"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-xl"
                />
                <p className="text-gray-600 mt-6 text-lg font-medium">
                  اضغط في أي مكان خارج الصورة للإغلاق
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};

const RelatedProducts: React.FC<{ currentProductId: number; categoryId: number | null }> = ({ 
  currentProductId, 
  categoryId 
}) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const data = await response.json();
        
        const filtered = data.filter((product: Product) => 
          Number(product.id) !== Number(currentProductId)
        );
        
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        
        setRelatedProducts(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">منتجات ذات صلة</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => {
              const productSlug = createProductSlug(product.id, product.name);
              navigate(`/product/${productSlug}`);
            }}
          >
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.mainImage ? `http://localhost:3001${product.mainImage}` : '/placeholder-image.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-3 right-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {product.productType || 'منتج'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-md font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-400 line-through">
                          {product.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                      <span className="text-lg font-bold text-pink-600">{product.price.toFixed(2)} ر.س</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-pink-600">{product.price.toFixed(2)} ر.س</span>
                  )}
                </div>
                <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm">
                  عرض
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;