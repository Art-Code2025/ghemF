import React, { useState, useEffect } from 'react';
import { X, Truck, Gift } from 'lucide-react';

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Popup Container */}
        <div 
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600"></div>
          
          {/* Content */}
          <div className="relative p-8 text-center text-white">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Truck className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4">
              🎉 عرض خاص
            </h2>

            {/* Description */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-xl rounded-xl p-3">
                <Truck className="w-5 h-5 text-white" />
                <span className="font-medium">شحن مجاني للطلبات فوق 500 ر.س</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-xl rounded-xl p-3">
                <Gift className="w-5 h-5 text-white" />
                <span className="font-medium">ضمان الجودة والاستبدال</span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-xl rounded-xl p-3">
                <span className="text-lg">⭐</span>
                <span className="font-medium">خدمة عملاء 24/7</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="w-full bg-white text-pink-600 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              ابدأ التسوق الآن
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingOfferPopup; 