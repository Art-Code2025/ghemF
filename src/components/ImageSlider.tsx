import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import '../styles/mobile-slider.css';

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
    setTimeout(() => setButtonLoaded(true), 200);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
    if (isRightSwipe) {
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 flex items-center justify-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-200/30 via-transparent to-transparent" />
        <p className="text-gray-600 text-lg sm:text-xl lg:text-2xl font-light tracking-wide px-4 text-center">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    <div 
      className="image-slider-container relative w-full h-[350px] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images with Proper Aspect Ratio */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-out flex items-center justify-center p-4 ${
            index === activeIndex 
              ? 'opacity-100 scale-100 z-10' 
              : index === (activeIndex - 1 + images.length) % images.length
              ? 'opacity-20 scale-105 z-5'
              : 'opacity-0 scale-98 z-0'
          }`}
        >
          <img
            src={image}
            alt={`مجموعة مميزة ${index + 1}`}
            className={`max-w-full max-h-full object-contain transition-all duration-1000 ease-out rounded-xl shadow-lg ${
              index === activeIndex ? 'scale-100 filter brightness-105 saturate-110' : 'scale-95'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          
          {/* تدرج خفيف للحماية */}
          <div className={`absolute inset-0 rounded-xl transition-all duration-1000 pointer-events-none ${
            index === activeIndex 
              ? 'bg-gradient-to-t from-black/10 via-transparent to-transparent'
              : 'bg-gradient-to-t from-black/20 via-transparent to-black/5'
          }`} />
        </div>
      ))}

      {/* زر الدعوة للعمل - في المنتصف */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <a
          href="/products"
          className={`group relative inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 backdrop-blur-md text-white px-6 py-3 rounded-full border border-pink-400/60 hover:border-pink-300/80 transition-all duration-300 transform ${
            buttonLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          } hover:scale-105 hover:shadow-xl hover:shadow-pink-500/40 text-sm font-medium shadow-xl overflow-hidden`}
        >
          {/* تأثير اللمعان */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          
          <span className="relative z-10 text-sm">✨</span>
          <span className="relative z-10 tracking-wide font-semibold">استكشف منتجاتنا</span>
          <ChevronLeft className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>

      {/* نقاط التنقل */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3 bg-black/20 backdrop-blur-md rounded-full px-3 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* عناصر الزينة في الزوايا */}
      <div className="absolute top-4 left-4 w-8 h-8 z-20">
        <div className="absolute top-0 left-0 w-3 h-px bg-white/50" />
        <div className="absolute top-0 left-0 w-px h-3 bg-white/50" />
      </div>
      <div className="absolute top-4 right-4 w-8 h-8 z-20">
        <div className="absolute top-0 right-0 w-3 h-px bg-white/50" />
        <div className="absolute top-0 right-0 w-px h-3 bg-white/50" />
      </div>
      
      {/* زر إعادة التعيين */}
      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={resetSlider}
          className="bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/30 transition-all duration-300 shadow-md"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* عناصر ديكورية متحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 bg-gradient-to-r from-white/20 to-pink-200/30 rounded-full animate-pulse blur-sm`}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + ((i % 4) * 20)}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '5s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;