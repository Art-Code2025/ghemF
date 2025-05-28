import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  firstName: string; // اسم الكريم
  lastName: string;  // اسم العائلة
  phone: string;     // رقم الجوال السعودي
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'userInfo'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp(['', '', '', '']);
      setUserData({ email: '', firstName: '', lastName: '', phone: '' });
      setError('');
      setCountdown(0);
      setCanResend(false);
    }
  }, [isOpen]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: number;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown, step]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setCountdown(300); // 5 minutes
        setCanResend(false);
        setUserData(prev => ({ ...prev, email }));
        
        // عرض رسالة نجاح
        if (data.otp) {
          // في حالة وجود OTP في الرد (fallback)
          console.log('OTP Fallback:', data.otp);
        }
        
        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(data.message || 'فشل في إرسال رمز التحقق');
      }
    } catch (error) {
      setError('خطأ في الاتصال. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input changes
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (value && index === 3 && newOtp.every(digit => digit)) {
      handleOtpVerification(newOtp.join(''));
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (otpValue: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, otp: otpValue })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isExistingUser) {
          // Existing user - login directly
          onLoginSuccess(data.user);
          onClose();
        } else {
          // New user - continue to user info
          setStep('userInfo');
        }
      } else {
        setError(data.message || 'رمز التحقق غير صحيح');
        setOtp(['', '', '', '']);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      setError('خطأ في الاتصال. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // Format Saudi phone number
  const formatSaudiPhone = (value: string) => {
    // إزالة كل شيء عدا الأرقام
    const digits = value.replace(/\D/g, '');
    
    // تنسيق الرقم: 5XX XXX XXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  // Validate Saudi phone number
  const validateSaudiPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 9 && digits.startsWith('5');
  };

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 9) {
      const formatted = formatSaudiPhone(digits);
      setUserData(prev => ({ ...prev, phone: formatted }));
    }
  };

  // Handle user registration
  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.firstName.trim() || !userData.lastName.trim() || !userData.phone.trim()) {
      setError('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    if (!validateSaudiPhone(userData.phone)) {
      setError('الرجاء إدخال رقم جوال سعودي صحيح (يبدأ بـ 5 ويحتوي على 9 أرقام)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // تحضير البيانات مع رقم الجوال الكامل
      const fullPhoneNumber = '+966' + userData.phone.replace(/\D/g, '');
      
      const registrationData = {
        ...userData,
        phone: fullPhoneNumber
      };

      const response = await fetch('http://localhost:3001/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'فشل في إنشاء الحساب');
      }
    } catch (error) {
      setError('خطأ في الاتصال. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(300);
        setCanResend(false);
        setOtp(['', '', '', '']);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(data.message || 'فشل في إعادة إرسال رمز التحقق');
      }
    } catch (error) {
      setError('خطأ في الاتصال. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // Format countdown display
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal - Smaller and from right */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-all duration-300 animate-[slideInFromRight_0.3s_ease-out]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-4 sm:p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            {step === 'email' ? <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> : step === 'otp' ? <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> : <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {step === 'email' ? 'تسجيل الدخول' : step === 'otp' ? 'إدخال رمز التحقق' : 'إنشاء حساب جديد'}
          </h2>
          
          <p className="text-white/90 text-xs sm:text-sm">
            {step === 'email' ? 'أدخل بريدك الإلكتروني' : step === 'otp' ? 'أدخل رمز التحقق الذي إرسلناه إليك' : 'أكمل بياناتك لإنشاء حسابك الجديد'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Email Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg"
                    placeholder="example@gmail.com"
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>دخول</span>
                  </div>
                )}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {step === 'otp' && (
            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-bold border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                    maxLength={1}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Countdown Timer */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-600">
                    إعادة إرسال الرمز خلال: <span className="font-bold text-purple-600">{formatCountdown(countdown)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-purple-600 hover:text-purple-700 font-medium underline disabled:opacity-50"
                  >
                    إعادة إرسال رمز التحقق
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const otpValue = otp.join('');
                  if (otpValue.length === 4) {
                    handleOtpVerification(otpValue);
                  } else {
                    setError('الرجاء إدخال رمز التحقق كاملاً');
                  }
                }}
                disabled={loading || otp.some(digit => !digit)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>تحقق من الرمز</span>
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp(['', '', '', '']);
                  setError('');
                  setCountdown(0);
                  setCanResend(false);
                }}
                className="w-full text-gray-600 hover:text-gray-800 py-2 rounded-xl font-medium transition-colors duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>تغيير البريد الإلكتروني</span>
                </div>
              </button>
            </form>
          )}

          {/* User Info Form */}
          {step === 'userInfo' && (
            <form onSubmit={handleUserRegistration} className="space-y-6">
              {/* اسم الكريم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الكريم <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="أحمد"
                    disabled={loading}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* اسم العائلة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العائلة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="المحمد"
                    disabled={loading}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* رقم الجوال السعودي */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* كود البلد السعودية */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-lg font-medium text-gray-600 mr-2">🇸🇦</span>
                    <span className="text-sm font-medium text-gray-500">+966</span>
                  </div>
                  
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-24 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="5XX XXX XXX"
                    disabled={loading}
                    maxLength={11} // 9 digits + 2 spaces
                  />
                  <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                
                {/* معلومات إضافية */}
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ابدأ بالرقم 5 (مثال: 501234567)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>إنشاء الحساب</span>
                  </div>
                )}
              </button>

              {/* Back to OTP Button */}
              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setError('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 py-2 rounded-xl font-medium transition-colors duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لرمز التحقق</span>
                </div>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {/* Footer - Toggle between Login/Register */}
          <div className="text-center mt-6">
            {/* Step Indicators */}
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                step === 'email' ? 'bg-purple-600' : 'bg-gray-300'
              }`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                step === 'otp' ? 'bg-purple-600' : 'bg-gray-300'
              }`}></div>
              <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                step === 'userInfo' ? 'bg-purple-600' : 'bg-gray-300'
              }`}></div>
            </div>

            <p className="text-sm text-gray-600">
              {step === 'email' && 'أدخل بريدك الإلكتروني للمتابعة'}
              {step === 'otp' && `تم إرسال رمز التحقق إلى ${userData.email}`}
              {step === 'userInfo' && 'أكمل بياناتك لإنشاء حسابك'}
            </p>
          </div>

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