import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import '../styles/mobile-slider.css';

interface ImageSliderProps {
  images: string[];
  currentIndex?: number;
}

function ImageSlider({ images, currentIndex = 0 }: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buttonLoaded, setButtonLoaded] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(16/9);

  // حساب نسبة العرض للارتفاع للصورة الحالية
  useEffect(() => {
    if (images[activeIndex]) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(ratio);
      };
      img.src = images[activeIndex];
    }
  }, [activeIndex, images]);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    // شيل الحركة التلقائية للصور
    // let interval: number;
    // if (isPlaying && images.length > 1) {
    //   interval = setInterval(() => {
    //     setProgress((prev) => {
    //       if (prev >= 100) {
    //         setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    //         return 0;
    //       }
    //       return prev + 1.5;
    //     });
    //   }, 120);
    // }
    // return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  useEffect(() => {
    setTimeout(() => setButtonLoaded(true), 200);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSlider = () => {
    setActiveIndex(0);
    setProgress(0);
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
      setProgress(0);
    }
    if (isRightSwipe) {
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setProgress(0);
    }
  };

  // تحديد ارتفاع الحاوية بناءً على نسبة الصورة
  const getContainerHeight = () => {
    const baseWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
    const padding = 32; // للحواف
    const availableWidth = baseWidth - padding;
    
    if (imageAspectRatio > 1.5) {
      // صور عريضة
      return Math.min(availableWidth / imageAspectRatio + 100, 500);
    } else if (imageAspectRatio < 0.8) {
      // صور طويلة
      return Math.min(600, availableWidth * 1.2);
    } else {
      // صور مربعة أو قريبة من المربع
      return Math.min(availableWidth + 50, 550);
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
      className="image-slider-container relative w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-2xl"
      style={{ 
        height: `${getContainerHeight()}px`,
        minHeight: '300px',
        maxHeight: '600px'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images with Smart Display - محتوى الصور */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[2000ms] ease-out flex items-center justify-center p-4 ${
            index === activeIndex 
              ? 'opacity-100 scale-100 z-10' 
              : index === (activeIndex - 1 + images.length) % images.length
              ? 'opacity-20 scale-105 z-5'
              : 'opacity-0 scale-98 z-0'
          }`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={image}
              alt={`مجموعة مميزة ${index + 1}`}
              className={`max-w-full max-h-full object-contain transition-all duration-[4000ms] ease-out rounded-xl shadow-2xl ${
                index === activeIndex ? 'scale-100 filter brightness-105 saturate-110' : 'scale-95'
              }`}
              style={{
                objectFit: 'contain',
                objectPosition: 'center center',
              }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* إطار أنيق حول الصورة */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-2000 pointer-events-none ${
              index === activeIndex 
                ? 'bg-gradient-to-br from-white/5 via-transparent to-black/5 shadow-2xl'
                : 'bg-gradient-to-br from-black/10 via-transparent to-black/20'
            }`} />
          </div>
          
          {/* عناصر ديكورية متحركة */}
          {index === activeIndex && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-gradient-to-r from-pink-300/40 to-purple-300/40 rounded-full animate-pulse blur-sm`}
                  style={{
                    left: `${15 + (i * 15)}%`,
                    top: `${20 + ((i % 3) * 25)}%`,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: '4s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* زر الدعوة للعمل - مبسط وصغير */}
      <div className="absolute bottom-6 right-6 z-20">
        <a
          href="/products"
          className={`group relative inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-pink-400/60 hover:border-pink-300/80 transition-all duration-300 transform ${
            buttonLoaded ? 'translate-x-0 opacity-100' : 'translate-x-[100px] opacity-0'
          } hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30 text-xs font-medium shadow-lg overflow-hidden`}
        >
          {/* تأثير اللمعان */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          
          <span className="relative z-10 text-xs">✨</span>
          <span className="relative z-10 tracking-wide">استكشف منتجاتنا</span>
          <ChevronLeft className="w-3 h-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>

      {/* نقاط التنقل */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-2">
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
      <div className="absolute top-3 left-3 w-6 h-6 z-20">
        <div className="absolute top-0 left-0 w-2 h-px bg-white/40" />
        <div className="absolute top-0 left-0 w-px h-2 bg-white/40" />
      </div>
      <div className="absolute top-3 right-3 w-6 h-6 z-20">
        <div className="absolute top-0 right-0 w-2 h-px bg-white/40" />
        <div className="absolute top-0 right-0 w-px h-2 bg-white/40" />
      </div>
      
      {/* أزرار التحكم - مبسطة */}
      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <button
          onClick={resetSlider}
          className="bg-black/20 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-black/30 transition-all duration-300"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default ImageSlider;