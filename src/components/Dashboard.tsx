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
  Settings,
  Grid,
  List,
  MoreVertical
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>
        {`
          /* Enhanced Mobile Responsive Utilities */
          @media (max-width: 768px) {
            .mobile-card {
              transition: all 0.2s ease-in-out;
              transform-origin: center;
            }
            .mobile-card:active {
              transform: scale(0.98);
            }
            
            .mobile-scroll {
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
            }
            
            .mobile-compact-card {
              background: white;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              border: 1px solid #f1f5f9;
            }
            
            .mobile-section-nav {
              position: sticky;
              top: 0;
              z-index: 30;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 12px;
            }
            
            .mobile-stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .mobile-action-button {
              min-height: 36px;
              min-width: 36px;
              font-size: 12px;
              padding: 6px 12px;
            }
            
            .mobile-image-thumb {
              width: 40px;
              height: 40px;
              border-radius: 6px;
              object-fit: cover;
              flex-shrink: 0;
            }
          }
          
          /* Compact Design Utilities */
          .compact-text {
            font-size: 13px;
            line-height: 1.4;
          }
          
          .compact-title {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.3;
          }
          
          .compact-badge {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
          }
          
          .compact-button {
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 4px;
            min-height: 28px;
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
          
          /* Custom scrollbar for better UX */
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 2px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          /* Enhanced animations */
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .slide-up {
            animation: slideUp 0.2s ease-out;
          }
          
          @keyframes slideUp {
            from { transform: translateY(5px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      
      {/* Mobile Section Navigation */}
      <div className="mobile-section-nav block lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">لوحة التحكم</h1>
          <div className="relative">
            <select
              value={activeMobileSection}
              onChange={(e) => setActiveMobileSection(e.target.value as any)}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-6"
            >
              <option value="stats">الإحصائيات</option>
              <option value="products">المنتجات</option>
              <option value="categories">الفئات</option>
              <option value="customers">العملاء</option>
              <option value="orders">الطلبات</option>
              <option value="coupons">الكوبونات</option>
            </select>
            <ChevronDown className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 lg:p-6">
        {/* Desktop Title */}
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
        
        {/* Stats Cards - Compact Mobile Design */}
        <div className={`${activeMobileSection === 'stats' ? 'block' : 'hidden'} lg:block fade-in mb-4 lg:mb-6`}>
          <div className="mobile-stats-grid lg:grid lg:grid-cols-4 lg:gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-md lg:rounded-lg">
                  <Package className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">المنتجات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalProducts}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-green-100 rounded-md lg:rounded-lg">
                  <Users className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">العملاء</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-purple-100 rounded-md lg:rounded-lg">
                  <ShoppingCart className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">الطلبات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-yellow-100 rounded-md lg:rounded-lg">
                  <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">الإيرادات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section - Compact Mobile Design */}
        <div className={`${activeMobileSection === 'products' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">المنتجات</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg hover:bg-blue-700 flex items-center justify-center text-xs lg:text-sm transition-colors duration-200 mobile-action-button"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  إضافة منتج
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loading ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري التحميل...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Package className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا توجد منتجات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="mobile-compact-card">
                        <div className="flex items-center gap-3">
                          <img
                            src={buildImageUrl(product.mainImage)}
                            alt={product.name}
                            className="mobile-image-thumb"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="compact-title text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                            <div className="flex items-center justify-between mb-2">
                              <span className="compact-text font-bold text-blue-600">{product.price} ر.س</span>
                              <span className="compact-badge bg-gray-100 text-gray-700">مخزون: {product.stock}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowEditModal(true);
                              }}
                              className="compact-button bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="compact-button bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
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
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
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
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
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

        {/* Categories Section - Compact Mobile Design */}
        <div className={`${activeMobileSection === 'categories' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">الفئات</h2>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-green-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg hover:bg-green-700 flex items-center justify-center text-xs lg:text-sm transition-colors duration-200 mobile-action-button"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  إضافة فئة
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingCategories ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل الفئات...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Package className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا توجد فئات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="mobile-compact-card">
                        <div className="flex items-center gap-3">
                          <img
                            src={buildImageUrl(category.image)}
                            alt={category.name}
                            className="mobile-image-thumb"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="compact-title text-gray-900 mb-1">{category.name}</h3>
                            <p className="compact-text text-gray-600 line-clamp-1">{category.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="compact-button bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className={`${activeMobileSection === 'customers' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">العملاء</h2>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingCustomers ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل العملاء...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Users className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا يوجد عملاء مسجلين</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {customers.map((customer) => (
                      <div key={customer.id} className="mobile-compact-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="compact-title text-gray-900 mb-1">{customer.name}</h3>
                            <div className="space-y-1">
                              <p className="compact-text text-gray-600 truncate">📧 {customer.email}</p>
                              <p className="compact-text text-gray-600">📞 {customer.phone}</p>
                              <p className="compact-text text-gray-500">
                                📅 {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="compact-button bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
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
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
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
        <div className={`${activeMobileSection === 'orders' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">الطلبات</h2>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingOrders ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل الطلبات...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <ShoppingCart className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا توجد طلبات</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="mobile-compact-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-blue-600 text-sm">#{order.id}</span>
                              <span className="font-bold text-green-600 text-sm">{order.total} ر.س</span>
                            </div>
                            <h3 className="compact-title text-gray-900 mb-1">{order.customerName}</h3>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="compact-text text-gray-500">
                                📅 {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                              <span className={`compact-badge ${
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
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
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              >
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
        <div className={`${activeMobileSection === 'coupons' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">الكوبونات</h2>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-purple-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg hover:bg-purple-700 flex items-center justify-center text-xs lg:text-sm transition-colors duration-200 mobile-action-button"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  إضافة كوبون
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingCoupons ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل الكوبونات...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Star className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا توجد كوبونات متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="mobile-compact-card">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="compact-title font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                {coupon.code}
                              </span>
                              <span className={`compact-badge ${
                                coupon.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {coupon.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="compact-text text-gray-600">
                                <span className="font-medium">النوع:</span> {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </p>
                              <p className="compact-text text-gray-600">
                                <span className="font-medium">القيمة:</span> {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}
                              </p>
                              <p className="compact-text text-gray-500">
                                <span className="font-medium">الحد الأدنى:</span> {coupon.minOrderAmount} ر.س
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="compact-button bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
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
                              <div className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">
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
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
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

      {/* Modals - Compact Design for Mobile */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">إضافة منتج جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">اسم المنتج</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="أدخل اسم المنتج"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الوصف</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base resize-none"
                  placeholder="وصف المنتج"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">السعر</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المخزون</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الفئة</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                >
                  <option value={0}>اختر فئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">صورة المنتج</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-blue-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إضافة المنتج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowAddCategoryModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">إضافة فئة جديدة</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">اسم الفئة</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="أدخل اسم الفئة"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الوصف</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base resize-none"
                  placeholder="وصف الفئة"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">صورة الفئة</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedCategoryFile(e.target.files?.[0] || null)}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-green-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إضافة الفئة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowAddCouponModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">إضافة كوبون جديد</h3>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">كود الكوبون</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="SAVE20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">نوع الخصم</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">قيمة الخصم</label>
                  <input
                    type="number"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                    placeholder="10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الحد الأدنى للطلب</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: parseFloat(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">عدد الاستخدامات</label>
                  <input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCoupon}
                className="flex-1 bg-purple-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إضافة الكوبون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">تعديل المنتج</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">اسم المنتج</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الوصف</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">السعر</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المخزون</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الفئة</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => setEditingProduct({...editingProduct, categoryId: parseInt(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">تغيير الصورة (اختياري)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 bg-blue-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 