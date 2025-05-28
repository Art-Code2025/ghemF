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
      // Always use cover for professional look
      setImageDisplayMode('cover');
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
      className="image-slider-container relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] overflow-hidden bg-gradient-to-br from-gray-100 via-white to-gray-50"
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
            } object-contain`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          
          {/* Professional Overlay - Subtle and refined */}
          <div className={`absolute inset-0 transition-all duration-2000 ${
            index === activeIndex 
              ? 'bg-gradient-to-br from-black/5 via-transparent to-black/10'
              : 'bg-gradient-to-br from-black/15 via-gray-900/5 to-black/20'
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

      {/* Refined CTA Section - Better mobile positioning */}
      <div className="absolute inset-0 flex items-end justify-center z-20 px-4 pb-12 sm:pb-16 md:pb-20">
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-5">
          {/* Elegant Heading - Optimized mobile sizing */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-wide drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                مجموعة
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent font-black">
                استثنائية
              </span>
            </h1>
            <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent w-12 sm:w-16 lg:w-20 xl:w-24 mx-auto rounded-full" />
          </div>

          {/* Sophisticated CTA Button - Perfect mobile sizing */}
          <div className="relative">
            <a
              href="/products"
              className={`group relative inline-flex items-center gap-2 sm:gap-3 lg:gap-4 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 backdrop-blur-md text-white px-5 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 rounded-xl border-2 border-pink-400/60 hover:border-pink-300/80 transition-all duration-500 transform ${
                buttonLoaded ? 'translate-x-0 opacity-100' : '-translate-x-[150px] opacity-0'
              } hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/40 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold shadow-2xl overflow-hidden ease-[cubic-bezier(0.4,0,0.2,1)]`}
            >
              {/* Pink Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 ease-out" />
              
              {/* Floating Animation */}
              <div className="absolute inset-0 bg-pink-400/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out" />
              
              <span className="relative z-10 text-sm sm:text-base opacity-95">✨</span>
              <span className="relative z-10 tracking-wide font-semibold"> استكشف منتجاتنا </span>
              <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation - Now visible on mobile with better positioning */}
      <div className="absolute bottom-2 sm:bottom-4 lg:bottom-6 xl:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex">
        <div className="slider-controls flex items-center gap-1.5 sm:gap-2 lg:gap-3 bg-white/15 backdrop-blur-xl rounded-full px-2 sm:px-3 lg:px-4 xl:px-5 py-1 sm:py-1.5 lg:py-2 xl:py-2.5 border border-white/20">
          {/* Play/Pause Control */}
          <button
            onClick={togglePlayPause}
            className="p-1 sm:p-1.5 lg:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group"
          >
            {isPlaying ? (
              <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 text-white/80 group-hover:text-white transition-colors" />
            ) : (
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 text-white/80 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Elegant Navigation Dots - Mobile optimized */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`relative transition-all duration-500 ${
                  index === activeIndex ? 'w-3 sm:w-4 lg:w-6 h-1 sm:h-1.5 lg:h-2' : 'w-1 sm:w-1.5 lg:w-2 h-1 sm:h-1.5 lg:h-2'
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
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 text-white/80 group-hover:text-white group-hover:rotate-180 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Subtle Corner Accents - Mobile optimized */}
      <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 z-20">
        <div className="absolute top-0 left-0 w-1.5 sm:w-2 lg:w-3 h-px bg-white/40" />
        <div className="absolute top-0 left-0 w-px h-1.5 sm:h-2 lg:h-3 bg-white/40" />
      </div>
      <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 z-20">
        <div className="absolute top-0 right-0 w-1.5 sm:w-2 lg:w-3 h-px bg-white/40" />
        <div className="absolute top-0 right-0 w-px h-1.5 sm:h-2 lg:h-3 bg-white/40" />
      </div>
      <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 z-20">
        <div className="absolute bottom-0 left-0 w-1.5 sm:w-2 lg:w-3 h-px bg-white/40" />
        <div className="absolute bottom-0 left-0 w-px h-1.5 sm:h-2 lg:h-3 bg-white/40" />
      </div>
      <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-3 lg:right-4 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 z-20">
        <div className="absolute bottom-0 right-0 w-1.5 sm:w-2 lg:w-3 h-px bg-white/40" />
        <div className="absolute bottom-0 right-0 w-px h-1.5 sm:h-2 lg:h-3 bg-white/40" />
      </div>


    </div>
  );
}

export default ImageSlider;