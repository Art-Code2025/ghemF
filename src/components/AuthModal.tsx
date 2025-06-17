import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildApiUrl } from '../config/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
      });
      setErrors({});
    }
  }, [isOpen]);

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

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);

    if (!isLogin) {
      newErrors.firstName = validateName(userData.firstName, 'الاسم الأول');
      newErrors.lastName = validateName(userData.lastName, 'اسم العائلة');
      newErrors.phone = validatePhone(userData.phone);
    }

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('🔐 [AuthModal] Attempting login with:', { email: userData.email });
      console.log('🔗 [AuthModal] LOGIN endpoint:', API_ENDPOINTS.LOGIN);
      console.log('🔗 [AuthModal] Full URL will be built by apiCall');
      
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      console.log('✅ [AuthModal] Login successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        toast.success('مرحباً بك! تم تسجيل الدخول بنجاح', {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      } else {
        throw new Error('لم يتم إرجاع بيانات المستخدم');
      }
      
    } catch (error: any) {
      console.error('❌ [AuthModal] Login error details:', error);
      console.error('❌ [AuthModal] Error message:', error.message);
      console.error('❌ [AuthModal] Error stack:', error.stack);
      
      let errorMessage = 'فشل في تسجيل الدخول';
      
      if (error.message) {
        if (error.message.includes('HTTP 404')) {
          errorMessage = 'البريد الإلكتروني غير مسجل في النظام';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'كلمة المرور غير صحيحة';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'بيانات غير صحيحة';
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = 'خطأ في الاتصال بالخادم - تأكد من تشغيل الخادم على localhost:3001';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'خطأ في الشبكة - تحقق من الاتصال';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('💬 [AuthModal] Final error message:', errorMessage);
      
      setErrors({ general: errorMessage });
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        style: {
          background: '#DC2626',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('📝 [AuthModal] Attempting registration with:', { 
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      });
      
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
      
      console.log('✅ [AuthModal] Registration successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        toast.success('مرحباً بك! تم إنشاء حسابك بنجاح', {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      } else {
        throw new Error('لم يتم إرجاع بيانات المستخدم');
      }
      
    } catch (error: any) {
      console.error('❌ [AuthModal] Registration error:', error);
      
      let errorMessage = 'فشل في إنشاء الحساب';
      
      if (error.message) {
        if (error.message.includes('HTTP 409')) {
          errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'بيانات غير صحيحة';
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = 'خطأ في الاتصال بالخادم - تأكد من تشغيل الخادم على localhost:3001';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'خطأ في الشبكة - تحقق من الاتصال';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        style: {
          background: '#DC2626',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Format Saudi phone number
  const formatSaudiPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          
          <p className="text-white/90 text-sm">
            {isLogin ? 'أدخل بيانات حسابك للدخول' : 'أكمل بياناتك لإنشاء حسابك الجديد'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Login Form */}
            {isLogin && (
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className={`w-full pr-12 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      className={`w-full pr-12 pl-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="كلمة المرور"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>
              </div>
            )}

            {/* Registration Form */}
            {!isLogin && (
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className={`w-full pr-12 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      className={`w-full pr-12 pl-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="كلمة المرور (6 أحرف على الأقل)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الاسم الأول
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        className={`w-full pr-12 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="الاسم الأول"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الاسم الأخير
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        className={`w-full pr-12 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="الاسم الأخير"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    رقم الجوال
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className={`w-full pr-12 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Register Button */}
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </div>
                  ) : (
                    <span>إنشاء حساب جديد</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Toggle between Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setUserData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  phone: ''
                });
              }}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              disabled={loading}
            >
              {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-gray-500">
            بالمتابعة، أنت توافق على 
            <Link to="/privacy-policy" className="text-purple-600 hover:underline mx-1">شروط الاستخدام</Link>
            و
            <Link to="/return-policy" className="text-purple-600 hover:underline mx-1">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 