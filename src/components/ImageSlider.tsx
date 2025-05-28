import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import '../styles/mobile-slider.css'; // تأكد أن هذا المسار صحيح

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

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 flex items-center justify-center overflow-hidden rounded-2xl">
        <p className="text-gray-600 text-lg font-light">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    <div 
      className="image-slider-container relative w-full h-[300px] overflow-hidden bg-white rounded-2xl shadow-lg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
            className="w-full h-full object-contain" // كما طلبت، الصورة كاملة بدون قص
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* زر استكشف منتجاتنا بحجم وموضع جديد */}
      <div className="absolute inset-0 flex justify-center items-end pb-8 z-20 pointer-events-none">
        {/* items-end: لمحاذاة العنصر لأسفل الحاوية
          pb-8: لتركه مسافة 32px من الحافة السفلية (لتحريكه "تحت شوية" ولكن ليس في الأسفل تمامًا)
        */}
        <a
          href="/products"
          className={`pointer-events-auto group bg-gradient-to-r from-pink-500 to-rose-500 text-white 
                     px-6 py-3 rounded-full shadow-lg  /* Padding أقل، ظل أقل */
                     transition-all duration-300 transform 
                     ${buttonLoaded ? 'scale-100 opacity-90' : 'scale-75 opacity-0'} /* شفافية أقل بقليل */
                     hover:scale-105 hover:shadow-xl /* ظل أقل عند المرور */
                     focus:outline-none focus:ring-4 focus:ring-pink-300`}
        >
          <div className="flex items-center gap-1.5"> {/* تقليل المسافة بين الأيقونات والنص */}
            <span className="text-base">✨</span> {/* تصغير حجم الإيموجي */}
            <span className="font-semibold text-base">استكشف منتجاتنا</span> {/* تصغير حجم الخط وتقليل سمكه قليلاً */}
            <ChevronLeft className="w-1 h-1 group-hover:-translate-x-0.5 transition-transform duration-300" /> {/* تصغير الأيقونة وتقليل حركة التحريك */}
          </div>
        </a>
      </div>
      
      {/* زر إعادة التعيين */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={resetSlider}
            aria-label="إعادة عرض الصور من البداية"
            className="bg-black/40 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* أسهم التنقل الجانبية (بدون خلفية بينك) */}
      {images.length > 1 && (
        <>
          {/* السهم الأيمن (السابق) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="الصورة السابقة"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 text-white p-2.5 rounded-full /* خلفية سوداء شفافة */
                       hover:bg-black/50 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
          {/* السهم الأيسر (التالي) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
            aria-label="الصورة التالية"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 text-white p-2.5 rounded-full /* خلفية سوداء شفافة */
                       hover:bg-black/50 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageSlider;