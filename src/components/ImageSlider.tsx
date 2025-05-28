import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import '../styles/mobile-slider.css';

interface ImageSliderProps {
  images: string[];
  currentIndex?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, currentIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buttonLoaded, setButtonLoaded] = useState(false);

  // Sync currentIndex prop
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  // Auto-play
  useEffect(() => {
    let interval: number;
    if (isPlaying && images.length > 1) {
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setActiveIndex(i => (i + 1) % images.length);
            return 0;
          }
          return prev + 1.5;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  // Load animation trigger
  useEffect(() => {
    setTimeout(() => setButtonLoaded(true), 200);
  }, []);

  // Swipe handlers
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
    if (touchStart === null || touchEnd === null) return;
    const dist = touchStart - touchEnd;
    if (dist > 50)      { setActiveIndex(i => (i + 1) % images.length); setProgress(0); }
    else if (dist < -50){ setActiveIndex(i => (i - 1 + images.length) % images.length); setProgress(0); }
  };

  if (!images || images.length === 0) {
    return (
      <div className="image-slider-container no-images">
        <p className="no-images-text">لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    <div
      className="image-slider-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((src, idx) => {
        const isActive   = idx === activeIndex;
        const isPrevious = idx === (activeIndex - 1 + images.length) % images.length;
        return (
          <div
            key={idx}
            className={`slide 
              ${isActive   ? 'active'   : ''} 
              ${isPrevious? 'previous' : ''}
            `}
          >
            <img
              src={src}
              alt={`مجموعة مميزة ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className={`slider-image ${isActive ? 'highlight' : ''}`}
            />
            <div className="overlay" />
            {isActive && (
              <div className="floating-elements">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="float-dot"
                    style={{
                      left: `${25 + i * 20}%`,
                      top:  `${20 + (i % 2) * 50}%`,
                      animationDelay: `${i * 1.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* CTA */}
      <div className="cta">
        <div className="cta-content">
          <div className="cta-heading">
            <h1>
              <span className="text-gradient-white">مجموعة</span>
              <br />
              <span className="text-gradient-gold">استثنائية</span>
            </h1>
            <div className="cta-underline" />
          </div>
          <a
            href="/products"
            className={`cta-button ${buttonLoaded ? 'loaded' : ''}`}
          >
            <div className="shimmer" />
            <div className="glow-circle" />
            <span className="emoji">✨</span>
            <span className="cta-text">استكشف منتجاتنا</span>
            <ChevronLeft className="cta-icon" />
          </a>
        </div>
      </div>

      {/* Corner accents */}
      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />
    </div>
  );
};

export default ImageSlider;
