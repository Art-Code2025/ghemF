import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Mail, Phone, Calendar, User, Lock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                سياسة الاستخدام والخصوصية
              </h1>
              <p className="text-gray-600 mt-2">متجر غيم - Ghem.store</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-bold">آخر تحديث: 25 مايو 2025م</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-8 lg:p-12">
              {/* Introduction */}
              <div className="mb-12">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    مرحبًا بكم في متجر غيم – Ghem.store المتخصص في بيع ملابس التخرج. نحن ملتزمون بحماية خصوصيتكم وتوفير تجربة تسوق آمنة ومتوافقة مع الأنظمة المعمول بها في المملكة العربية السعودية، بما يشمل نظام التجارة الإلكترونية ونظام حماية البيانات الشخصية (PDPL).
                  </p>
                </div>
              </div>

              {/* Section 1: Definitions */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-600" />
                  أولًا: تعريفات عامة
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-800">المتجر:</span> Ghem.store، ويشمل الموقع الإلكتروني وجميع خدماته.
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-800">المستخدم/العميل:</span> أي شخص طبيعي أو اعتباري يستخدم المتجر للتصفح أو الشراء.
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-800">البيانات الشخصية:</span> المعلومات التي تحدد هوية المستخدم مثل الاسم، رقم الجوال، البريد الإلكتروني، العنوان.
                  </div>
                </div>
              </div>

              {/* Section 2: Agreement */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                  ثانيًا: الموافقة على الشروط
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-gray-800">باستخدامك للموقع أو الشراء من خلاله، فإنك تقر بموافقتك الكاملة على هذه السياسة.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-gray-800">إذا كنت لا توافق على أي جزء من هذه الشروط، يُرجى عدم استخدام الموقع.</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Data Collection */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <User className="w-7 h-7 text-purple-600" />
                  ثالثًا: جمع البيانات واستخدامها
                </h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">نقوم بجمع البيانات التالية:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <span className="font-bold text-purple-800">الاسم الكامل</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <span className="font-bold text-purple-800">رقم الجوال والبريد الإلكتروني</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <span className="font-bold text-purple-800">عنوان التوصيل</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <span className="font-bold text-purple-800">معلومات الدفع (عبر بوابات دفع آمنة)</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 md:col-span-2">
                      <span className="font-bold text-purple-800">عنوان IP ونوع المتصفح والجهاز</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">نستخدم هذه البيانات من أجل:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">معالجة الطلبات والشحن</span>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">التواصل معك بشأن حالة الطلب</span>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">تحسين تجربة المستخدم</span>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">الامتثال للمتطلبات النظامية</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-gray-800 font-medium">
                    لا نقوم بجمع أي بيانات غير ضرورية أو غير مرتبطة بالخدمة، ولا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية دون إذنك.
                  </p>
                </div>
              </div>

              {/* Section 4: Data Sharing */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-7 h-7 text-orange-600" />
                  رابعًا: مشاركة البيانات
                </h2>
                <p className="text-gray-800 mb-4">يتم مشاركة بياناتك فقط مع الأطراف التالية:</p>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="font-bold text-orange-800">شركات الشحن</span> لتوصيل الطلبات
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="font-bold text-orange-800">مزودي الدفع الإلكتروني</span> مثل HyperPay، Apple Pay، Tamara
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="font-bold text-orange-800">الجهات الرسمية</span> في حال وجود طلب نظامي ملزم
                  </div>
                </div>
              </div>

              {/* Section 5: Data Protection */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Lock className="w-7 h-7 text-green-600" />
                  خامسًا: حماية البيانات
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">نستخدم بروتوكولات أمان مشفّرة (SSL)</span>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">نلتزم بعدم كشف بيانات المستخدم لأي جهة غير مخولة</span>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">نحدّ من الوصول إلى البيانات داخل النظام وفق ضوابط داخلية صارمة</span>
                  </div>
                </div>
              </div>

              {/* Section 6: User Rights */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <User className="w-7 h-7 text-indigo-600" />
                  سادسًا: حقوق المستخدم
                </h2>
                <p className="text-gray-800 mb-4">وفق نظام حماية البيانات الشخصية، لك الحق في:</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-800">معرفة البيانات التي نحتفظ بها</span>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-800">طلب تصحيح أو حذف بياناتك</span>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-800">الاعتراض على استخدام بياناتك في الإعلانات أو العروض</span>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-800">تقديم شكوى للجهات المختصة (مثل الهيئة السعودية للبيانات - سدايا)</span>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-gray-800">
                    لطلب أي مما سبق، يرجى التواصل معنا عبر: 
                    <span className="font-bold text-blue-600 mr-2">support@ghem.store</span>
                  </p>
                </div>
              </div>

              {/* Section 7: Terms of Use */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-red-600" />
                  سابعًا: شروط استخدام الموقع
                </h2>
                <div className="space-y-3">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <span className="text-gray-800">يُشترط أن يكون عمر المستخدم 18 عامًا فأكثر</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <span className="text-gray-800">يتحمل المستخدم مسؤولية استخدام حسابه والمحافظة على بيانات دخوله</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <span className="text-gray-800">يُمنع استخدام الموقع لأي غرض غير قانوني أو مخالف للآداب العامة</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <span className="text-gray-800">يحتفظ المتجر بحق تعليق أو إلغاء الحسابات المخالفة دون إشعار</span>
                  </div>
                </div>
              </div>

              {/* Section 8: Intellectual Property */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-purple-600" />
                  ثامنًا: الملكية الفكرية
                </h2>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <span className="text-gray-800">جميع المحتويات المعروضة في الموقع (صور، نصوص، تصاميم، شعارات) مملوكة لمتجر غيم</span>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <span className="text-gray-800">يُمنع استخدام أي من هذه المحتويات بدون إذن كتابي مسبق</span>
                  </div>
                </div>
              </div>

              {/* Section 9: Policy Updates */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-7 h-7 text-yellow-600" />
                  تاسعًا: التعديلات على السياسة
                </h2>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <span className="text-gray-800">يحتفظ المتجر بحقه في تعديل أو تحديث هذه السياسة في أي وقت</span>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <span className="text-gray-800">سيتم نشر أي تغييرات في هذه الصفحة، ويُعتبر استمرار استخدام الموقع بعد التعديل موافقة ضمنية</span>
                  </div>
                </div>
              </div>

              {/* Section 10: Applicable Law */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-gray-600" />
                  عاشرًا: القانون المعمول به
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-800 text-lg">
                    تخضع هذه السياسة لأنظمة وقوانين المملكة العربية السعودية، ويكون لأي نزاع علاقة بها اختصاص الجهات القضائية المختصة في المملكة.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Mail className="w-7 h-7 text-blue-600" />
                  للتواصل معنا
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-gray-800 mb-4">لأي استفسارات بخصوص هذه السياسة، يُرجى التواصل عبر:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">البريد الإلكتروني: </span>
                      <span className="font-bold text-blue-600">support@ghem.store</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">رقم الجوال / واتساب: </span>
                      <span className="font-bold text-blue-600">+966XXXXXXXXX</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105 font-bold"
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

export default PrivacyPolicy; 