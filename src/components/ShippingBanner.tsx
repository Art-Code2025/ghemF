import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ShippingBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes scroll-text {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll-text {
            animation: scroll-text 20s linear infinite;
          }
        `}
      </style>
      <div className="relative bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white py-2 overflow-hidden z-40" dir="rtl">
        <div className="relative container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Scrolling Text */}
            <div className="flex-1 overflow-hidden">
              <div className="animate-scroll-text whitespace-nowrap text-sm sm:text-base font-medium">
                🚚 شحن مجاني للطلبات فوق 500 ريال • ⭐ خدمة عملاء متميزة • 🎁 ضمان الجودة والاستبدال • 🚚 شحن مجاني للطلبات فوق 500 ريال • ⭐ خدمة عملاء متميزة • 🎁 ضمان الجودة والاستبدال
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 ml-3 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="إغلاق الإعلان"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingBanner; 