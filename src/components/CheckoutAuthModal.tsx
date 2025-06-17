import React, { useState } from 'react';
import { X, User, UserPlus, ArrowRight, ShoppingCart, Shield, Clock, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinueAsGuest, 
  onLoginSuccess 
}) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'البريد الإلكتروني مطلوب';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'البريد الإلكتروني غير صحيح';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'كلمة المرور مطلوبة';
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return '';
  };

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return `${fieldName} مطلوب`;
    if (name.length < 2) return `${fieldName} يجب أن يكون حرفين على الأقل`;
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return 'رقم الجوال مطلوب';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) return 'رقم الجوال يجب أن يكون 9 أرقام';
    if (!cleanPhone.startsWith('5')) return 'رقم الجوال يجب أن يبدأ بـ 5';
    return '';
  };

  // Handle login
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('🔐 [CheckoutAuthModal] Attempting login');
      
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Login successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        toast.success('مرحباً بك! تم تسجيل الدخول بنجاح', {
          position: "top-center",
          autoClose: 2000,
        });
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Login error:', error);
      
      let errorMessage = 'فشل في تسجيل الدخول';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = 'البريد الإلكتروني غير مسجل';
        } else if (status === 401) {
          errorMessage = 'كلمة المرور غير صحيحة';
        }
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    newErrors.firstName = validateName(userData.firstName, 'الاسم الأول');
    newErrors.lastName = validateName(userData.lastName, 'اسم العائلة');
    newErrors.phone = validatePhone(userData.phone);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('📝 [CheckoutAuthModal] Attempting registration');
      
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Registration successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        toast.success('مرحباً بك! تم إنشاء حسابك بنجاح', {
          position: "top-center",
          autoClose: 2000,
        });
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Registration error:', error);
      
      let errorMessage = 'فشل في إنشاء الحساب';
      
      if (error.response?.status === 409) {
        errorMessage = 'البريد الإلكتروني مسجل بالفعل';
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset to main view
  const resetToMain = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setUserData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setErrors({});
  };

  // Format phone number
  const formatSaudiPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">إتمام الطلب</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Main Choice View */}
        {!showLoginForm && !showRegisterForm && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                اختر طريقة إتمام طلبك
              </h3>
              <p className="text-gray-600 text-sm">
                يمكنك إتمام طلبك كضيف أو تسجيل الدخول للحصول على مميزات إضافية
              </p>
            </div>

            {/* Continue as Guest Option */}
            <div className="space-y-4">
              <button
                onClick={onContinueAsGuest}
                className="w-full p-4 border-2 border-blue-200 hover:border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-900">متابعة كضيف</h4>
                      <p className="text-sm text-gray-600">طريقة سريعة لإتمام طلبك</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Login Option */}
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full p-4 border-2 border-green-200 hover:border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-900">تسجيل الدخول</h4>
                      <p className="text-sm text-gray-600">احفظ طلباتك وتتبع شحناتك</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Register Option */}
              <button
                onClick={() => setShowRegisterForm(true)}
                className="w-full p-4 border-2 border-purple-200 hover:border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-900">إنشاء حساب جديد</h4>
                      <p className="text-sm text-gray-600">احصل على مميزات الأعضاء</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-gray-900 mb-3 text-sm">مميزات إنشاء الحساب:</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>تتبع طلباتك بسهولة</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>احفظ منتجاتك المفضلة</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>حفظ عناوين التوصيل</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        {showLoginForm && (
          <div className="p-6">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">رجوع</span>
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">تسجيل الدخول</h3>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل بريدك الإلكتروني"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل كلمة المرور"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </div>
          </div>
        )}

        {/* Register Form */}
        {showRegisterForm && (
          <div className="p-6">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">رجوع</span>
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">إنشاء حساب جديد</h3>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="أحمد"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="محمد"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الجوال
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +966
                  </span>
                  <input
                    type="tel"
                    value={formatSaudiPhone(userData.phone)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setUserData({ ...userData, phone: value });
                      }
                    }}
                    className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="5XX XXX XXX"
                    dir="ltr"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutAuthModal; 