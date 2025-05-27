import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Clock, Phone, MapPin, Mail, ArrowRight, Home, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  mainImage: string;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
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
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاولة الحصول على بيانات الطلب من مصادر متعددة
    let orderData = null;
    
    // المصدر الأول: location.state
    if (location.state?.order) {
      console.log('📋 Order data found in location.state:', location.state.order);
      orderData = location.state.order;
    }
    
    // المصدر الثاني: localStorage (thankYouOrder)
    if (!orderData) {
      const savedOrder = localStorage.getItem('thankYouOrder');
      if (savedOrder) {
        try {
          orderData = JSON.parse(savedOrder);
          console.log('📋 Order data found in localStorage (thankYouOrder):', orderData);
          localStorage.removeItem('thankYouOrder'); // تنظيف
        } catch (error) {
          console.error('❌ Failed to parse thankYouOrder from localStorage:', error);
        }
      }
    }
    
    // المصدر الثالث: localStorage (orderData - للتوافق مع الكود القديم)
    if (!orderData) {
      const legacyOrderData = localStorage.getItem('orderData');
      if (legacyOrderData) {
        try {
          orderData = JSON.parse(legacyOrderData);
          console.log('📋 Order data found in localStorage (legacy orderData):', orderData);
          localStorage.removeItem('orderData'); // تنظيف
        } catch (error) {
          console.error('❌ Failed to parse legacy orderData from localStorage:', error);
        }
      }
    }
    
    if (orderData) {
      setOrder(orderData);
      setLoading(false);
      console.log('✅ Order data loaded successfully');
    } else {
      console.log('❌ No order data found from any source');
      setLoading(false);
      // إعطاء وقت إضافي قبل التوجيه للرئيسية
      setTimeout(() => {
        console.log('🏠 Redirecting to home page...');
        navigate('/');
      }, 5000);
    }
  }, [location.state, navigate]);

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش'
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
                        src={`http://localhost:3001${item.mainImage}`}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-emerald-600 font-semibold mb-3">
                          {item.price.toFixed(2)} ر.س × {item.quantity} = {(item.price * item.quantity).toFixed(2)} ر.س
                        </p>
                        
                        {/* Dynamic Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">المواصفات المختارة:</p>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                                <div key={optionName} className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500">{formatOptionName(optionName)}</p>
                                  <p className="font-medium text-gray-900">
                                    {value}
                                    {item.optionsPricing?.[optionName] && item.optionsPricing[optionName] > 0 && (
                                      <span className="text-emerald-600 text-xs mr-1">
                                        (+{item.optionsPricing[optionName]} ر.س)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
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