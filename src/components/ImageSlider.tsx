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
  const [imageDisplayMode, setImageDisplayMode] = useState<'cover' | 'contain'>('contain'); // Default to contain for mobile-first

  // Auto-detect screen size and set appropriate display mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setImageDisplayMode(isMobile ? 'contain' : 'cover');
    };

    // Set initial mode
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
            return 0;
          }
          return prev + 1.5;
        });
      }, 120);
    }
    return () => clearInterval(interval);
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

  const toggleImageDisplayMode = () => {
    setImageDisplayMode(prev => prev === 'cover' ? 'contain' : 'cover');
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
      // Swipe left - next image
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
      setProgress(0);
    }
    if (isRightSwipe) {
      // Swipe right - previous image
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setProgress(0);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-200/30 via-transparent to-transparent" />
        <p className="text-gray-600 text-lg sm:text-xl lg:text-2xl font-light tracking-wide px-4 text-center">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    <div 
      className="image-slider-container relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[750px] overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 -mt-16 sm:-mt-20 md:-mt-0 shadow-lg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images with Smooth Transitions */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-[2000ms] ease-out ${
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
            className={`slider-image w-full h-full transition-all duration-[4000ms] ease-out ${
              index === activeIndex ? 'scale-102 filter brightness-105 saturate-110' : 'scale-100'
            } ${
              // Smart responsive object-fit: contain on mobile, cover on larger screens
              imageDisplayMode === 'contain' 
                ? 'object-contain' 
                : 'object-cover'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          
          {/* Elegant Overlay - Reduced on mobile for better image visibility */}
          <div className={`absolute inset-0 transition-all duration-2000 ${
            index === activeIndex 
              ? imageDisplayMode === 'contain' 
                ? 'bg-gradient-to-br from-black/10 via-gray-900/5 to-black/15' // Lighter overlay for contain mode
                : 'bg-gradient-to-br from-black/20 via-gray-900/10 to-black/30'
              : imageDisplayMode === 'contain'
              ? 'bg-gradient-to-br from-black/20 via-gray-900/15 to-black/25'
              : 'bg-gradient-to-br from-black/40 via-gray-900/30 to-black/50'
          }`} />
          
          {/* Subtle Floating Elements */}
          {index === activeIndex && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 bg-white/20 rounded-full animate-pulse`}
                  style={{
                    left: `${25 + i * 20}%`,
                    top: `${20 + (i % 2) * 50}%`,
                    animationDelay: `${i * 1.2}s`,
                    animationDuration: '3s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Refined CTA Section - Responsive sizing */}
      <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
        <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Elegant Heading - Better mobile sizing */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-wide drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                مجموعة
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent font-black">
                استثنائية
              </span>
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent w-16 sm:w-20 lg:w-24 xl:w-28 mx-auto rounded-full shadow-lg" />
          </div>

          {/* Sophisticated CTA Button - Better mobile sizing */}
          <div className="relative">
            <a
              href="/products"
              className={`group relative inline-flex items-center gap-3 sm:gap-4 lg:gap-5 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 backdrop-blur-md text-white px-6 sm:px-8 lg:px-10 xl:px-12 py-3 sm:py-4 lg:py-5 xl:py-6 rounded-2xl border-2 border-pink-400/60 hover:border-pink-300/80 transition-all duration-500 transform ${
                buttonLoaded ? 'translate-x-0 opacity-100' : '-translate-x-[150px] opacity-0'
              } hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/40 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold shadow-2xl overflow-hidden ease-[cubic-bezier(0.4,0,0.2,1)]`}
            >
              {/* Pink Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 ease-out" />
              
              {/* Floating Animation */}
              <div className="absolute inset-0 bg-pink-400/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out" />
              
              <span className="relative z-10 text-lg sm:text-xl opacity-95">✨</span>
              <span className="relative z-10 tracking-wide font-semibold"> استكشف منتجاتنا </span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation with Image Display Toggle - Hidden on mobile */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 xl:bottom-12 left-1/2 transform -translate-x-1/2 z-30 hidden md:flex">
        <div className="slider-controls flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/15 backdrop-blur-xl rounded-full px-3 sm:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 lg:py-2.5 xl:py-3 border border-white/20 shadow-lg">
          {/* Image Display Mode Toggle */}
          <button
            onClick={toggleImageDisplayMode}
            className="p-1 sm:p-1.5 lg:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group"
            title={imageDisplayMode === 'contain' ? 'تبديل إلى عرض مقصوص' : 'تبديل إلى عرض كامل'}
          >
            {imageDisplayMode === 'contain' ? (
              <Maximize2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white/80 group-hover:text-white transition-colors" />
            ) : (
              <Minimize2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white/80 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Play/Pause Control */}
          <button
            onClick={togglePlayPause}
            className="p-1 sm:p-1.5 lg:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group"
          >
            {isPlaying ? (
              <Pause className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white/80 group-hover:text-white transition-colors" />
            ) : (
              <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white/80 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Elegant Navigation Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`relative transition-all duration-500 ${
                  index === activeIndex ? 'w-4 sm:w-6 lg:w-8 h-1 sm:h-1.5 lg:h-2' : 'w-1 sm:w-1.5 lg:w-2 h-1 sm:h-1.5 lg:h-2'
                }`}
              >
                {/* Base Dot */}
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'bg-gradient-to-r from-amber-300/80 to-yellow-200/80'
                    : 'bg-white/30 hover:bg-white/50'
                }`} />
                
                {/* Progress Indicator */}
                {index === activeIndex && (
                  <div 
                    className="absolute inset-0 bg-white/60 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSlider}
            className="p-1 sm:p-1.5 lg:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group"
          >
            <RotateCcw className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white/80 group-hover:text-white group-hover:rotate-180 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Display Mode Indicator - Hidden on mobile */}
      <div className="absolute top-4 left-4 z-30 hidden md:block">
        <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-white/20">
          <span className="text-white/80 text-xs sm:text-sm font-light">
            {imageDisplayMode === 'contain' ? '📱 عرض كامل' : '🖥️ عرض مقصوص'}
          </span>
        </div>
      </div>

      {/* Subtle Corner Accents */}
      <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 z-20">
        <div className="absolute top-0 left-0 w-2 sm:w-3 lg:w-4 h-px bg-white/40" />
        <div className="absolute top-0 left-0 w-px h-2 sm:h-3 lg:h-4 bg-white/40" />
      </div>
      <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 z-20">
        <div className="absolute top-0 right-0 w-2 sm:w-3 lg:w-4 h-px bg-white/40" />
        <div className="absolute top-0 right-0 w-px h-2 sm:h-3 lg:h-4 bg-white/40" />
      </div>
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 z-20">
        <div className="absolute bottom-0 left-0 w-2 sm:w-3 lg:w-4 h-px bg-white/40" />
        <div className="absolute bottom-0 left-0 w-px h-2 sm:h-3 lg:h-4 bg-white/40" />
      </div>
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 right-3 sm:right-4 lg:right-6 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 z-20">
        <div className="absolute bottom-0 right-0 w-2 sm:w-3 lg:w-4 h-px bg-white/40" />
        <div className="absolute bottom-0 right-0 w-px h-2 sm:h-3 lg:h-4 bg-white/40" />
      </div>

      {/* Gentle Ambient Lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/5 via-transparent to-yellow-100/5 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-white/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-100/3 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default ImageSlider;