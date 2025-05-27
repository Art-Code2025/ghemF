import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType: string;
  dynamicOptions: ProductOption[];
  mainImage: string;
  detailedImages: string[];
  sizeGuideImage?: string;
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

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    stock: 0,
    categoryId: null,
    productType: 'وشاح وكاب',
    dynamicOptions: [],
    mainImage: '',
    detailedImages: [],
    sizeGuideImage: undefined,
  });

  console.log('�� ProductForm render - product state:', product);
  console.log('📦 ProductForm render - dynamicOptions length:', product.dynamicOptions?.length || 0);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailedImageFiles, setDetailedImageFiles] = useState<File[]>([]);
  const [sizeGuideImageFile, setSizeGuideImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultOptions, setDefaultOptions] = useState<ProductOption[]>([]);

  const productTypes = [
    'وشاح وكاب',
    'جاكيت', 
    'عباية تخرج',
    'مريول مدرسي',
    'كاب فقط'
  ];

  const fetchDefaultOptions = async (productType: string) => {
    try {
      console.log('🔍 Fetching default options for productType:', productType);
      const response = await fetch(`http://localhost:3001/api/products/default-options/${encodeURIComponent(productType)}`);
      console.log('📡 Response status:', response.status, response.ok);
      if (response.ok) {
        const options = await response.json();
        console.log('✅ Received default options:', options);
        setDefaultOptions(options);
        if (!isEditing) {
          console.log('🔄 Setting product dynamicOptions to:', options);
          setProduct(prev => ({ ...prev, dynamicOptions: options }));
        }
      } else {
        console.error('❌ Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 Error fetching default options:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect called - isEditing:', isEditing, 'id:', id);
    
    const loadData = async () => {
      // Load categories
      try {
        const response = await fetch('http://localhost:3001/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('فشل في جلب التصنيفات');
      }

      if (isEditing) {
        console.log('📝 Editing mode - fetching product data');
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:3001/api/products/${id}`);
          if (!response.ok) throw new Error('فشل في جلب المنتج');
          const data = await response.json();
          setProduct(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error(error instanceof Error ? error.message : 'حدث خطأ');
          setLoading(false);
          navigate('/admin');
        }
      } else {
        console.log('➕ New product mode - loading default options');
        // Load default options for new product
        await fetchDefaultOptions('وشاح وكاب');
      }
    };

    loadData();
  }, [id, isEditing, navigate]);

  const handleProductTypeChange = (newType: string) => {
    setProduct(prev => ({ 
      ...prev, 
      productType: newType
    }));
    fetchDefaultOptions(newType);
  };

  const handleDynamicOptionChange = (optionIndex: number, field: string, value: any) => {
    setProduct(prev => ({
      ...prev,
      dynamicOptions: prev.dynamicOptions.map((option, index) => 
        index === optionIndex 
          ? { ...option, [field]: value }
          : option
      )
    }));
  };

  const addOptionValue = (optionIndex: number) => {
    setProduct(prev => ({
      ...prev,
      dynamicOptions: prev.dynamicOptions.map((option, index) => 
        index === optionIndex 
          ? { 
              ...option, 
              options: [...(option.options || []), { value: '', price: undefined }]
            }
          : option
      )
    }));
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setProduct(prev => ({
      ...prev,
      dynamicOptions: prev.dynamicOptions.map((option, index) => 
        index === optionIndex 
          ? { 
              ...option, 
              options: (option.options || []).filter((_, vIndex) => vIndex !== valueIndex)
            }
          : option
      )
    }));
  };

  const updateOptionValue = (optionIndex: number, valueIndex: number, field: string, value: any) => {
    setProduct(prev => ({
      ...prev,
      dynamicOptions: prev.dynamicOptions.map((option, index) => 
        index === optionIndex 
          ? { 
              ...option, 
              options: (option.options || []).map((optValue, vIndex) => 
                vIndex === valueIndex 
                  ? { ...optValue, [field]: value }
                  : optValue
              )
            }
          : option
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name || product.price <= 0 || product.stock < 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('originalPrice', (product.originalPrice || 0).toString());
      formData.append('stock', product.stock.toString());
      formData.append('productType', product.productType);
      formData.append('dynamicOptions', JSON.stringify(product.dynamicOptions));
      if (product.categoryId) formData.append('categoryId', product.categoryId.toString());
      formData.append('specifications', JSON.stringify([]));
      if (mainImageFile) formData.append('mainImage', mainImageFile);
      detailedImageFiles.forEach((file) => formData.append('detailedImages', file));
      
      const url = isEditing ? `http://localhost:3001/api/products/${id}` : 'http://localhost:3001/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, { method, body: formData });
      if (!response.ok) throw new Error(isEditing ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج');
      toast.success(isEditing ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
      navigate('/admin?tab=products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'originalPrice' 
        ? (value === '' ? (name === 'originalPrice' ? 0 : 0) : parseFloat(value) || 0) 
        : value,
      categoryId: name === 'categoryId' ? (value ? parseInt(value) : null) : prev.categoryId
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setMainImageFile(e.target.files[0]);
  };

  const handleDetailedImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDetailedImageFiles(Array.from(e.target.files));
    }
  };

  const handleSizeGuideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSizeGuideImageFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">جاري تحميل بيانات المنتج...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white py-6 sm:py-8 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-lg sm:text-xl">📦</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">
                  {isEditing ? '✏️ تعديل المنتج' : '🆕 إضافة منتج جديد'}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                  {isEditing ? 'تحديث بيانات المنتج' : 'إنشاء منتج جديد في المتجر'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-sm sm:text-base"
            >
              🔙 العودة للداشبورد
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">جاري تحميل البيانات...</h2>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">📝</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">معلومات المنتج</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* Right Column - Basic Info & Category */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">ℹ️</span>
                      المعلومات الأساسية
                    </h3>
                    
                    {/* Product Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📛 اسم المنتج *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-semibold"
                        placeholder="أدخل اسم المنتج..."
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📝 وصف المنتج (اختياري)
                      </label>
                      <textarea
                        name="description"
                        value={product.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="أدخل وصف تفصيلي للمنتج (اختياري)..."
                      />
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          💰 السعر الحالي (ر.س) *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="price"
                            value={product.price || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setProduct(prev => ({ ...prev, price: value ? parseInt(value) : 0 }));
                            }}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                            placeholder="أدخل السعر"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                            ر.س
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          💸 السعر قبل الخصم (ر.س)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="originalPrice"
                            value={product.originalPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setProduct(prev => ({ ...prev, originalPrice: value ? parseInt(value) : undefined }));
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                            placeholder="السعر الأصلي (اختياري)"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                            ر.س
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stock */}
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📦 المخزون *
                      </label>
                      <input
                        type="text"
                        name="stock"
                        value={product.stock || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setProduct(prev => ({ ...prev, stock: value ? parseInt(value) : 0 }));
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-lg"
                        placeholder="عدد القطع المتوفرة"
                      />
                    </div>
                  </div>

                  {/* Category and Type */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🏷️</span>
                      التصنيف والنوع
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🗂️ التصنيف *
                        </label>
                        <select
                          name="categoryId"
                          value={product.categoryId || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-semibold"
                        >
                          <option value="">اختر التصنيف</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🎯 نوع المنتج *
                        </label>
                        <select
                          value={product.productType}
                          onChange={(e) => handleProductTypeChange(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-semibold"
                        >
                          {productTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Column - Images & Dynamic Options Preview */}
                <div className="space-y-6">
                  {/* Images Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🖼️</span>
                      صور المنتج
                    </h3>
                    
                    {/* Main Image */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        🌟 الصورة الرئيسية *
                      </label>
                      <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          onChange={handleMainImageChange}
                          accept="image/*"
                          className="hidden"
                          id="mainImage"
                        />
                        <label htmlFor="mainImage" className="cursor-pointer">
                          {product.mainImage || mainImageFile ? (
                            <div className="space-y-2">
                              <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-purple-300">
                                <img
                                  src={mainImageFile 
                                    ? URL.createObjectURL(mainImageFile) 
                                    : `http://localhost:3001${product.mainImage}`
                                  }
                                  alt="صورة رئيسية"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-purple-600 font-semibold">اضغط لتغيير الصورة</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📷</span>
                              </div>
                              <p className="text-purple-600 font-semibold">اضغط لإضافة صورة</p>
                              <p className="text-sm text-gray-500">PNG, JPG أو JPEG</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Detailed Images */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        🖼️ صور تفصيلية
                      </label>
                      <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          onChange={handleDetailedImagesChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                          id="detailedImages"
                        />
                        <label htmlFor="detailedImages" className="cursor-pointer">
                          <div className="space-y-2">
                            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">🖼️</span>
                            </div>
                            <p className="text-purple-600 font-semibold">اضغط لإضافة صور متعددة</p>
                            <p className="text-sm text-gray-500">يمكن اختيار عدة صور</p>
                          </div>
                        </label>
                      </div>

                      {/* Preview Selected Images */}
                      {(detailedImageFiles.length > 0 || product.detailedImages.length > 0) && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">الصور المختارة:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {detailedImageFiles.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`صورة ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg border-2 border-purple-200"
                                />
                              </div>
                            ))}
                            {!detailedImageFiles.length && product.detailedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={`http://localhost:3001${image}`}
                                  alt={`صورة ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg border-2 border-purple-200"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              </div>

              {/* Dynamic Options Configuration */}
              <div className="mt-8 bg-gradient-to-r from-pink-50 to-pink-100 p-8 rounded-2xl border border-pink-200">
                <h3 className="text-xl font-bold text-pink-800 mb-6 flex items-center">
                  <span className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">⚙️</span>
                  إعدادات الحقول المخصصة
                </h3>
                <div className="space-y-6">
                  {(() => {
                    console.log('🎨 Rendering dynamic options. Count:', product.dynamicOptions?.length || 0);
                    console.log('📋 Dynamic options data:', product.dynamicOptions);
                    
                    if (!product.dynamicOptions || product.dynamicOptions.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-purple-400 text-3xl">⚙️</div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد حقول مخصصة</h3>
                          <p className="text-gray-500 text-sm max-w-md mx-auto">
                            سيتم تحميل الحقول المخصصة تلقائياً عند اختيار نوع المنتج. يمكنك تخصيص هذه الحقول حسب احتياجاتك.
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-6">
                        {product.dynamicOptions.map((option, optionIndex) => (
                          <div key={optionIndex} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-all duration-300">
                            {/* Option Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                  {optionIndex + 1}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800">
                                    {option.optionName === 'nameOnSash' && '✍️ الاسم على الوشاح'}
                                    {option.optionName === 'embroideryColor' && '🎨 لون التطريز'}
                                    {option.optionName === 'capFabric' && '🧵 قماش الكاب'}
                                    {option.optionName === 'size' && '📏 المقاس'}
                                    {option.optionName === 'color' && '🌈 اللون'}
                                    {option.optionName === 'capColor' && '🎩 لون الكاب'}
                                    {option.optionName === 'dandoshColor' && '✨ لون الدندوش'}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {option.optionType === 'text' ? 'حقل نصي' : 'قائمة اختيارات'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  option.required 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                  {option.required ? '🔴 مطلوب' : '🟢 اختياري'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Text Input Configuration */}
                            {option.optionType === 'text' && (
                              <div className="bg-white rounded-lg p-5 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                  💬 نص المساعدة للعميل
                                </label>
                                <input
                                  type="text"
                                  value={option.placeholder || ''}
                                  onChange={(e) => handleDynamicOptionChange(optionIndex, 'placeholder', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                  placeholder="مثال: أدخل الاسم كما تريده على الوشاح"
                                />
                              </div>
                            )}
                            
                            {/* Select Options Configuration */}
                            {option.optionType === 'select' && (
                              <div className="bg-white rounded-lg p-5 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                                    🎯 الخيارات المتاحة للعميل
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => addOptionValue(optionIndex)}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                  >
                                    <span className="ml-2">➕</span>
                                    إضافة خيار جديد
                                  </button>
                                </div>
                                
                                {/* Options Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {(option.options || []).map((optValue, valueIndex) => (
                                    <div key={valueIndex} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-all duration-200">
                                      <div className="space-y-3">
                                        {/* Option Value */}
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الخيار</label>
                                          <input
                                            type="text"
                                            value={optValue.value}
                                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                            placeholder="مثال: ذهبي، فضي، أسود..."
                                          />
                                        </div>
                                        
                                        {/* Delete Button */}
                                        <div className="flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            title="حذف هذا الخيار"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Empty State */}
                                {(!option.options || option.options.length === 0) && (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="text-gray-400 text-2xl mb-2">📝</div>
                                    <p className="text-gray-500 text-sm">لا توجد خيارات. اضغط "إضافة خيار جديد" لبدء الإضافة</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        {isEditing ? 'تحديث المنتج' : 'حفظ المنتج'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    disabled={submitting}
                    className="flex items-center px-8 py-4 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
                  >
                    <span className="mr-2">❌</span>
                    إلغاء
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;