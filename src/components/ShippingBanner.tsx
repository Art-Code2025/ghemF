import React, { useState } from 'react';
import { X } from 'lucide-react';

const ShippingBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes scroll-banner {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .banner-scroll {
            animation: scroll-banner 25s linear infinite;
          }
          @media (max-width: 640px) {
            .banner-scroll {
              animation: scroll-banner 20s linear infinite;
            }
          }
        `}
      </style>
      <div className="relative bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white overflow-hidden z-50 shadow-sm">
        <div className="relative h-10 sm:h-12 flex items-center">
          {/* Scrolling Text Container */}
          <div className="flex-1 overflow-hidden">
            <div className="banner-scroll whitespace-nowrap">
              <span className="inline-block text-xs sm:text-sm md:text-base font-medium px-4 sm:px-6">
                🚚 شحن مجاني للطلبات فوق 500 ريال سعودي • ⭐ خدمة عملاء متاحة 24/7 • 🎁 ضمان الجودة واسترداد المبلغ • 📦 توصيل سريع لجميع مناطق المملكة
              </span>
            </div>
          </div>

          {/* Close Button */}
          <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 group"
              aria-label="إغلاق الإعلان"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:text-pink-200 transition-colors" />
            </button>
          </div>
        </div>

        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </>
  );
};

export default ShippingBanner; 