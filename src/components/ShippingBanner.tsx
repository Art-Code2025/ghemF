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
            animation: scroll-banner 15s linear infinite;
          }
          @media (max-width: 640px) {
            .banner-scroll {
              animation: scroll-banner 10s linear infinite;
            }
          }
        `}
      </style>
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white overflow-hidden m-0 p-0 block leading-none">
        <div className="relative h-8 sm:h-9 flex items-center m-0 p-0">
          {/* Scrolling Text Container */}
          <div className="flex-1 overflow-hidden">
            <div className="banner-scroll whitespace-nowrap">
              <span className="inline-block text-xs sm:text-sm font-medium px-4 leading-none">
                🚚 شحن مجاني للطلبات فوق 500 ر.س • ⭐ خدمة عملاء 24/7 • 🎁 ضمان الجودة والاستبدال
              </span>
            </div>
          </div>

          {/* Close Button */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 group"
              aria-label="إغلاق الإعلان"
            >
              <X className="w-4 h-4 text-white group-hover:text-pink-200 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingBanner; 