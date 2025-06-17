import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      if (response.user) {
        onLoginSuccess(response.user);
        onClose();
        toast.success('تم تسجيل الدخول بنجاح! 🎉', {
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
      console.error('Login error:', error);
      
      let errorMessage = 'حدث خطأ غير متوقع';
      
      if (error.message.includes('404')) {
        errorMessage = 'البريد الإلكتروني غير مسجل في النظام';
      } else if (error.message.includes('401')) {
        errorMessage = 'كلمة المرور غير صحيحة';
      } else if (error.message.includes('400')) {
        errorMessage = 'بيانات غير صحيحة';
      } else if (error.message.includes('500')) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      } else if (error.message) {
        errorMessage = error.message;
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

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.user) {
        onLoginSuccess(response.user);
        onClose();
        toast.success('تم إنشاء الحساب بنجاح! 🎉', {
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
      console.error('Registration error:', error);
      
      let errorMessage = 'حدث خطأ غير متوقع';
      
      if (error.message.includes('400') && error.message.includes('مسجل')) {
        errorMessage = 'البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول أو استخدام بريد آخر';
      } else if (error.message.includes('400')) {
        errorMessage = 'بيانات غير صحيحة، يرجى التحقق من جميع الحقول';
      } else if (error.message.includes('500')) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      } else if (error.message) {
        errorMessage = error.message;
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
          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => {
                      setUserData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="example@gmail.com"
                    disabled={loading}
                    dir="ltr"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) => {
                      setUserData(prev => ({ ...prev, password: e.target.value }));
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                    dir="ltr"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    جاري الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>دخول</span>
                  </div>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => {
                      setUserData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="example@gmail.com"
                    disabled={loading}
                    dir="ltr"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) => {
                      setUserData(prev => ({ ...prev, password: e.target.value }));
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                    dir="ltr"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الأول
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => {
                        setUserData(prev => ({ ...prev, firstName: e.target.value }));
                        if (errors.firstName) {
                          setErrors(prev => ({ ...prev, firstName: '' }));
                        }
                      }}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                        errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="أحمد"
                      disabled={loading}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العائلة
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => {
                        setUserData(prev => ({ ...prev, lastName: e.target.value }));
                        if (errors.lastName) {
                          setErrors(prev => ({ ...prev, lastName: '' }));
                        }
                      }}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                        errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="المحمد"
                      disabled={loading}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => {
                      const formatted = formatSaudiPhone(e.target.value);
                      setUserData(prev => ({ ...prev, phone: formatted }));
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="5XX XXX XXX"
                    disabled={loading}
                    dir="ltr"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>إنشاء الحساب</span>
                  </div>
                )}
              </button>
            </form>
          )}

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
            <a href="#" className="text-purple-600 hover:underline mx-1">شروط الاستخدام</a>
            و
            <a href="#" className="text-purple-600 hover:underline mx-1">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 