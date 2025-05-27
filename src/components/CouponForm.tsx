import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Coupon {
  id?: number;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  expiryDate?: string;
  isActive: boolean;
}

const CouponForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [coupon, setCoupon] = useState<Coupon>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: undefined,
    minimumAmount: undefined,
    usageLimit: undefined,
    expiryDate: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCoupon();
    }
  }, [id, isEdit]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/coupons/${id}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الكوبون');
      }
      
      const data = await response.json();
      
      // تنسيق التاريخ للعرض في input
      if (data.expiryDate) {
        data.expiryDate = new Date(data.expiryDate).toISOString().split('T')[0];
      }
      
      setCoupon(data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast.error('فشل في جلب بيانات الكوبون');
      navigate('/dashboard?tab=coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coupon.code || !coupon.name || coupon.discountValue <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    if (coupon.code.length < 3 || coupon.code.length > 20) {
      toast.error('كود الكوبون يجب أن يكون بين 3 و 20 حرف');
      return;
    }

    if (!/^[A-Z0-9_-]+$/.test(coupon.code)) {
      toast.error('كود الكوبون يجب أن يحتوي على حروف إنجليزية وأرقام فقط');
      return;
    }

    if (coupon.name.length < 3 || coupon.name.length > 100) {
      toast.error('اسم الكوبون يجب أن يكون بين 3 و 100 حرف');
      return;
    }

    if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
      toast.error('نسبة الخصم لا يمكن أن تزيد عن 100%');
      return;
    }

    if (coupon.discountType === 'fixed' && coupon.discountValue > 10000) {
      toast.error('مبلغ الخصم لا يمكن أن يزيد عن 10,000 ريال');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        ...coupon,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString() : undefined
      };

      const url = isEdit 
        ? `http://localhost:3001/api/coupons/${id}`
        : 'http://localhost:3001/api/coupons';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(isEdit ? 'فشل في تحديث الكوبون' : 'فشل في إضافة الكوبون');
      }
      
      toast.success(isEdit ? 'تم تحديث الكوبون بنجاح!' : 'تم إضافة الكوبون بنجاح!');
      navigate('/dashboard?tab=coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    // تحويل كود الكوبون إلى أحرف كبيرة وإزالة المسافات
    if (name === 'code') {
      processedValue = value.toUpperCase().replace(/\s/g, '');
    }
    
    setCoupon(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? parseFloat(processedValue) || 0
          : processedValue
    }));
  };

  const generateCouponCode = () => {
    const prefix = coupon.name.toUpperCase().replace(/\s/g, '').slice(0, 4);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setCoupon(prev => ({
      ...prev,
      code: `${prefix}${randomNum}`
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700">جاري تحميل بيانات الكوبون...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" dir="rtl">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard?tab=coupons')}
                className="flex items-center text-gray-600 hover:text-pink-600 transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى الكوبونات
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold ml-2 sm:ml-3">
                  {isEdit ? '✏️' : '🎫'}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {isEdit ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'تحديث بيانات الكوبون' : 'إنشاء كوبون خصم جديد للعملاء'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
              🎫 إدارة الكوبونات
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="w-6 h-6 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-pink-600 text-sm ml-3">📋</span>
                    المعلومات الأساسية
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        اسم الكوبون *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={coupon.name}
                        onChange={handleInputChange}
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-all duration-200"
                        placeholder="مثال: خصم الجمعة البيضاء"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        كود الكوبون *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="code"
                          value={coupon.code}
                          onChange={handleInputChange}
                          maxLength={20}
                          pattern="[A-Z0-9_-]+"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-all duration-200 font-mono"
                          placeholder="SAVE50"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateCouponCode}
                          className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 font-medium whitespace-nowrap"
                          title="توليد كود تلقائي"
                        >
                          توليد
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      وصف الكوبون *
                    </label>
                    <textarea
                      name="description"
                      value={coupon.description}
                      onChange={handleInputChange}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-all duration-200 h-24 resize-none"
                      placeholder="وصف مفصل للكوبون وشروط الاستخدام"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        نوع الخصم *
                      </label>
                      <select
                        name="discountType"
                        value={coupon.discountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-all duration-200"
                      >
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed">مبلغ ثابت (ر.س)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        قيمة الخصم *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="discountValue"
                          value={coupon.discountValue}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm transition-all duration-200"
                          placeholder="0"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {coupon.discountType === 'percentage' ? '%' : 'ر.س'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="w-6 h-6 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-purple-600 text-sm ml-3">⚙️</span>
                    الإعدادات المتقدمة
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coupon.discountType === 'percentage' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          الحد الأقصى للخصم (ر.س)
                        </label>
                        <input
                          type="number"
                          name="maxDiscount"
                          value={coupon.maxDiscount || ''}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-all duration-200"
                          placeholder="اختياري"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        الحد الأدنى للمبلغ (ر.س)
                      </label>
                      <input
                        type="number"
                        name="minimumAmount"
                        value={coupon.minimumAmount || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-all duration-200"
                        placeholder="اختياري"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        عدد مرات الاستخدام المسموح
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={coupon.usageLimit || ''}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-all duration-200"
                        placeholder="غير محدود"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        تاريخ انتهاء الصلاحية
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={coupon.expiryDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={coupon.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                    />
                    <label htmlFor="isActive" className="mr-3 text-sm font-medium text-pink-800">
                      تفعيل الكوبون (يمكن للعملاء استخدامه)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              {/* Coupon Preview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="w-6 h-6 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-pink-600 text-sm ml-3">👁️</span>
                    معاينة الكوبون
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-20 rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-20 rounded-tr-full"></div>
                    
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-2">
                        {coupon.name || 'اسم الكوبون'}
                      </h3>
                      <div className="bg-white bg-opacity-30 rounded-lg px-4 py-2 mb-4 font-mono text-center">
                        <span className="font-bold text-2xl">
                          {coupon.code || 'COUPON_CODE'}
                        </span>
                      </div>
                      <p className="text-sm mb-4 opacity-90">
                        {coupon.description || 'وصف الكوبون'}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>خصم: {coupon.discountValue || 0}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${coupon.isActive ? 'bg-pink-500' : 'bg-red-500'}`}>
                          {coupon.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isEdit ? 'تحديث الكوبون' : 'حفظ الكوبون'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard?tab=coupons')}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <h3 className="font-semibold text-pink-900 mb-2">نصائح لكوبون فعال</h3>
                    <ul className="text-sm text-pink-800 space-y-1">
                      <li>• اختر كود قصير وسهل التذكر</li>
                      <li>• حدد شروط واضحة للاستخدام</li>
                      <li>• ضع حد أقصى لتجنب الخسائر الكبيرة</li>
                      <li>• راقب استخدام الكوبون بانتظام</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm; 