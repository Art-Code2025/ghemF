import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, Package, Clock, CreditCard, FileText, Printer, Copy, CheckCircle, Truck, AlertCircle, Star, Eye, Edit, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl } from '../config/api';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  couponDiscount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: number, newStatus: string) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, isOpen, onClose, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'invoice'>('details');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'قيد التحضير';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      toast.success(`تم تحديث حالة الطلب إلى: ${getStatusText(newStatus)}`);
    } catch (error) {
      toast.error('فشل في تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`تم نسخ ${label}`);
    });
  };

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

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>فاتورة الطلب #${order.id}</title>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Cairo', Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              direction: rtl; 
              line-height: 1.6;
              color: #2d3748;
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            
            .header h1 {
              font-size: 2.5rem;
              font-weight: 900;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              position: relative;
              z-index: 1;
            }
            
            .header h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 5px;
              position: relative;
              z-index: 1;
            }
            
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px;
            }
            
            .order-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 25px;
              border-radius: 15px;
              border: 2px solid #e2e8f0;
            }
            
            .order-info div {
              text-align: center;
              flex: 1;
            }
            
            .order-info strong {
              color: #4c51bf;
              font-weight: 700;
              font-size: 1.1rem;
            }
            
            .customer-section {
              margin-bottom: 40px;
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 15px;
              overflow: hidden;
            }
            
            .customer-header {
              background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
              color: white;
              padding: 20px;
              font-weight: 700;
              font-size: 1.2rem;
              text-align: center;
            }
            
            .customer-content {
              padding: 25px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            
            .customer-item {
              background: #f7fafc;
              padding: 15px;
              border-radius: 10px;
              border-right: 4px solid #4299e1;
            }
            
            .customer-item strong {
              color: #2d3748;
              display: block;
              margin-bottom: 5px;
              font-weight: 600;
            }
            
            .customer-item span {
              color: #4a5568;
              font-size: 1.05rem;
            }
            
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            .products-table thead {
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
              color: white;
            }
            
            .products-table th {
              padding: 20px 15px;
              text-align: center;
              font-weight: 700;
              font-size: 1.1rem;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .products-table td {
              padding: 18px 15px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
              font-size: 1.05rem;
            }
            
            .products-table tbody tr:nth-child(even) {
              background-color: #f8fafc;
            }
            
            .totals-section {
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              padding: 30px;
              border-radius: 15px;
              border: 2px solid #e2e8f0;
              margin-top: 30px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 1.1rem;
              border-bottom: 1px solid #cbd5e0;
            }
            
            .total-row:last-child {
              border-bottom: none;
              font-weight: 900;
              font-size: 1.4rem;
              color: #2d3748;
              margin-top: 15px;
              padding-top: 20px;
              border-top: 3px solid #4299e1;
            }
            
            .footer {
              margin-top: 50px;
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
              color: white;
              border-radius: 15px;
            }
            
            .footer h3 {
              font-size: 1.3rem;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .footer p {
              font-size: 1.05rem;
              opacity: 0.9;
              margin-bottom: 5px;
            }
            
            @media print {
              body { 
                background: white;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .invoice-container {
                box-shadow: none;
                border: 1px solid #ddd;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>🛍️ متجر غيم</h1>
              <h2>فاتورة ضريبية مبسطة</h2>
              <p>📄 رقم الفاتورة: INV-${order.id}-${new Date().getFullYear()}</p>
            </div>
            
            <div class="content">
              <div class="order-info">
                <div>
                  <strong>📅 تاريخ الطلب</strong><br>
                  ${new Date(order.createdAt).toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div>
                  <strong>🕐 وقت الطلب</strong><br>
                  ${new Date(order.createdAt).toLocaleTimeString('ar-SA')}
                </div>
                <div>
                  <strong>📊 حالة الطلب</strong><br>
                  <span style="background: ${
                    order.status === 'delivered' ? '#48bb78' : 
                    order.status === 'shipped' ? '#4299e1' : 
                    order.status === 'confirmed' ? '#38b2ac' :
                    order.status === 'preparing' ? '#9f7aea' : '#ed8936'
                  }; color: white; padding: 8px 16px; border-radius: 25px; font-weight: 600;">
                    ${getStatusText(order.status)}
                  </span>
                </div>
              </div>
              
              <div class="customer-section">
                <div class="customer-header">
                  👤 بيانات العميل ومعلومات التوصيل
                </div>
                <div class="customer-content">
                  <div class="customer-item">
                    <strong>🏷️ اسم العميل:</strong>
                    <span>${order.customerName}</span>
                  </div>
                  <div class="customer-item">
                    <strong>📱 رقم الهاتف:</strong>
                    <span>${order.customerPhone}</span>
                  </div>
                  <div class="customer-item">
                    <strong>📧 البريد الإلكتروني:</strong>
                    <span>${order.customerEmail}</span>
                  </div>
                  <div class="customer-item">
                    <strong>🏠 المدينة:</strong>
                    <span>${order.city}</span>
                  </div>
                  <div class="customer-item" style="grid-column: 1 / -1;">
                    <strong>📍 العنوان التفصيلي:</strong>
                    <span>${order.address}</span>
                  </div>
                </div>
              </div>
              
              <table class="products-table">
                <thead>
                  <tr>
                    <th>🛍️ اسم المنتج</th>
                    <th>📦 الكمية</th>
                    <th>💰 السعر الواحد</th>
                    <th>🎯 المواصفات</th>
                    <th>🧮 الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td style="font-weight: 600; color: #2d3748;">${item.productName}</td>
                      <td style="font-weight: 700; color: #4299e1;">${item.quantity}</td>
                      <td style="color: #38a169;">${item.price.toFixed(2)} ر.س</td>
                      <td style="font-size: 0.9rem; color: #4a5568;">
                        ${item.selectedOptions ? Object.entries(item.selectedOptions).map(([key, value]) => 
                          `<div style="margin: 2px 0; padding: 2px 6px; background: #f0fff4; border-radius: 4px; display: inline-block;">
                            <strong>${formatOptionName(key)}:</strong> ${value}
                            ${item.optionsPricing?.[key] ? `<span style="color: #38a169;">(+${item.optionsPricing[key]} ر.س)</span>` : ''}
                          </div>`
                        ).join(' ') : '<span style="color: #a0aec0;">بدون مواصفات إضافية</span>'}
                      </td>
                      <td style="font-weight: 700; color: #2d3748; font-size: 1.1rem;">${item.totalPrice.toFixed(2)} ر.س</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              ${order.paymentMethod ? `
                <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                  <strong style="color: #c53030; font-size: 1.2rem;">💳 طريقة الدفع: ${order.paymentMethod}</strong>
                  ${order.paymentStatus ? `<br><span style="color: #38a169;">✅ حالة الدفع: ${order.paymentStatus === 'paid' ? 'مدفوع' : order.paymentStatus === 'pending' ? 'في الانتظار' : 'فشل'}</span>` : ''}
                </div>
              ` : ''}
              
              <div class="totals-section">
                <div class="total-row">
                  <span><strong>📦 المجموع الفرعي:</strong></span>
                  <span style="font-weight: 600;">${(order.subtotal || order.total).toFixed(2)} ر.س</span>
                </div>
                ${order.deliveryFee && order.deliveryFee > 0 ? `
                  <div class="total-row">
                    <span><strong>🚚 رسوم التوصيل:</strong></span>
                    <span style="color: #4299e1; font-weight: 600;">${order.deliveryFee.toFixed(2)} ر.س</span>
                  </div>
                ` : ''}
                ${order.couponDiscount && order.couponDiscount > 0 ? `
                  <div class="total-row">
                    <span><strong>🎫 خصم الكوبون:</strong></span>
                    <span style="color: #38a169; font-weight: 600;">-${order.couponDiscount.toFixed(2)} ر.س</span>
                  </div>
                ` : ''}
                <div class="total-row">
                  <span><strong>🏆 المجموع النهائي شامل الضريبة:</strong></span>
                  <span>${order.total.toFixed(2)} ر.س</span>
                </div>
              </div>
              
              <div class="footer">
                <h3>🙏 شكراً لك على ثقتك في متجر غيم</h3>
                <p>📞 للاستفسارات: 966501234567+</p>
                <p>📧 البريد الإلكتروني: support@ghem.store</p>
                <p>🌐 الموقع الإلكتروني: www.ghem.store</p>
                <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
                  تم إنشاء هذه الفاتورة إلكترونياً في ${new Date().toLocaleDateString('ar-SA')} الساعة ${new Date().toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'قيد المراجعة', icon: Clock },
    { value: 'confirmed', label: 'مؤكد', icon: CheckCircle },
    { value: 'preparing', label: 'قيد التحضير', icon: Package },
    { value: 'shipped', label: 'تم الشحن', icon: Truck },
    { value: 'delivered', label: 'تم التسليم', icon: Star },
    { value: 'cancelled', label: 'ملغي', icon: AlertCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">الطلب #{order.id}</h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'details', label: 'تفاصيل الطلب', icon: Eye },
              { id: 'timeline', label: 'تتبع الطلب', icon: Clock },
              { id: 'invoice', label: 'الفاتورة', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-max px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => copyToClipboard(`${order.customerName}\n${order.customerPhone}\n${order.address}, ${order.city}`, 'معلومات العميل')}
                    className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">نسخ العنوان</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(order.customerPhone, 'رقم الهاتف')}
                    className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
                  >
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">نسخ الرقم</span>
                  </button>
                  <button
                    onClick={printInvoice}
                    className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <Printer className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">طباعة فاتورة</span>
                  </button>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all"
                  >
                    <Phone className="w-6 h-6 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">اتصال مباشر</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 text-blue-600 ml-3" />
                    معلومات العميل والتوصيل
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center ml-4">
                        <span className="text-white font-bold">👤</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">اسم العميل</p>
                        <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center ml-4">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                        <p className="font-bold text-lg text-gray-800 dir-ltr">{order.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center ml-4">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                        <p className="font-bold text-gray-800">{order.customerEmail}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center ml-4">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">عنوان التوصيل</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-orange-200">
                        <p className="font-bold text-gray-800 text-lg leading-relaxed">
                          {order.address}
                        </p>
                        <p className="text-orange-600 font-semibold mt-1">{order.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <CreditCard className="w-6 h-6 text-green-600 ml-3" />
                    ملخص الطلب والدفع
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">المجموع الفرعي</span>
                      <span className="font-bold text-lg">{(order.subtotal || order.total).toFixed(2)} ر.س</span>
                    </div>

                    {order.deliveryFee && order.deliveryFee > 0 && (
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                        <span className="text-gray-600">رسوم التوصيل</span>
                        <span className="font-bold text-lg text-blue-600">{order.deliveryFee.toFixed(2)} ر.س</span>
                      </div>
                    )}

                    {order.couponDiscount && order.couponDiscount > 0 && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                        <span className="text-gray-600">خصم الكوبون</span>
                        <span className="font-bold text-lg text-green-600">-{order.couponDiscount.toFixed(2)} ر.س</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-orange-200">
                      <span className="text-gray-800 font-semibold">المجموع النهائي</span>
                      <span className="font-bold text-2xl text-orange-600">{order.total.toFixed(2)} ر.س</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500 mb-1">طريقة الدفع</p>
                        <p className="font-bold text-gray-800">{order.paymentMethod || 'الدفع عند الاستلام'}</p>
                      </div>
                      <div className="p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500 mb-2">حالة الدفع</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === 'paid' ? 'مدفوع' : order.paymentStatus === 'pending' ? 'معلق' : 'فشل'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Package className="w-6 h-6 text-purple-600 ml-3" />
                  تفاصيل المنتجات ({order.items.length} منتج)
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-4">
                        {item.productImage && (
                          <img
                            src={buildImageUrl(item.productImage)}
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">{item.productName}</h4>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs text-gray-500">الكمية</p>
                              <p className="font-bold text-blue-600">{item.quantity}</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                              <p className="text-xs text-gray-500">السعر</p>
                              <p className="font-bold text-green-600">{item.price.toFixed(2)} ر.س</p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg">
                              <p className="text-xs text-gray-500">الإجمالي</p>
                              <p className="font-bold text-purple-600">{item.totalPrice.toFixed(2)} ر.س</p>
                            </div>
                          </div>

                          {/* Custom Options */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">🎨 المواصفات المختارة:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                                  <div key={optionName} className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                                    <p className="text-xs text-gray-600">{formatOptionName(optionName)}</p>
                                    <p className="font-semibold text-gray-800">
                                      {value}
                                      {item.optionsPricing?.[optionName] && item.optionsPricing[optionName] > 0 && (
                                        <span className="text-amber-600 text-xs mr-1">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 ml-2" />
                    ملاحظات العميل
                  </h3>
                  <p className="text-amber-700 bg-white p-4 rounded-lg">{order.notes}</p>
                </div>
              )}

              {/* Status Management */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 ml-2" />
                  إدارة حالة الطلب
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {statusOptions.map(status => {
                    const Icon = status.icon;
                    const isCurrentStatus = order.status === status.value;
                    return (
                      <button
                        key={status.value}
                        onClick={() => !isCurrentStatus && handleStatusChange(status.value)}
                        disabled={isCurrentStatus || isUpdatingStatus}
                        className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isCurrentStatus
                            ? 'bg-blue-100 border-blue-400 text-blue-800 cursor-default'
                            : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg text-gray-700 hover:text-blue-600'
                        } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="w-5 h-5 ml-2" />
                        <span className="font-medium">{status.label}</span>
                        {isCurrentStatus && <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">تتبع مراحل الطلب</h3>
              <div className="relative">
                {statusOptions.map((status, index) => {
                  const Icon = status.icon;
                  const isCompleted = statusOptions.findIndex(s => s.value === order.status) >= index;
                  const isCurrent = order.status === status.value;
                  
                  return (
                    <div key={status.value} className={`flex items-center mb-8 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrent ? 'bg-blue-600 text-white shadow-lg scale-110' :
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
                      } transition-all duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="mr-4">
                        <h4 className={`font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                          {status.label}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isCurrent ? 'الحالة الحالية' : isCompleted ? 'تم إنجازها' : 'في الانتظار'}
                        </p>
                      </div>
                      {index < statusOptions.length - 1 && (
                        <div className={`absolute right-6 top-12 w-0.5 h-8 ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`} 
                             style={{ marginTop: `${index * 64}px` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">فاتورة الطلب</h3>
                <button
                  onClick={printInvoice}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة الفاتورة
                </button>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">متجر غيم</h2>
                  <p className="text-gray-600">فاتورة الطلب #{order.id}</p>
                  <p className="text-sm text-gray-500">تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">بيانات العميل:</h4>
                    <p className="text-gray-600">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerPhone}</p>
                    <p className="text-gray-600">{order.customerEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">عنوان التوصيل:</h4>
                    <p className="text-gray-600">{order.address}</p>
                    <p className="text-gray-600">{order.city}</p>
                  </div>
                </div>

                <table className="w-full border border-gray-200 mb-6">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 p-3 text-right">المنتج</th>
                      <th className="border border-gray-200 p-3 text-right">الكمية</th>
                      <th className="border border-gray-200 p-3 text-right">السعر</th>
                      <th className="border border-gray-200 p-3 text-right">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-3">{item.productName}</td>
                        <td className="border border-gray-200 p-3">{item.quantity}</td>
                        <td className="border border-gray-200 p-3">{item.price.toFixed(2)} ر.س</td>
                        <td className="border border-gray-200 p-3">{item.totalPrice.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{(order.subtotal || order.total).toFixed(2)} ر.س</span>
                  </div>
                  {order.deliveryFee && order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>رسوم التوصيل:</span>
                      <span>{order.deliveryFee.toFixed(2)} ر.س</span>
                    </div>
                  )}
                  {order.couponDiscount && order.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>خصم الكوبون:</span>
                      <span>-{order.couponDiscount.toFixed(2)} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>المجموع النهائي:</span>
                    <span>{order.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 