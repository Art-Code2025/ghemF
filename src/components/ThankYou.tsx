import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Clock, Phone, MapPin, Mail, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { buildImageUrl } from '../config/api';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  mainImage: string;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  attachments?: {
    images?: string[];
    text?: string;
  };
  productType?: string;
  totalPrice?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  items: OrderItem[];
  totalAmount: number;
  couponDiscount: number;
  deliveryFee: number;
  finalAmount: number;
  paymentMethod: string;
  notes?: string;
  orderDate: string;
  status: string;
}

const ThankYou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاولة الحصول على البيانات من عدة مصادر
    const getOrderData = () => {
      // 1. من state الـ navigation
      if (location.state?.order) {
        console.log('✅ Order data found in navigation state');
        setOrder(location.state.order);
        setLoading(false);
        return;
      }

      // 2. من localStorage
      const savedOrder = localStorage.getItem('thankYouOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          console.log('✅ Order data found in localStorage');
          setOrder(parsedOrder);
          setLoading(false);
          return;
        } catch (error) {
          console.error('❌ Error parsing saved order:', error);
        }
      }

      // 3. إذا لم نجد البيانات، نوجه للصفحة الرئيسية
      console.log('❌ No order data found, redirecting to home');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    };

    getOrderData();
  }, [location.state, navigate]);

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      'size': 'المقاس',
      'color': 'اللون',
      'nameOnSash': 'الاسم على الوشاح',
      'embroideryColor': 'لون التطريز',
      'material': 'المادة',
      'style': 'النمط',
      'length': 'الطول',
      'width': 'العرض',
      'height': 'الارتفاع',
      'weight': 'الوزن',
      'quantity': 'الكمية',
      'notes': 'ملاحظات',
      'customText': 'نص مخصص',
      'design': 'التصميم',
      'pattern': 'النقشة',
      'finish': 'اللمسة النهائية'
    };
    
    return optionNames[optionName] || optionName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">جاري تحميل تفاصيل طلبك...</h2>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">😞</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على تفاصيل الطلب</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-emerald-600 transition-colors text-sm sm:text-base"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Success Header */}
      <div className="bg-white border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 text-center">
          <div className="mb-4 sm:mb-6">
            <CheckCircle className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 text-emerald-500 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">🎉 تم إنشاء طلبك بنجاح!</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">شكراً لك {order.customerName}, سنتواصل معك قريباً</p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl inline-block">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              <div>
                <p className="text-xs sm:text-sm opacity-90">رقم الطلب</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">#{order.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <ShoppingBag className="w-7 h-7 ml-3" />
                  تفاصيل طلبك
                </h2>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <img
                        src={buildImageUrl(item.mainImage)}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                        
                        {/* Price Display with Options */}
                        <div className="mb-3">
                          <p className="text-emerald-600 font-semibold">
                            {item.price.toFixed(2)} ر.س (أساسي) × {item.quantity}
                            {/* Options pricing */}
                            {item.optionsPricing && Object.values(item.optionsPricing).some(price => price > 0) && (
                              <span className="block text-sm text-gray-600">
                                + إضافات: {Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0)} ر.س
                              </span>
                            )}
                            {/* Total price */}
                            <span className="block text-lg font-bold text-emerald-700 mt-1">
                              الإجمالي: {item.totalPrice?.toFixed(2) || ((item.price + (item.optionsPricing ? Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0)) * item.quantity).toFixed(2)} ر.س
                            </span>
                          </p>
                        </div>
                        
                        {/* Selected Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                              <span className="text-blue-500">⚙️</span>
                              المواصفات المختارة:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(item.selectedOptions).map(([key, value]) => (
                                <div key={key} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                  <span className="text-xs text-blue-600 font-medium block">{formatOptionName(key)}:</span>
                                  <span className="font-bold text-blue-800 text-sm">{value}</span>
                                  {/* عرض السعر الإضافي إذا كان موجود */}
                                  {item.optionsPricing && item.optionsPricing[key] && item.optionsPricing[key] > 0 && (
                                    <span className="block text-xs text-green-600 mt-1">
                                      +{item.optionsPricing[key]} ر.س
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* عرض رسالة إذا لم تكن هناك مواصفات */}
                        {(!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) && (
                          <div className="mb-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <span className="text-gray-600 text-sm">📦 منتج عادي بدون مواصفات إضافية</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Attachments */}
                        {item.attachments && (item.attachments.text || (item.attachments.images && item.attachments.images.length > 0)) && (
                          <div className="mb-4">
                            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                              <span className="text-purple-500">📎</span>
                              المرفقات والملاحظات:
                            </h4>
                            {item.attachments.text && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                                <span className="text-xs text-purple-600 font-medium block mb-1">ملاحظات خاصة:</span>
                                <p className="text-purple-800 text-sm">{item.attachments.text}</p>
                              </div>
                            )}
                            {item.attachments.images && item.attachments.images.length > 0 && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <span className="text-xs text-purple-600 font-medium block mb-2">صور مرفقة ({item.attachments.images.length}):</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {item.attachments.images.slice(0, 3).map((img, idx) => (
                                    <div key={idx} className="w-full h-16 bg-purple-100 rounded border border-purple-200 flex items-center justify-center">
                                      <span className="text-purple-600 text-xs">📷 صورة {idx + 1}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 text-emerald-500 ml-3" />
                حالة الطلب
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-emerald-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-1/4"></div>
                </div>
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {order.status === 'pending' ? 'قيد المراجعة' : order.status}
                </span>
              </div>
              <p className="text-gray-600 mt-4">
                سيتم تأكيد طلبك خلال 24 ساعة وسنقوم بالتواصل معك لتأكيد التفاصيل
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <h3 className="text-lg font-bold text-white">ملخص الدفع</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-semibold">{order.totalAmount.toFixed(2)} ر.س</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>خصم الكوبون</span>
                    <span className="font-semibold">-{order.couponDiscount.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">رسوم التوصيل</span>
                  <span className="font-semibold">{order.deliveryFee.toFixed(2)} ر.س</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">المجموع النهائي</span>
                    <span className="font-bold text-emerald-600">{order.finalAmount.toFixed(2)} ر.س</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">طريقة الدفع</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات العميل</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-900">{order.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-900">{order.customerEmail}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="text-gray-900">{order.address}</p>
                    <p className="text-gray-600 text-sm">{order.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg flex items-center justify-center"
              >
                <Home className="w-5 h-5 ml-2" />
                العودة للتسوق
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full bg-white border-2 border-emerald-500 text-emerald-500 px-6 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-semibold flex items-center justify-center"
              >
                <Package className="w-5 h-5 ml-2" />
                طباعة الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 