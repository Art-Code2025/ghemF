import React, { useState, useEffect } from 'react';
import { Truck, Star, Sparkles, Gift, Clock, X } from 'lucide-react';

const ShippingBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentText, setCurrentText] = useState(0);

  const texts = [
    "🚚 شحن مجاني للطلبات فوق 500 ريال",
    "⭐ خدمة عملاء 24/7",
    "🎁 ضمان الجودة والاستبدال"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [texts.length]);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white py-3 sm:py-4 overflow-hidden z-40" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-green-500/80 to-emerald-600/90" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>
      
      {/* Moving Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        <Sparkles className="absolute top-2 left-10 w-4 h-4 text-white/60 animate-bounce" />
        <Sparkles className="absolute top-4 right-20 w-3 h-3 text-white/40 animate-bounce delay-500" />
        <Star className="absolute top-1 left-1/3 w-3 h-3 text-white/50 animate-pulse" />
        <Star className="absolute top-5 right-1/3 w-4 h-4 text-white/60 animate-pulse delay-700" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                {currentText === 0 && <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                {currentText === 1 && <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                {currentText === 2 && <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative overflow-hidden">
                  <div 
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${currentText * 100}%)` }}
                  >
                    {texts.map((text, index) => (
                      <div 
                        key={index}
                        className="text-sm sm:text-base lg:text-lg font-bold text-white whitespace-nowrap"
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pulse Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              
              {currentText === 0 && (
                <div className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                  وفر في تكاليف الشحن واستمتع بالتوصيل المجاني
                </div>
              )}
            </div>

            {/* CTA Button - Desktop Only */}
            <div className="hidden lg:block flex-shrink-0">
              <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 text-sm font-semibold flex items-center gap-2 group">
                <span>تسوق الآن</span>
                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-2 sm:ml-4 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="إغلاق الإعلان"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Border Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
};

export default ShippingBanner; 