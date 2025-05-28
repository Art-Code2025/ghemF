import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Phone, Clock, Shield, Award, ThumbsUp, Sparkles, Zap, Heart, Users, ChevronLeft, ChevronRight, Package, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { createProductSlug } from '../utils/slugify';

// Lazy load components that aren't immediately visible
const ContactFooter = lazy(() => import('../components/ContactFooter'));
const ImageSlider = lazy(() => import('../components/ImageSlider'));
 
// استيراد صور الهيرو
import b1 from '../assets/b2.png';
import b2 from '../assets/b1.png';
import b3 from '../assets/b3.png';
import b4 from '../assets/b4.png';

const heroImages = [b1, b2, b3, b4];

// تعريف نوع الخدمة
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
}

// تعريف نوع المنتج
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

// تعريف المميزات ولماذا تختارنا
interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface WhyChooseUsItem {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Sparkles className="text-pink-600 w-8 h-8" />,
    title: 'خدمة عالية الجودة',
    description: 'نقدم أعلى معايير الجودة العالمية في جميع خدماتنا بدون أي تنازل'
  },
  {
    icon: <Zap className="text-pink-600 w-8 h-8" />,
    title: 'سرعة في التنفيذ',
    description: 'نلتزم بالمواعيد المحددة ونقدم خدماتنا بسرعة وكفاءة عالية'
  },
  {
    icon: <Phone className="text-pink-600 w-8 h-8" />,
    title: 'دعم على مدار الساعة',
    description: 'فريق خدمة العملاء جاهز للرد على استفساراتكم في أي وقت طوال اليوم'
  },
  {
    icon: <Heart className="text-pink-600 w-8 h-8" />,
    title: 'حلول النظافة الراقية',
    description: 'خدمات نظافة متقدمة تجمع بين الجودة، الاحترافية، وأحدث التقنيات'
  },
  {
    icon: <Users className="text-pink-600 w-8 h-8" />,
    title: 'نهتم بالتفاصيل',
    description: 'تعكس التزامنا بالجودة والدقة في كل جانب من خدماتنا'
  },
  {
    icon: <Shield className="text-pink-600 w-8 h-8" />,
    title: 'مواد آمنة',
    description: 'نستخدم منتجات تنظيف عالية الجودة وآمنة مع فعالية قصوى'
  }
];

const whyChooseUs: WhyChooseUsItem[] = [
  {
    icon: <Award className="w-12 h-12 mb-4 text-white" />,
    title: 'فريق محترف',
    description: 'نخبة من المتخصصين ذوي الخبرة والكفاءة العالية'
  },
  {
    icon: <Shield className="w-12 h-12 mb-4 text-white" />,
    title: 'معدات متطورة',
    description: 'نستثمر في أحدث المعدات والتقنيات العالمية'
  },
  {
    icon: <ThumbsUp className="w-12 h-12 mb-4 text-white" />,
    title: 'أسعار تنافسية',
    description: 'أسعار مدروسة مع ضمان أعلى مستويات الجودة'
  }
];

interface SectionRefs {
  services: React.RefObject<HTMLDivElement>;
  features: React.RefObject<HTMLDivElement>;
  whyChooseUs: React.RefObject<HTMLDivElement>;
}

function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState({
    services: false,
    features: false,
    whyChooseUs: false
  });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [serverAvailable, setServerAvailable] = useState<boolean>(true);

  // جلب الخدمات والمنتجات من الخادم
  useEffect(() => {
    fetchServices();
    fetchProducts();
    // استرجاع طريقة العرض من localStorage
    const savedMode = localStorage.getItem('displayMode') as 'grid' | 'list' | 'carousel';
    if (savedMode) {
      setDisplayMode(savedMode);
    }
  }, []);

  const fetchServices = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.SERVICES);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.PRODUCTS);
      setProducts(data.slice(0, 8)); // أخذ أول 8 منتجات فقط
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // دالة لتتبع زيارات الخدمة
  const trackVisit = (serviceId: number) => {
    const visits = JSON.parse(localStorage.getItem('serviceVisits') || '{}');
    visits[serviceId] = (visits[serviceId] || 0) + 1;
    localStorage.setItem('serviceVisits', JSON.stringify(visits));
  };

  // مراجع الأقسام
  const sectionsRef: SectionRefs = {
    services: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    whyChooseUs: useRef<HTMLDivElement>(null)
  };

  const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (sectionsRef.services.current) {
      sectionsRef.services.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // تحميل الهيرو
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // مراقبة ظهور الأقسام
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const sectionId = entry.target.dataset.section;
            if (sectionId && (sectionId === 'services' || sectionId === 'features' || sectionId === 'whyChooseUs')) {
              setVisibleSections(prev => ({
                ...prev,
                [sectionId]: true
              }));
              sectionObserver.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    Object.entries(sectionsRef).forEach(([key, ref]) => {
      if (ref.current) {
        if (ref.current instanceof HTMLElement) {
          ref.current.dataset.section = key;
          sectionObserver.observe(ref.current);
        }
      }
    });

    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  const getImageSrc = (image: string) => {
    return buildImageUrl(image);
  };

  // إعدادات السلايدر للكروسيل
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // الأنميشنات
  const animationStyles = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    @keyframes subtleGlow {
      0% { box-shadow: 0 0 3px rgba(0, 0, 0, 0.1); }
      50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
      100% { box-shadow: 0 0 3px rgba(0, 0, 0, 0.1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s ease forwards;
    }
    .animate-slide-in {
      animation: slideIn 0.6s ease forwards;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .shimmer-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 2s infinite;
    }
    .pulse-effect {
      animation: pulse 3s infinite ease-in-out;
    }
    .glow-effect {
      animation: subtleGlow 2s infinite ease-in-out;
    }
    .list-item {
      transition: all 0.3s ease;
    }
    .list-item:hover {
      background: rgba(236, 72, 153, 0.15);
      transform: translateX(-5px);
    }
    .carousel-item {
      transition: transform 0.5s ease;
    }
    .carousel-item:hover {
      transform: scale(1.05);
    }
    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(236, 72, 153, 0.1);
    }
    .gradient-button::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #ec4899, #be185d);
      z-index: -1;
      border-radius: 10px;
      filter: blur(8px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .gradient-button:hover::before {
      opacity: 1;
    }
    .gradient-border {
      background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #ec4899, #be185d) border-box;
      border: 2px solid transparent;
    }
  `;

  return (
    <div className="ltr bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
      <style>{animationStyles}</style>
      <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      {/* التنقل */}
      <Navbar />

      {/* قسم الهيرو */}
      <div className="w-full h-[400px] md:h-[600px] relative overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-r from-pink-200 to-purple-200"></div>}>
          <ImageSlider images={heroImages} />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-pink-900/40 to-purple-900/30 flex flex-col items-center justify-center text-white px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className={`text-4xl md:text-6xl font-bold mb-6 text-center transition-all duration-700 pulse-effect ${
                heroLoaded ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
              }`}
            >
              <span className="bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">
                شركة مواسم الخدمات
              </span>
            </h1>
            <p 
              className={`text-lg md:text-2xl max-w-3xl mx-auto text-center mb-8 transition-all duration-700 delay-200 pulse-effect ${
                heroLoaded ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
              }`}
            >
              حلول راقية ومبتكرة لنظافة الفلل والقصور والفنادق والمولات بأعلى معايير الجودة العالمية
            </p>
            <div 
              className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-400 glow-effect ${
                heroLoaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
              }`}
            >
              <Link 
                to="/products" 
                className="relative gradient-button bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-4 px-10 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                استكشف منتجاتنا
                <ArrowLeft className="w-5 h-5 transform rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* تحذير لو الخادم مش متاح */}
      {!serverAvailable && (
        <div className="container mx-auto px-6 py-4">
          <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 text-yellow-800 rounded-2xl text-center shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              تحذير: الخادم غير متاح حاليًا. البيانات معروضة بناءً على التخزين المحلي.
            </div>
          </div>
        </div>
      )}

      {/* قسم المميزات */}
      <div className="bg-white py-20" ref={sectionsRef.features}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className={`text-4xl md:text-5xl font-bold mb-6 text-gray-800 transition-all duration-700 pulse-effect ${
                visibleSections.features ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
              }`}
            >
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                مميزاتنا الاستثنائية
              </span>
              <div className={`h-1 w-32 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full transition-all duration-700 delay-200 ${
                visibleSections.features ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}></div>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نسعى لتقديم تجربة استثنائية تجمع بين الجودة والاحترافية والابتكار
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 glass-effect border-2 border-transparent hover:border-pink-200 ${
                  visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                } animate-float`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-pink-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* قسم الخدمات */}
      <div id="services" ref={sectionsRef.services} className="container mx-auto px-6 py-24">
        <div className={`text-center mb-20 transition-all duration-700 ${
          visibleSections.services ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 inline-block relative pulse-effect">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              خدماتنا المتميزة
            </span>
            <div className={`h-1 w-32 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full transition-all duration-700 delay-200 shimmer-effect ${
              visibleSections.services ? 'w-32' : 'w-0'
            }`}></div>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
            مجموعة متكاملة من خدمات التنظيف والصيانة عالية الجودة باستخدام أحدث التقنيات العالمية
          </p>
        </div>

        {error && (
          <div className="text-center mb-6 p-6 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 text-red-700 rounded-2xl glass-effect animate-fade-in shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 pulse-effect">
            <div className="inline-block w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="mt-6 text-gray-600 text-lg">جاري تحميل خدماتنا المتميزة...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 glass-effect p-8 rounded-2xl shadow-lg animate-fade-in border-2 border-pink-200">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">لا توجد خدمات متاحة حاليًا</p>
          </div>
        ) : (
          <div className={displayMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : displayMode === 'list' ? 'space-y-6' : ''}>
            {displayMode === 'carousel' ? (
              <Slider {...sliderSettings}>
                {services.map((service, index) => (
                  <div key={service.id} className="px-3 carousel-item">
                    <Link
                      to={`/service/${service.id}`}
                      onClick={() => trackVisit(service.id)}
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 glass-effect border-2 border-transparent hover:border-pink-200 flex flex-col h-full animate-slide-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-56 overflow-hidden relative bg-gradient-to-br from-pink-50 to-purple-50">
                        {service.mainImage ? (
                          <img
                            src={getImageSrc(service.mainImage)}
                            alt={service.name}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            loading="lazy"
                            width="300"
                            height="200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Star className="w-12 h-12 text-pink-400 pulse-effect" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-pink-600/30 to-purple-600/30 transition-all duration-500 shimmer-effect"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                          <Heart className="w-4 h-4 text-pink-500" />
                        </div>
                      </div>
                      <div className="p-6 flex-grow">
                        <div className="relative inline-block mb-4">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
                            {service.name}
                          </h3>
                          <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 shimmer-effect"></div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{service.homeShortDescription}</p>
                      </div>
                      <div className="mt-auto">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 relative overflow-hidden">
                          <div className="py-4 px-6 flex items-center justify-between relative z-10">
                            <span className="font-semibold text-white text-base">استكشف الخدمة</span>
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-md flex items-center justify-center transform group-hover:-translate-x-2 transition-all duration-300">
                              <ArrowLeft className="w-4 h-4 text-white transform rotate-180 transition-transform duration-300 group-hover:rotate-90" />
                            </div>
                          </div>
                          <span className="absolute inset-0 bg-white/10 transform translate-x-full group-hover:-translate-x-0 transition-transform duration-500 shimmer-effect"></span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            ) : (
              services.map((service, index) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  onClick={() => trackVisit(service.id)}
                  className={`${
                    displayMode === 'list' ? 'list-item flex items-center glass-effect rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-pink-200' : 'group relative bg-white rounded-2xl shadow-lg overflow-hidden'
                  } transition-all duration-500 hover:shadow-2xl hover:scale-105 glass-effect border-2 border-transparent hover:border-pink-200 flex flex-col h-full animate-slide-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 shimmer-effect"></div>
                  <div className={`${displayMode === 'list' ? 'w-32 h-32 flex-shrink-0 ml-6 rounded-xl overflow-hidden' : 'h-56 overflow-hidden'} relative bg-gradient-to-br from-pink-50 to-purple-50`}>
                    {service.mainImage ? (
                      <img
                        src={getImageSrc(service.mainImage)}
                        alt={service.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                        width="300"
                        height="200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Star className="w-12 h-12 text-pink-400 pulse-effect" />
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-pink-600/30 to-purple-600/30 transition-all duration-500 shimmer-effect"></div>
                    {displayMode !== 'list' && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        <Heart className="w-4 h-4 text-pink-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="relative inline-block mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
                        {service.name}
                      </h3>
                      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 shimmer-effect"></div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{service.homeShortDescription}</p>
                  </div>
                  {displayMode !== 'list' && (
                    <div className="mt-auto">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 relative overflow-hidden">
                        <div className="py-4 px-6 flex items-center justify-between relative z-10">
                          <span className="font-semibold text-white text-base">استكشف الخدمة</span>
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-md flex items-center justify-center transform group-hover:-translate-x-2 transition-all duration-300">
                            <ArrowLeft className="w-4 h-4 text-white transform rotate-180 transition-transform duration-300 group-hover:rotate-90" />
                          </div>
                        </div>
                        <span className="absolute inset-0 bg-white/10 transform translate-x-full group-hover:-translate-x-0 transition-transform duration-500 shimmer-effect"></span>
                      </div>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* قسم المنتجات المميزة */}
      {products.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 inline-block relative pulse-effect">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  منتجاتنا المميزة
                </span>
                <div className="h-1 w-32 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full shimmer-effect"></div>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
                اكتشف مجموعتنا المختارة من أفضل المنتجات عالية الجودة
              </p>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="block sm:hidden">
              <style>
                {`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                  .mobile-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  }
                  .mobile-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  }
                `}
              </style>
              <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-72 snap-start"
                  >
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl h-full mobile-card group relative">
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                      
                      {/* Product Image - Natural Aspect Ratio */}
                      <div className="relative h-48 overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100">
                        <img
                          src={buildImageUrl(product.mainImage)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                        {/* Premium Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Price Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          {product.price.toFixed(0)} ر.س
                        </div>
                        {/* Product Type Badge */}
                        {product.productType && (
                          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            {product.productType}
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info - Centered Layout */}
                      <div className="p-5 flex flex-col items-center text-center space-y-3">
                        {/* Product Name - Centered */}
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight min-h-[3rem] hover:text-pink-600 transition-colors duration-300">
                          {product.name}
                        </h3>
                        
                        {/* Elegant Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent w-16"></div>
                        
                        {/* Price Section - Centered */}
                        <div className="flex flex-col items-center space-y-2">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 line-through font-medium">
                                  {product.originalPrice.toFixed(0)} ر.س
                                </span>
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                </span>
                              </div>
                              <div className="text-xl font-bold text-pink-600">
                                {product.price.toFixed(0)} <span className="text-base text-gray-600">ر.س</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xl font-bold text-pink-600">
                              {product.price.toFixed(0)} <span className="text-base text-gray-600">ر.س</span>
                            </div>
                          )}
                          
                          {/* Stock Indicator */}
                          <div className="text-sm">
                            {product.stock > 0 ? (
                              <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">متوفر</span>
                            ) : (
                              <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">نفذ</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Link
                          to={`/product/${createProductSlug(product.id, product.name)}`}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm font-bold text-center block hover:scale-105 hover:shadow-xl"
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll Indicators */}
              <div className="flex justify-center mt-2">
                <div className="flex gap-1">
                  {products.map((_, idx) => (
                    <div key={idx} className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300 hover:bg-pink-500"></div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Scroll Hint */}
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <span>👈</span>
                  <span>اسحب لرؤية المزيد</span>
                  <span>👉</span>
                </div>
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 glass-effect border-2 border-transparent hover:border-pink-200 flex flex-col h-full animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="h-56 overflow-hidden relative bg-gradient-to-br from-pink-50 to-purple-50">
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-pink-600/30 to-purple-600/30 transition-all duration-500 shimmer-effect"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <Heart className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      {product.price.toFixed(0)} ر.س
                    </div>
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="relative inline-block mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
                        {product.name}
                      </h3>
                      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 shimmer-effect"></div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{product.description}</p>
                  </div>
                  <div className="mt-auto">
                    <Link
                      to={`/product/${createProductSlug(product.id, product.name)}`}
                      className="block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="py-4 px-6 flex items-center justify-between relative z-10">
                        <span className="font-semibold text-white text-base">عرض المنتج</span>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-md flex items-center justify-center transform group-hover:-translate-x-2 transition-all duration-300">
                          <ArrowLeft className="w-4 h-4 text-white transform rotate-180 transition-transform duration-300 group-hover:rotate-90" />
                        </div>
                      </div>
                      <span className="absolute inset-0 bg-white/10 transform translate-x-full group-hover:-translate-x-0 transition-transform duration-500 shimmer-effect"></span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Package className="w-6 h-6" />
                <span>عرض جميع المنتجات</span>
                <ArrowLeft className="w-5 h-5 transform rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us section */}
      <div className="bg-gradient-to-br from-pink-600 to-purple-700 text-white py-24 relative overflow-hidden" ref={sectionsRef.whyChooseUs}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 w-96 h-96 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-white/20 translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute left-1/2 top-1/2 w-64 h-64 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center mb-20 transition-all duration-700 ${
            visibleSections.whyChooseUs ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                لماذا تختارنا؟
              </span>
            </h2>
            <div className={`h-1 w-24 bg-white mx-auto mb-8 rounded-full transition-all duration-700 delay-200 ${
              visibleSections.whyChooseUs ? 'w-24' : 'w-0'
            }`}></div>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              نسعى دائماً لتقديم أفضل خدمات التنظيف والصيانة بأعلى المعايير العالمية وبأسعار تنافسية مع ضمان رضا العملاء
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className={`group bg-white/10 backdrop-blur-sm p-8 rounded-2xl transition-all duration-500 hover:bg-white/20 flex flex-col items-center text-center transform hover:-translate-y-3 hover:shadow-xl border border-white/20 ${
                  visibleSections.whyChooseUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                } animate-float`}
                style={{ 
                  transitionDelay: `${Math.min(index * 150, 300)}ms`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-white/30 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <div className="relative z-10">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 mt-2 group-hover:text-pink-100 transition-colors duration-300">{item.title}</h3>
                <p className="transform group-hover:translate-y-1 transition-transform duration-300 leading-relaxed">{item.description}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-white group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الفوتر */}
      <Suspense fallback={<div className="bg-gray-900 h-64"></div>}>
        <ContactFooter />
      </Suspense>
    </div>
  );
}

export default Home;