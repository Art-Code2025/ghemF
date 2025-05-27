import React from 'react';

const Media: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 sm:py-12 lg:py-16" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-3 sm:mb-4">
            معرض الصور
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            استعرض مجموعة من أفضل أعمالنا وتصاميمنا المميزة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl lg:text-6xl">🎓</span>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  تصميم رقم {item}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  وصف قصير للتصميم والعمل المعروض
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Media;