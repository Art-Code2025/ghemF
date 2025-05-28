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
    // تأخير بسيط لظهور الزر بتأثير
    const timer = setTimeout(() => setButtonLoaded(true), 200);
    return () => clearTimeout(timer); // تنظيف التايمر عند إلغاء تحميل المكون
  }, []);

  // لم نعد بحاجة لهذه الدالة بعد إزالة النقاط
  // const handleDotClick = (index: number) => {
  //   setActiveIndex(index);
  // };

  const resetSlider = () => {
    setActiveIndex(0);
  };

  // Touch/swipe functionality for mobile
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
    const minSwipeDistance = 50; // أقل مسافة تعتبر سحب

    if (distance > minSwipeDistance) { // سحب لليسار
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
    if (distance < -minSwipeDistance) { // سحب لليمين
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
      {/* الصور مع التركيز على إظهارها كاملة وبدون فراغات */}
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
            // w-full و h-full لجعل الصورة تملأ الـ div الأب
            // object-cover لجعل الصورة تغطي المساحة مع الحفاظ على الأبعاد (قد يقص أجزاء)
            className="w-full h-full object-cover" 
            loading={index === 0 ? 'eager' : 'lazy'} // تحميل أول صورة بشكل فوري والباقي عند الحاجة
          />
        </div>
      ))}

      {/* زر استكشف منتجاتنا في المنتصف */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <a
          href="/products" // يمكنك تغيير الرابط حسب الحاجة
          className={`pointer-events-auto group bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full shadow-xl transition-all duration-300 transform ${
            buttonLoaded ? 'scale-100 opacity-95' : 'scale-75 opacity-0'
          } hover:scale-105 hover:shadow-2xl hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-4 focus:ring-pink-300`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-bold text-lg">استكشف منتجاتنا</span>
            {/* الأيقونة مناسبة للسياق العربي (السهم يشير إلى اليسار عادةً للانتقال) */}
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
        </a>
      </div>

      {/* تم إزالة نقاط التنقل من هنا */}

      {/* زر إعادة التعيين (الرجوع لأول صورة) */}
      {images.length > 1 && ( // إظهار الزر فقط لو فيه أكتر من صورة
        <div className="absolute top-4 left-4 z-30"> {/* زيادة z-index ليكون فوق كل شيء */}
          <button
            onClick={resetSlider}
            aria-label="إعادة عرض الصور من البداية"
            className="bg-black/40 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
      

      {/* أسهم التنقل الجانبية */}
      {images.length > 1 && ( // إظهار الأسهم فقط لو فيه أكتر من صورة
        <>
          {/* السهم الأيمن (السابق) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="الصورة السابقة"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-30 bg-black/40 text-white p-2.5 rounded-full hover:bg-black/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {/* ChevronLeft مع rotate-180 ليصبح سهم يشير لليمين */}
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
          {/* السهم الأيسر (التالي) */}
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
            aria-label="الصورة التالية"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-30 bg-black/40 text-white p-2.5 rounded-full hover:bg-black/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageSlider;