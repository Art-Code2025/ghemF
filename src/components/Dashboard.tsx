import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  X,
  Save,
  AlertCircle,
  DollarSign,
  Star,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Menu,
  ChevronDown,
  Settings
} from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from '../config/api';

// Interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  mainImage: string;
  dynamicOptions?: any[];
  specifications?: any[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  expiryDate: string;
  isActive: boolean;
}

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryFile, setSelectedCategoryFile] = useState<File | null>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    mainImage: '',
    dynamicOptions: [],
    specifications: []
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxUses: 1,
    expiryDate: '',
    isActive: true
  });

  // Add new mobile state
  const [activeMobileSection, setActiveMobileSection] = useState<'stats' | 'products' | 'categories' | 'customers' | 'orders' | 'coupons'>('stats');

  // Fetch functions using new API system
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.PRODUCTS);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('خطأ في تحميل الفئات');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('خطأ في تحميل العملاء');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await apiCall(API_ENDPOINTS.ORDERS);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطأ في تحميل الطلبات');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const data = await apiCall(API_ENDPOINTS.COUPONS);
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('خطأ في تحميل الكوبونات');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await apiCall(API_ENDPOINTS.CUSTOMER_STATS);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('خطأ في تحميل الإحصائيات');
    } finally {
      setLoadingStats(false);
    }
  };

  // Reset functions
  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0,
      mainImage: '',
      dynamicOptions: [],
      specifications: []
    });
    setSelectedFile(null);
  };

  // CRUD operations using new API system
  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (key === 'dynamicOptions') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'specifications') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      toast.success('تم إضافة المنتج بنجاح');
      setShowAddModal(false);
      resetNewProduct();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('خطأ في إضافة المنتج');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const formData = new FormData();
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (key === 'dynamicOptions') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'specifications') {
          formData.append(key, JSON.stringify(value));
        } else if (key !== 'id' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(editingProduct.id)), {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      toast.success('تم تحديث المنتج بنجاح');
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('خطأ في تحديث المنتج');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'DELETE',
      });
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('خطأ في حذف المنتج');
    }
  };

  const handleAddCategory = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      if (selectedCategoryFile) {
        formData.append('image', selectedCategoryFile);
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      toast.success('تم إضافة الفئة بنجاح');
      setShowAddCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setSelectedCategoryFile(null);
      fetchCategories();
      
      // Trigger categories update event
      window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('خطأ في إضافة الفئة');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'DELETE',
      });
      toast.success('تم حذف الفئة بنجاح');
      fetchCategories();
      
      // Trigger categories update event
      window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('خطأ في حذف الفئة');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    try {
      await apiCall(API_ENDPOINTS.CUSTOMER_BY_ID(id), {
        method: 'DELETE',
      });
      toast.success('تم حذف العميل بنجاح');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('خطأ في حذف العميل');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiCall(API_ENDPOINTS.ORDER_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('تم تحديث حالة الطلب بنجاح');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('خطأ في تحديث حالة الطلب');
    }
  };

  const handleAddCoupon = async () => {
    try {
      await apiCall(API_ENDPOINTS.COUPONS, {
        method: 'POST',
        body: JSON.stringify(newCoupon),
      });
      toast.success('تم إضافة الكوبون بنجاح');
      setShowAddCouponModal(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxUses: 1,
        expiryDate: '',
        isActive: true
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error('خطأ في إضافة الكوبون');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      await apiCall(API_ENDPOINTS.COUPON_BY_ID(id), {
        method: 'DELETE',
      });
      toast.success('تم حذف الكوبون بنجاح');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('خطأ في حذف الكوبون');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
    fetchOrders();
    fetchCoupons();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden" dir="rtl">
      <style>
        {`
          /* Mobile Responsive Utilities */
          @media (max-width: 768px) {
            .mobile-card {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              transform-origin: center;
            }
            .mobile-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            .mobile-scroll {
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
            }
            
            .mobile-table-card {
              background: white;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border: 1px solid #f1f5f9;
            }
            
            .mobile-section-nav {
              position: sticky;
              top: 0;
              z-index: 20;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 16px;
            }
          }
          
          /* Line clamp utilities */
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* Improved animations */
          .fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .slide-up {
            animation: slideUp 0.3s ease-out;
          }
          
          @keyframes slideUp {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          /* Custom scrollbar for better UX */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          /* Enhanced mobile touch targets */
          @media (max-width: 768px) {
            button, select, input {
              min-height: 44px;
              touch-action: manipulation;
            }
            
            .touch-target {
              min-height: 44px;
              min-width: 44px;
            }
          }
        `}
      </style>
      
      {/* Mobile Section Navigation */}
      <div className="mobile-section-nav block md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
          <div className="relative">
            <select
              value={activeMobileSection}
              onChange={(e) => setActiveMobileSection(e.target.value as any)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
            >
              <option value="stats">الإحصائيات</option>
              <option value="products">المنتجات</option>
              <option value="categories">الفئات</option>
              <option value="customers">العملاء</option>
              <option value="orders">الطلبات</option>
              <option value="coupons">الكوبونات</option>
            </select>
            <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Desktop Title */}
        <h1 className="hidden md:block text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">لوحة التحكم</h1>
        
        {/* Stats Cards - Always visible on desktop, conditionally on mobile */}
        <div className={`${activeMobileSection === 'stats' ? 'block' : 'hidden'} md:block fade-in`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mobile-card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
                <div className="mr-3 md:mr-4 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">إجمالي المنتجات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin text-gray-400 ml-1 md:ml-2" />
                      <span className="text-xs md:text-sm text-gray-400">جاري التحميل...</span>
                    </div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mobile-card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
                <div className="mr-3 md:mr-4 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">إجمالي العملاء</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin text-gray-400 ml-1 md:ml-2" />
                      <span className="text-xs md:text-sm text-gray-400">جاري التحميل...</span>
                    </div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mobile-card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                </div>
                <div className="mr-3 md:mr-4 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">إجمالي الطلبات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin text-gray-400 ml-1 md:ml-2" />
                      <span className="text-xs md:text-sm text-gray-400">جاري التحميل...</span>
                    </div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mobile-card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
                <div className="mr-3 md:mr-4 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">إجمالي الإيرادات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin text-gray-400 ml-1 md:ml-2" />
                      <span className="text-xs md:text-sm text-gray-400">جاري التحميل...</span>
                    </div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className={`${activeMobileSection === 'products' ? 'block' : 'hidden'} md:block slide-up`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">المنتجات</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm md:text-base transition-colors duration-200"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  إضافة منتج
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">لا توجد منتجات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="block md:hidden space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="mobile-table-card">
                        <div className="flex items-start gap-3">
                          <img
                            src={buildImageUrl(product.mainImage)}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                              <span className="font-bold text-blue-600">{product.price} ر.س</span>
                              <span className="bg-gray-100 px-2 py-1 rounded-full">مخزون: {product.stock}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowEditModal(true);
                                }}
                                className="flex-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الصورة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الاسم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            السعر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المخزون
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={buildImageUrl(product.mainImage)}
                                alt={product.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-semibold">{product.price} ر.س</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.stock > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : product.stock > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowEditModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200 touch-target"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200 touch-target"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className={`${activeMobileSection === 'categories' ? 'block' : 'hidden'} md:block slide-up`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">الفئات</h2>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm md:text-base transition-colors duration-200"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  إضافة فئة
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loadingCategories ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري تحميل الفئات...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">لا توجد فئات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="block md:hidden space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="mobile-table-card">
                        <div className="flex items-start gap-3">
                          <img
                            src={buildImageUrl(category.image)}
                            alt={category.name}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{category.description}</p>
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={buildImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customers Section */}
        <div className={`${activeMobileSection === 'customers' ? 'block' : 'hidden'} md:block slide-up`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">العملاء</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loadingCustomers ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري تحميل العملاء...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">لا يوجد عملاء مسجلين</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="block md:hidden space-y-3">
                    {customers.map((customer) => (
                      <div key={customer.id} className="mobile-table-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">{customer.name}</h3>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 truncate">📧 {customer.email}</p>
                              <p className="text-xs text-gray-600">📞 {customer.phone}</p>
                              <p className="text-xs text-gray-500">
                                📅 {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الاسم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            البريد الإلكتروني
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الهاتف
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ التسجيل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{customer.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{customer.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200 touch-target"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className={`${activeMobileSection === 'orders' ? 'block' : 'hidden'} md:block slide-up`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">الطلبات</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loadingOrders ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري تحميل الطلبات...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">لا توجد طلبات</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="block md:hidden space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="mobile-table-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-blue-600 text-sm">#{order.id}</span>
                              <span className="font-bold text-green-600 text-sm">{order.total} ر.س</span>
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm mb-1">{order.customerName}</h3>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs text-gray-500">
                                📅 {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status === 'pending' ? 'قيد الانتظار' :
                                 order.status === 'processing' ? 'قيد المعالجة' :
                                 order.status === 'shipped' ? 'تم الشحن' :
                                 order.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="flex-1 text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="processing">قيد المعالجة</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="delivered">تم التسليم</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                              <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            رقم الطلب
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            اسم العميل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المجموع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التاريخ
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">#{order.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.customerName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600">{order.total} ر.س</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="processing">قيد المعالجة</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="delivered">تم التسليم</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200 touch-target">
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Coupons Section */}
        <div className={`${activeMobileSection === 'coupons' ? 'block' : 'hidden'} md:block slide-up`}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">الكوبونات</h2>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm md:text-base transition-colors duration-200"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  إضافة كوبون
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loadingCoupons ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">جاري تحميل الكوبونات...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">لا توجد كوبونات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="block md:hidden space-y-3">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="mobile-table-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-purple-600 text-sm bg-purple-50 px-2 py-1 rounded-lg">
                                {coupon.code}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coupon.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {coupon.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                              <div>
                                <span className="font-medium">النوع:</span>{' '}
                                {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </div>
                              <div>
                                <span className="font-medium">القيمة:</span>{' '}
                                {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}
                              </div>
                              <div>
                                <span className="font-medium">الحد الأدنى:</span> {coupon.minOrderAmount} ر.س
                              </div>
                              <div>
                                <span className="font-medium">الانتهاء:</span>{' '}
                                {new Date(coupon.expiryDate).toLocaleDateString('ar-SA')}
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الكود
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نوع الخصم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            قيمة الخصم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحد الأدنى
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ الانتهاء
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">
                                {coupon.code}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{coupon.minOrderAmount} ر.س</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(coupon.expiryDate).toLocaleDateString('ar-SA')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                coupon.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {coupon.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200 touch-target"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 