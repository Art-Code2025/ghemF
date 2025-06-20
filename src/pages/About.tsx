import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Star } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center animate-float">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              من نحن
            </h1>
          </div>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            تعرف على قصة GHEM-STORE وكيف نساعدك في إطلالة التخرج المثالية
          </p>
        </div>

        {/* Brand Story */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12 border border-gray-100">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-pink-800 mb-3 sm:mb-4">GHEM.STORE</h2>
            <p className="text-lg sm:text-xl text-pink-600 font-medium">براند سعودي لعبايات التخرج</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">قصتنا</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                نحن متخصصون في تصميم وتفصيل عبايات وجاكيتات التخرج المميزة. نؤمن بأن لحظة التخرج هي من أهم اللحظات في حياة كل طالب وطالبة، ولذلك نحرص على تقديم أفضل التصاميم والخامات.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                منذ بداية رحلتنا، كان هدفنا واضحاً: جعل كل خريج وخريجة يشعران بالثقة والأناقة في يوم تخرجهما. نشارككم الفرحة ونحتفل معكم بهذا الإنجاز المهم.
              </p>
              <div className="bg-pink-50 p-3 sm:p-4 rounded-lg border border-pink-200">
                <p className="text-pink-700 font-medium text-center text-sm sm:text-base">
                  &lt;مدة التنفيذ 5-10 يوماً&gt;
                </p>
              </div>
            </div>
            
            <div className="text-center order-first md:order-last">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-pink-200 to-rose-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-pink-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white text-xl sm:text-2xl">🎓</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-pink-800 mb-2 sm:mb-3">تصاميم مميزة</h3>
            <p className="text-sm sm:text-base text-gray-600">
              نقدم تصاميم حصرية وأنيقة تناسب جميع الأذواق والمناسبات
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white text-xl sm:text-2xl">✨</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-pink-800 mb-2 sm:mb-3">جودة عالية</h3>
            <p className="text-sm sm:text-base text-gray-600">
              نستخدم أفضل الخامات والأقمشة الفاخرة مع خياطة متقنة ومتينة
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white text-xl sm:text-2xl">🚚</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-pink-800 mb-2 sm:mb-3">توصيل سريع</h3>
            <p className="text-sm sm:text-base text-gray-600">
              نوصل لجميع مناطق المملكة العربية السعودية بسرعة وأمان
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-pink-800 mb-4 sm:mb-6">قيمنا</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">الجودة</h4>
            </div>
            <div>
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">الاهتمام</h4>
            </div>
            <div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">الإتقان</h4>
            </div>
            <div>
              <span className="text-pink-600 text-xl sm:text-2xl block mb-2">🎯</span>
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">التميز</h4>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            to="/products"
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-bold text-base sm:text-lg shadow-lg inline-block"
          >
            استعرض منتجاتنا
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;