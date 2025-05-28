import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw } from 'lucide-react';
// تأكد أن مسار ملف الـ CSS هذا صحيح، وأنه لا يحتوي على ستايلات تتعارض مع أسهم السلايدر
// import '../styles/mobile-slider.css'; 

interface ImageSliderProps {
  images: string[];
  currentIndex?: number;
}

function ImageSlider({ images, currentIndex = 0 }: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [buttonLoaded, setButtonLoaded] = useState(false);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setButtonLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const resetSlider = () => {
    setActiveIndex(0);
  };

  // خاصية اللمس للسحب على الموبايل
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
    if (distance < -minSwipeDistance) {
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // في حالة عدم وجود صور
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 flex items-center justify-center overflow-hidden rounded-2xl">
        <p className="text-gray-600 text-lg font-light">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    // الحاوية الرئيسية للسلايدر - بدون هوامش إضافية
    <div 
      className="image-slider-container relative w-full h-full overflow-hidden bg-white shadow-lg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* عرض الصور */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={image}
            alt={`صورة السلايدر ${index + 1}`}
            className="w-full h-full object-contain"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* زر "استكشف منتجاتنا" مصغر ومنزل قليلاً */}
      <div className="absolute inset-0 flex justify-center items-center pt-8 sm:pt-12 z-20 pointer-events-none">
        <Link
          to="/products"
          className={`pointer-events-auto group bg-gradient-to-r from-pink-500 to-rose-500 text-white 
                     px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-lg
                     transition-all duration-300 transform 
                     ${buttonLoaded ? 'scale-100 opacity-95' : 'scale-75 opacity-0'}
                     hover:scale-105 hover:shadow-xl hover:from-pink-600 hover:to-rose-600
                     focus:outline-none focus:ring-4 focus:ring-pink-300
                     text-xs sm:text-sm font-medium`}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs">✨</span>
            <span>استكشف منتجاتنا</span>
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </div>
        </Link>
      </div>
      
      {/* زر إعادة التعيين */}
      {images.length > 1 && (
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-30">
          <button
            onClick={resetSlider}
            aria-label="إعادة عرض الصور من البداية"
            className="bg-gray-800/70 backdrop-blur-sm text-white p-2 sm:p-2.5 rounded-full hover:bg-gray-800/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* أسهم التنقل الجانبية - لون موحد رمادي */}
      {images.length > 1 && (
        <>
          {/* السهم الأيمن */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="الصورة السابقة"
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 
                       bg-gray-800/70 text-white p-2 sm:p-2.5 rounded-full
                       hover:bg-gray-800/90 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </button>
          {/* السهم الأيسر */}
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
            aria-label="الصورة التالية"
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 
                       bg-gray-800/70 text-white p-2 sm:p-2.5 rounded-full
                       hover:bg-gray-800/90 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* مؤشرات الصور في الأسفل */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`الانتقال للصورة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageSlider;