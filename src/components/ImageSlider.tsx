import React, { useState, useEffect } from 'react';
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
    setTouchEnd(null); // امسح قيمة النهاية السابقة عند بداية لمسة جديدة
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return; // تأكد من وجود قيم للبداية والنهاية
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // أقل مسافة تعتبر سحبة صالحة

    if (distance > minSwipeDistance) { // سحب لليسار (لعرض الصورة التالية)
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
    if (distance < -minSwipeDistance) { // سحب لليمين (لعرض الصورة السابقة)
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // في حالة عدم وجود صور
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 flex items-center justify-center overflow-hidden rounded-2xl mt-3 mb-6"> {/* هامش علوي وسفلي */}
        <p className="text-gray-600 text-lg font-light">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    // الحاوية الرئيسية للسلايدر
    <div 
      className="image-slider-container relative w-full h-[300px] overflow-hidden bg-white rounded-2xl shadow-lg 
                 mt-3 mb-6" // هامش علوي (لتنزيل السلايدر) وهامش سفلي (لإعطاء مساحة تحته)
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* عرض الصور */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none' // pointer-events-none للصور غير النشطة
          }`}
        >
          <img
            src={image}
            alt={`صورة السلايدر ${index + 1}`}
            className="w-full h-full object-contain" // لعرض الصورة كاملة بأبعادها داخل الحاوية
            loading={index === 0 ? 'eager' : 'lazy'} // تحميل أول صورة فوراً والباقي عند الحاجة
          />
        </div>
      ))}

      {/* زر "استكشف منتجاتنا" (داخل السلايدر) */}
      <div className="absolute inset-0 flex justify-center items-end pb-8 z-20 pointer-events-none">
        <a
          href="/products" // يمكنك تغيير هذا الرابط
          className={`pointer-events-auto group bg-gradient-to-r from-pink-500 to-rose-500 text-white 
                     px-6 py-3 rounded-full shadow-lg
                     transition-all duration-300 transform 
                     ${buttonLoaded ? 'scale-100 opacity-90' : 'scale-75 opacity-0'}
                     hover:scale-105 hover:shadow-xl
                     focus:outline-none focus:ring-4 focus:ring-pink-300`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">✨</span>
            <span className="font-semibold text-base">استكشف منتجاتنا</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </div>
        </a>
      </div>
      
      {/* زر إعادة التعيين (الرجوع لأول صورة) */}
      {images.length > 1 && ( // يظهر فقط لو فيه أكثر من صورة
        <div className="absolute top-4 left-4 z-30"> {/* z-30 لضمان ظهوره فوق العناصر الأخرى */}
          <button
            onClick={resetSlider}
            aria-label="إعادة عرض الصور من البداية"
            className="bg-black/40 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* أسهم التنقل الجانبية (تأكد أنها ليست بينك وأنها متناسقة) */}
      {images.length > 1 && ( // تظهر فقط لو فيه أكثر من صورة
        <>
          {/* السهم الأيمن (للصورة السابقة في السياق العربي) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="الصورة السابقة"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 text-white p-2.5 rounded-full /* خلفية سوداء شفافة */
                       hover:bg-black/50 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" /> {/* أيقونة سهم يشير لليمين */}
          </button>
          {/* السهم الأيسر (للصورة التالية في السياق العربي) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
            aria-label="الصورة التالية"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 text-white p-2.5 rounded-full /* خلفية سوداء شفافة */
                       hover:bg-black/50 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-5 h-5" /> {/* أيقونة سهم يشير لليسار */}
          </button>
        </>
      )}
    </div>
  );
}

export default ImageSlider;