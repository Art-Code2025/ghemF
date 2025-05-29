import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center animate-float">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              تواصل معنا
            </h1>
          </div>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            نحن هنا لخدمتكم. تواصلوا معنا لأي استفسارات أو طلبات خاصة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-pink-800 mb-4 sm:mb-6">معلومات التواصل</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">رقم الهاتف</h3>
                    <p className="text-gray-600 text-sm sm:text-base">+966551064118</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">البريد الإلكتروني</h3>
                    <p className="text-gray-600 text-sm sm:text-base break-all">support@ghem.store</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">الموقع</h3>
                    <p className="text-gray-600 text-sm sm:text-base">المملكة العربية السعودية</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">ساعات العمل</h3>
                    <p className="text-gray-600 text-sm sm:text-base">السبت - الخميس: 9 صباحاً - 6 مساءً</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Notice */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-pink-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-pink-800">ملاحظة هامة</h3>
              </div>
              <p className="text-pink-700 font-medium text-center text-sm sm:text-base">
                مدة التنفيذ للطلبات: 45-50 يوماً
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2 text-center">
                يرجى التخطيط مسبقاً لضمان وصول طلبكم في الوقت المناسب
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-pink-800 mb-4 sm:mb-6">أرسل لنا رسالة</h2>
            
            <form className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-sm sm:text-base"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-sm sm:text-base"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-sm sm:text-base"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-sm sm:text-base"
                  placeholder="موضوع الرسالة"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  الرسالة
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-sm sm:text-base resize-none sm:rows-5"
                  placeholder="اكتب رسالتك هنا..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-bold text-base sm:text-lg shadow-lg"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>

        {/* Social Media & Additional Info */}
        <div className="mt-12 sm:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-pink-800 mb-4 sm:mb-6">تابعونا على وسائل التواصل</h3>
          
          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white text-lg sm:text-xl">📱</span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white text-lg sm:text-xl">📧</span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white text-lg sm:text-xl">📞</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-base sm:text-lg">
            <span className="font-bold text-pink-800">ZAHRI.STORE</span> - براند سعودي لعبايات التخرج
          </p>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">نشارككم الفرحة</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
