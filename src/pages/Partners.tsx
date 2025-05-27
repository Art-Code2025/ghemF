import React from 'react';

const Partners: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 sm:py-12 lg:py-16" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-3 sm:mb-4">
            شركاؤنا
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            نفتخر بشراكتنا مع أفضل المؤسسات والجامعات
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl">🏛️</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center">
                شريك رقم {item}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;