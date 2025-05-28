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
      {/* الصور مع التركيز على إظهارها كاملة */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="w-full h-full flex items-center justify-center p-3">
            <img
              src={image}
              alt={`صورة ${index + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        </div>
      ))}

      {/* زر استكشف منتجاتنا في المنتصف */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <a
          href="/products"
          className={`pointer-events-auto group bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full shadow-xl transition-all duration-300 transform ${
            buttonLoaded ? 'scale-100 opacity-95' : 'scale-75 opacity-0'
          } hover:scale-105 hover:shadow-2xl hover:from-pink-600 hover:to-rose-600`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-bold text-lg">استكشف منتجاتنا</span>
            <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </div>

      {/* نقاط التنقل في الأسفل */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-15">
          <div className="flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* زر إعادة التعيين */}
      <div className="absolute top-4 left-4 z-15">
        <button
          onClick={resetSlider}
          className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/40 transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* أسهم التنقل الجانبية */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-15 bg-pink-500/80 text-white p-2 rounded-full hover:bg-pink-600 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-15 bg-pink-500/80 text-white p-2 rounded-full hover:bg-pink-600 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageSlider;