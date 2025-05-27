import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // إنشاء تأثير الجزيئات المتحركة في الخلفية
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      if (!container) return;
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 8 + 2;
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
      }
    };
    
    createParticles();
    
    // إضافة تأثير الانعكاس عند النقر على حقول الإدخال
    const focusEffect = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      
      ripple.className = 'focus-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      
      (e.target as HTMLElement).appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 1000);
    };
    
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
      input.addEventListener('mousedown', focusEffect as EventListener);
    });
    
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('mousedown', focusEffect as EventListener);
      });
    };
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // محاكاة للتأخير البسيط للتأثير البصري
    setTimeout(() => {
      if (email === 'admin' && password === '11111') {
        const form = document.querySelector('.login-form');
        form?.classList.add('success-animation');
        
        localStorage.setItem('isAuthenticated', 'true');
        
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        setError('الإيميل أو كلمة المرور غير صحيحة');
        const errorElement = document.querySelector('.error-message');
        errorElement?.classList.add('shake-animation');
        setTimeout(() => {
          errorElement?.classList.remove('shake-animation');
        }, 500);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* التنسيقات المخصصة */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
          
          * {
            font-family: 'Tajawal', sans-serif;
          }

          /* تأثير الخلفية المتدرجة */
          @keyframes gradientShift {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
          
          .background-gradient {
            background: linear-gradient(-45deg, #0B132B, #1C2541, #3A506B, #5BC0BE, #0B132B);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          
          /* تأثير الكارت والظل */
          .card-shadow {
            box-shadow: 0 0 50px rgba(91, 192, 190, 0.3), 0 0 100px rgba(91, 192, 190, 0.1);
          }
          
          .glass-effect {
            background: rgba(28, 37, 65, 0.7);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(91, 192, 190, 0.3);
            border-radius: 24px;
            transition: all 0.5s ease;
          }
          
          .glass-effect:hover {
            box-shadow: 0 0 80px rgba(91, 192, 190, 0.5);
            transform: translateY(-5px);
          }
          
          /* تأثير تعويم الشعار */
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          
          .logo-float {
            animation: floating 6s ease-in-out infinite;
          }
          
          /* تأثير الجزيئات المتحركة */
          .particles-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
          }
          
          .particle {
            position: absolute;
            background: rgba(91, 192, 190, 0.5);
            border-radius: 50%;
            opacity: 0.5;
            pointer-events: none;
            transform: scale(0);
            z-index: 0;
            animation: floatUp 20s linear infinite;
          }
          
          @keyframes floatUp {
            0% { 
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            25% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(50vh) scale(1);
              opacity: 0.5;
            }
            75% {
              opacity: 0.8;
            }
            100% { 
              transform: translateY(-100px) scale(0);
              opacity: 0;
            }
          }
          
          /* تأثيرات حقول الإدخال */
          .input-field {
            background: rgba(11, 19, 43, 0.5);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .input-field:focus {
            background: rgba(11, 19, 43, 0.8);
            border-color: #5BC0BE;
            box-shadow: 0 0 15px rgba(91, 192, 190, 0.5);
          }
          
          /* تأثير الانعكاس عند النقر */
          .focus-ripple {
            position: absolute;
            width: 5px;
            height: 5px;
            background: rgba(91, 192, 190, 0.8);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 1s linear;
            z-index: 0;
          }
          
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 0.8;
            }
            100% {
              transform: scale(200);
              opacity: 0;
            }
          }
          
          /* تأثيرات زر تسجيل الدخول */
          .login-button {
            background: linear-gradient(45deg, #5BC0BE, #3A506B);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            z-index: 1;
          }
          
          .login-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #3A506B, #5BC0BE);
            opacity: 0;
            transition: opacity 0.5s ease;
            z-index: -1;
          }
          
          .login-button:hover::before {
            opacity: 1;
          }
          
          .login-button:active {
            transform: scale(0.98);
          }
          
          .button-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
          
          /* تأثير الدوران للوودر */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spinner {
            animation: spin 1.5s linear infinite;
          }
          
          /* تأثير الاهتزاز لرسالة الخطأ */
          .shake-animation {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          /* تأثير نجاح تسجيل الدخول */
          .success-animation {
            animation: successPulse 0.8s ease;
          }
          
          @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(91, 192, 190, 0.8); }
            100% { transform: scale(0.95); opacity: 0; }
          }
          
          /* تأثير إظهار/إخفاء كلمة المرور */
          .toggle-password {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          
          .toggle-password:hover {
            color: #5BC0BE;
          }
          
          /* تنسيق تسميات الحقول */
          .input-label {
            position: relative;
            display: inline-block;
            margin-bottom: 10px;
            padding-right: 10px;
            transition: all 0.3s ease;
          }
          
          .input-label::before {
            content: '';
            position: absolute;
            height: 100%;
            width: 3px;
            background: #5BC0BE;
            right: 0;
            border-radius: 3px;
          }
        `}
      </style>

      {/* الخلفية المتدرجة المتحركة */}
      <div className="background-gradient absolute inset-0">
        <div className="particles-container"></div>
      </div>

      {/* كارت تسجيل الدخول */}
      <div className="relative z-10 glass-effect p-6 sm:p-8 lg:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg card-shadow">
        {/* الشعار المتحرك */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="logo-float bg-white bg-opacity-10 p-3 sm:p-4 lg:p-5 rounded-full">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-teal-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-2">تسجيل الدخول</h2>
        <p className="text-gray-300 text-center mb-6 sm:mb-8 text-sm sm:text-base">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 error-message">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 ml-2 sm:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-300 text-xs sm:text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="login-form">
          {/* حقل البريد الإلكتروني */}
          <div className="mb-4 sm:mb-5">
            <div className="input-label">
              <label className="text-white font-medium text-xs sm:text-sm">البريد الإلكتروني</label>
            </div>
            <div className="relative mt-1">
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-teal-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full p-3 sm:p-4 pr-10 sm:pr-12 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-0 text-sm sm:text-base"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
          </div>
          
          {/* حقل كلمة المرور */}
          <div className="mb-6 sm:mb-8">
            <div className="input-label">
              <label className="text-white font-medium text-xs sm:text-sm">كلمة المرور</label>
            </div>
            <div className="relative mt-1">
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-teal-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full p-3 sm:p-4 pr-10 sm:pr-12 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-0 text-sm sm:text-base"
                placeholder="أدخل كلمة المرور"
                required
              />
              {/* زر إظهار/إخفاء كلمة المرور */}
              <div 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
          
          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            className="login-button w-full py-3 sm:py-4 rounded-xl text-white text-base sm:text-lg font-semibold transition-all duration-300"
          >
            <div className="button-content">
              {loading ? (
                <svg className="spinner w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;