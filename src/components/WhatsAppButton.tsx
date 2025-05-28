import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const WhatsAppButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const phoneNumber = '+966551064118';
  const message = 'مرحباً، أريد الاستفسار عن منتجاتكم';

  useEffect(() => {
    // إذا كانت الصفحة الرئيسية، اظهر الزر بعد السكرول
    if (location.pathname === '/') {
      const handleScroll = () => {
        // اظهر الزر بعد السكرول 300px من الأعلى
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setIsVisible(scrollTop > 300);
      };

      window.addEventListener('scroll', handleScroll);
      
      // تحقق من الموضع الحالي عند تحميل الصفحة
      handleScroll();

      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // في باقي الصفحات، اظهر الزر دائماً
      setIsVisible(true);
    }
  }, [location.pathname]);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // لا تظهر الزر إذا لم يكن مرئياً
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 sm:bottom-8 sm:left-6 z-50 mobile-safe-bottom">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes whatsapp-bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
            }
            60% {
              transform: translateY(-4px);
            }
          }
          
          @keyframes whatsapp-glow {
            0%, 100% {
              box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
            }
            50% {
              box-shadow: 0 4px 30px rgba(37, 211, 102, 0.6), 0 0 20px rgba(37, 211, 102, 0.4);
            }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          
          .animate-wiggle {
            animation: wiggle 1s ease-in-out infinite alternate;
          }
          
          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          .ripple-effect {
            position: relative;
            overflow: hidden;
          }
          
          .ripple-effect::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(37, 211, 102, 0.3);
            animation: ripple 2s infinite;
            z-index: 0;
          }
        `
      }} />
      <button
        onClick={handleWhatsAppClick}
        className="group relative bg-green-500 hover:bg-green-600 text-white p-4 sm:p-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none ripple-effect mobile-touch-target mobile-shadow-strong"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 6px 24px rgba(37, 211, 102, 0.4)',
          animation: 'whatsapp-bounce 2s infinite, whatsapp-glow 3s infinite',
        }}
        aria-label="تواصل معنا عبر الواتساب"
      >
        {/* أيقونة الواتساب SVG */}
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-9 sm:h-9 transition-transform duration-300 group-hover:scale-110 animate-wiggle relative z-10"
        >
          <path 
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488" 
            fill="white"
          />
        </svg>
        
        {/* رسالة التحفيز المحسنة */}
        <div className="hidden sm:block absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-white to-green-50 text-gray-800 px-4 py-2 rounded-xl shadow-xl border border-green-100 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none text-sm font-semibold z-20">
          💬 تواصل معنا الآن
          {/* السهم المحسن */}
          <div className="absolute left-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
        </div>
      </button>
    </div>
  );
};

export default WhatsAppButton;