import React, { useState, useEffect } from 'react';
import { X, Truck, Gift, Crown, Sparkles } from 'lucide-react';

const ShippingOfferPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds on each page load/refresh
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Popup Container - Smaller and more elegant */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-500 scale-100 animate-pulse-subtle"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Close Button - More elegant */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Premium Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600"></div>
          
          {/* Overlay pattern for luxury effect */}
          <div className="absolute inset-0 opacity-10" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
                 backgroundSize: '24px 24px'
               }}>
          </div>
          
          {/* Content - Compact and professional */}
          <div className="relative p-6 text-center text-white">
            {/* Premium Icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                <Crown className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
            </div>

            {/* Title - More sophisticated */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <h2 className="text-xl font-bold">عرض حصري</h2>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>

            {/* Description - Compact cards */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
                <Truck className="w-4 h-4 text-white" />
                <span className="text-sm font-medium">شحن مجاني على كل الطلبات</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
                <Gift className="w-4 h-4 text-white" />
                <span className="text-sm font-medium">ضمان الجودة</span>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
                <span className="text-sm">✨</span>
                <span className="text-sm font-medium">خدمة عملاء 24/7</span>
              </div>
            </div>

            {/* CTA Button - More professional */}
            <button
              onClick={handleClose}
              className="w-full bg-white text-purple-700 font-bold py-3 px-5 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
            >
              <div className="flex items-center justify-center gap-2">
                <span>ابدأ التسوق</span>
                <Crown className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ShippingOfferPopup; 