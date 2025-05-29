import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, Mail, Phone, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';

const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                سياسة الاسترجاع والاستبدال
              </h1>
              <p className="text-gray-600 mt-2">متجر غيم - Ghem.store</p>
            </div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-bold">آخر تحديث: 25 مايو 2025م</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-8 lg:p-12">
              {/* Introduction */}
              <div className="mb-12">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    في متجر غيم – Ghem.store، نحرص على رضا عملائنا ونلتزم بتقديم تجربة تسوق عادلة وسلسة، بما يتوافق مع نظام التجارة الإلكترونية المعمول به في المملكة العربية السعودية. توضح هذه السياسة الشروط التي تنظّم عمليات الاسترجاع والاستبدال للمنتجات المشتراة من المتجر.
                  </p>
                </div>
              </div>

              {/* Section 1: Return Conditions */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <RotateCcw className="w-7 h-7 text-green-600" />
                  أولًا: شروط الاسترجاع
                </h2>
                
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-green-800">
                      يحق للعميل طلب استرجاع المنتج خلال مدة لا تتجاوز ساعتين  من وقت الاستلام
                    </span>
                  </div>
                </div>

                <p className="text-gray-800 mb-6 font-medium">وفقًا للشروط التالية:</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أن يكون المنتج غير مستخدم وبحالته الأصلية تمامًا</span>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أن تكون جميع التغليفات سليمة والوسوم (Tags) الأصلية لم تتم إزالتها</span>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أن لا يكون المنتج قد تم تفصيله أو تخصيصه حسب الطلب (كالطباعة أو التفصيل حسب المقاس)</span>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أن يتم تقديم طلب الاسترجاع عبر البريد الإلكتروني الموضح أدناه خلال المهلة الزمنية المحددة</span>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أن يكون الاسترجاع بسبب مبرر واضح مثل: اختلاف المنتج، عيب مصنعي، أو خطأ في المقاس</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-yellow-800">ملاحظة: </span>
                      <span className="text-gray-800">لا يمكن استرجاع المنتجات المخصصة أو المصممة حسب طلب العميل، إلا في حال وجود عيب مصنعي واضح أو خطأ من المتجر.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Exchange Conditions */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Package className="w-7 h-7 text-blue-600" />
                  ثانيًا: شروط الاستبدال
                </h2>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-bold text-blue-800">
                      يتم قبول طلبات الاستبدال خلال ساعتين من وقت الاستلام بشروط معينة
                    </span>
                  </div>
                </div>

                <p className="text-gray-800 mb-6 font-medium">في الحالات التالية:</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">وصول منتج مختلف عن الذي تم طلبه</span>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">وجود عيب مصنعي واضح أو تلف في المنتج</span>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">عدم توافق المقاس مع ما هو مذكور في الطلب</span>
                  </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mt-6">
                  <p className="text-gray-800">
                    <span className="font-bold text-indigo-800">ملاحظة: </span>
                    يتم الاستبدال بعد التأكد من حالة المنتج، ويخضع لتوفر المنتج البديل في المخزون.
                  </p>
                </div>
              </div>

              {/* Section 3: Process Steps */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Mail className="w-7 h-7 text-purple-600" />
                  ثالثًا: إجراءات طلب الاسترجاع أو الاستبدال
                </h2>
                
                <p className="text-gray-800 mb-6 font-medium">يرجى اتباع الخطوات التالية لتقديم الطلب:</p>
                
                <div className="space-y-6">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-2">التواصل معنا</h4>
                        <p className="text-gray-800">عبر البريد الإلكتروني: <span className="font-bold text-purple-600">support@ghem.store</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-2">إرسال المعلومات المطلوبة</h4>
                        <p className="text-gray-800">رقم الطلب + اسم العميل + صور واضحة للمنتج (من جميع الجهات)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-2">توضيح السبب</h4>
                        <p className="text-gray-800">توضيح سبب الاسترجاع أو الاستبدال بالتفصيل</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">4</div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-2">انتظار الرد</h4>
                        <p className="text-gray-800">انتظار رد فريق الدعم خلال 1 – 2 يوم عمل</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">5</div>
                      <div>
                        <h4 className="font-bold text-purple-800 mb-2">التنسيق للاستلام</h4>
                        <p className="text-gray-800">سيتم تنسيق الاستلام عبر شركة الشحن، أو إعلامك بالخطوة التالية</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Refund Policy */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                  رابعًا: سياسة استرداد المبلغ
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-gray-800">في حال قبول طلب الاسترجاع، يتم إعادة المبلغ إلى نفس وسيلة الدفع خلال <span className="font-bold text-green-600">7 أيام عمل</span> من استلام المنتج وفحصه.</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-gray-800">لا تشمل عملية الاسترداد رسوم الشحن أو الدفع الإلكتروني ما لم يكن الخطأ من المتجر.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-gray-800">إذا تم الدفع عبر خدمات تقسيط مثل تمارا، فإن الاسترداد يتم بالتنسيق مع مزود الخدمة.</p>
                  </div>
                </div>
              </div>

              {/* Section 5: Exceptions */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <XCircle className="w-7 h-7 text-red-600" />
                  خامسًا: استثناءات لا يشملها الاسترجاع أو الاستبدال
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">المنتجات المستخدمة أو المغسولة أو المعدّلة بأي شكل</span>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">المنتجات المخفضة ضمن عروض خاصة (إلا في حال وجود عيب مصنعي)</span>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">مرور أكثر من 7 أيام على تاريخ استلام الطلب</span>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-800">أي منتج تم تفصيله أو تخصيصه حسب رغبة العميل</span>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Mail className="w-7 h-7 text-blue-600" />
                  للتواصل معنا
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-gray-800 mb-4">لأي استفسارات متعلقة بسياسة الاسترجاع والاستبدال، نرجو التواصل معنا عبر:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">البريد الإلكتروني: </span>
                      <span className="font-bold text-blue-600">support@ghem.store</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">رقم الجوال / واتساب: </span>
                      <span className="font-bold text-blue-600">+966551064118</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">ساعات العمل: </span>
                      <span className="font-bold text-blue-600">من الأحد إلى الخميس – 10 صباحًا إلى 6 مساءً</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105 font-bold"
                >
                  <ArrowRight className="w-5 h-5" />
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy; 