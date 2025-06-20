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
  MoreVertical,
  Truck,
  MapPin,
  Globe,
  Percent,
  Clock
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
  items?: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
  selectedOptions?: any;
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

// إضافة interfaces جديدة للشحن
interface ShippingZone {
  id: number;
  name: string;
  description: string;
  cities: string[];
  shippingCost: number;
  freeShippingThreshold: number;
  estimatedDays: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

interface ShippingSettings {
  id: number;
  globalFreeShippingThreshold: number;
  defaultShippingCost: number;
  enableFreeShipping: boolean;
  enableZoneBasedShipping: boolean;
  enableExpressShipping: boolean;
  expressShippingCost: number;
  expressShippingDays: string;
  shippingTaxRate: number;
  updatedAt: string;
}

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  // State variables الموجودة
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

  // إضافة state جديد للشحن
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    id: 1,
    globalFreeShippingThreshold: 500,
    defaultShippingCost: 50,
    enableFreeShipping: true,
    enableZoneBasedShipping: false,
    enableExpressShipping: true,
    expressShippingCost: 100,
    expressShippingDays: '1-2 أيام',
    shippingTaxRate: 0,
    updatedAt: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [showShippingSettingsModal, setShowShippingSettingsModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
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

  // إضافة state جديد للمنطقة الجديدة
  const [newZone, setNewZone] = useState<Partial<ShippingZone>>({
    name: '',
    description: '',
    cities: [],
    shippingCost: 0,
    freeShippingThreshold: 0,
    estimatedDays: '2-3 أيام',
    isActive: true,
    priority: 1
  });

  const [newCityInput, setNewCityInput] = useState('');

  // Add new mobile state مع إضافة الشحن
  const [activeMobileSection, setActiveMobileSection] = useState<'stats' | 'products' | 'categories' | 'customers' | 'orders' | 'coupons' | 'shipping'>('stats');

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

  // إضافة دوال جلب بيانات الشحن
  const fetchShippingZones = async () => {
    try {
      setLoadingShipping(true);
      // محاكاة البيانات حتى يتم ربطها بالباك إند
      const mockZones: ShippingZone[] = [
        {
          id: 1,
          name: 'الرياض الكبرى',
          description: 'مدينة الرياض والمناطق المحيطة',
          cities: ['الرياض', 'الدرعية', 'الخرج', 'المزاحمية'],
          shippingCost: 25,
          freeShippingThreshold: 300,
          estimatedDays: '1-2 أيام',
          isActive: true,
          priority: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'جدة ومكة',
          description: 'المنطقة الغربية الرئيسية',
          cities: ['جدة', 'مكة المكرمة', 'الطائف', 'رابغ'],
          shippingCost: 35,
          freeShippingThreshold: 400,
          estimatedDays: '2-3 أيام',
          isActive: true,
          priority: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'المنطقة الشرقية',
          description: 'الدمام والخبر والأحساء',
          cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الجبيل'],
          shippingCost: 40,
          freeShippingThreshold: 450,
          estimatedDays: '2-4 أيام',
          isActive: true,
          priority: 3,
          createdAt: new Date().toISOString()
        }
      ];
      setShippingZones(mockZones);
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      toast.error('خطأ في تحميل مناطق الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  const fetchShippingSettings = async () => {
    try {
      // محاكاة البيانات حتى يتم ربطها بالباك إند
      const mockSettings: ShippingSettings = {
        id: 1,
        globalFreeShippingThreshold: 500,
        defaultShippingCost: 50,
        enableFreeShipping: true,
        enableZoneBasedShipping: true,
        enableExpressShipping: true,
        expressShippingCost: 100,
        expressShippingDays: '1-2 أيام',
        shippingTaxRate: 0,
        updatedAt: new Date().toISOString()
      };
      setShippingSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      toast.error('خطأ في تحميل إعدادات الشحن');
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

  const resetNewZone = () => {
    setNewZone({
      name: '',
      description: '',
      cities: [],
      shippingCost: 0,
      freeShippingThreshold: 0,
      estimatedDays: '2-3 أيام',
      isActive: true,
      priority: 1
    });
    setNewCityInput('');
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
        } else {
          formData.append(key, value?.toString() || '');
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const data = await apiCall(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        body: formData
      });

      setProducts([...products, data]);
      setShowAddModal(false);
      resetNewProduct();
      toast.success('تم إضافة المنتج بنجاح');
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
        } else {
          formData.append(key, value?.toString() || '');
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const data = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(editingProduct.id), {
        method: 'PUT',
        body: formData
      });

      setProducts(products.map(p => p.id === editingProduct.id ? data : p));
      setShowEditModal(false);
      setEditingProduct(null);
      setSelectedFile(null);
      toast.success('تم تحديث المنتج بنجاح');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('خطأ في تحديث المنتج');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'DELETE'
      });

      setProducts(products.filter(p => p.id !== id));
      toast.success('تم حذف المنتج بنجاح');
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

      await apiCall(API_ENDPOINTS.CATEGORIES, {
        method: 'POST',
        body: formData
      });

      toast.success('تم إضافة الفئة بنجاح');
      setShowAddCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setSelectedCategoryFile(null);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('خطأ في إضافة الفئة');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'DELETE'
      });

      toast.success('تم حذف الفئة بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('خطأ في حذف الفئة');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    try {
      await apiCall(API_ENDPOINTS.CUSTOMER_BY_ID(id), {
        method: 'DELETE'
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
      await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      toast.success('تم تحديث حالة الطلب');
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
        body: JSON.stringify(newCoupon)
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
        method: 'DELETE'
      });

      toast.success('تم حذف الكوبون بنجاح');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('خطأ في حذف الكوبون');
    }
  };

  // إضافة دوال CRUD للشحن
  const handleAddZone = async () => {
    try {
      const zoneData: Omit<ShippingZone, 'id' | 'createdAt'> = {
        name: newZone.name || '',
        description: newZone.description || '',
        cities: newZone.cities || [],
        shippingCost: newZone.shippingCost || 0,
        freeShippingThreshold: newZone.freeShippingThreshold || 0,
        estimatedDays: newZone.estimatedDays || '2-3 أيام',
        isActive: newZone.isActive ?? true,
        priority: newZone.priority || 1
      };

      // محاكاة إضافة المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const newZoneWithId: ShippingZone = {
        ...zoneData,
        id: Math.max(...shippingZones.map(z => z.id), 0) + 1,
        createdAt: new Date().toISOString()
      };

      setShippingZones([...shippingZones, newZoneWithId]);
      setShowAddZoneModal(false);
      resetNewZone();
      toast.success('تم إضافة المنطقة بنجاح');
    } catch (error) {
      console.error('Error adding zone:', error);
      toast.error('خطأ في إضافة المنطقة');
    }
  };

  const handleUpdateZone = async () => {
    if (!editingZone) return;

    try {
      // محاكاة تحديث المنطقة (سيتم ربطها بالباك إند لاحقاً)
      setShippingZones(shippingZones.map(z => z.id === editingZone.id ? editingZone : z));
      setShowEditZoneModal(false);
      setEditingZone(null);
      toast.success('تم تحديث المنطقة بنجاح');
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('خطأ في تحديث المنطقة');
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;

    try {
      // محاكاة حذف المنطقة (سيتم ربطها بالباك إند لاحقاً)
      setShippingZones(shippingZones.filter(z => z.id !== id));
      toast.success('تم حذف المنطقة بنجاح');
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('خطأ في حذف المنطقة');
    }
  };

  const handleUpdateShippingSettings = async () => {
    try {
      // محاكاة تحديث إعدادات الشحن (سيتم ربطها بالباك إند لاحقاً)
      setShippingSettings({
        ...shippingSettings,
        updatedAt: new Date().toISOString()
      });
      setShowShippingSettingsModal(false);
      toast.success('تم تحديث إعدادات الشحن بنجاح');
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      toast.error('خطأ في تحديث إعدادات الشحن');
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
    fetchShippingZones();
    fetchShippingSettings();
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
              <option value="shipping">الشحن</option>
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

        {/* Products Section - Enhanced Professional Mobile Design */}
        <div className={`${activeMobileSection === 'products' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base lg:text-xl font-semibold text-gray-900">المنتجات</h2>
                    <p className="text-xs text-gray-500 lg:hidden">{products.length} منتج</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 lg:px-4 py-2 lg:py-2 rounded-lg lg:rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-xs lg:text-sm transition-all duration-300 mobile-action-button shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  إضافة منتج
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loading ? (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 mt-2 text-sm font-medium">جاري تحميل المنتجات...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 lg:h-12 lg:w-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-500 text-sm">ابدأ بإضافة منتجاتك الأولى</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    إضافة منتج جديد
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile Professional Cards View */}
                  <div className="block lg:hidden space-y-4">
                    {products.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'slideUp 0.3s ease-out forwards'
                        }}
                      >
                        {/* Product Header */}
                        <div className="flex items-start gap-3 p-4">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={buildImageUrl(product.mainImage)}
                              alt={product.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Stock Badge */}
                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                              product.stock > 10 ? 'bg-green-500' : 
                              product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {product.stock}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 ml-2">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowEditModal(true);
                                  }}
                                  className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200 transform hover:scale-110"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="w-8 h-8 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200 transform hover:scale-110"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Category */}
                            {product.categoryId && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  {categories.find(cat => cat.id === product.categoryId)?.name || 'فئة غير محددة'}
                                </span>
                              </div>
                            )}

                            {/* Price and Stock Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600">
                                  {product.price} ر.س
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className={`font-medium ${
                                  product.stock > 10 ? 'text-green-600' : 
                                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {product.stock > 0 ? `${product.stock} متوفر` : 'نفد المخزون'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Description */}
                        {product.description && (
                          <div className="px-4 pb-4">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Product Specs Preview */}
                        {product.specifications && product.specifications.length > 0 && (
                          <div className="px-4 pb-4">
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Settings className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">المواصفات</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {product.specifications.slice(0, 3).map((spec, idx) => (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-blue-700 border border-blue-200"
                                  >
                                    {spec.name}: {spec.value}
                                  </span>
                                ))}
                                {product.specifications.length > 3 && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    +{product.specifications.length - 3} أخرى
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Actions Bar */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>تم الإنشاء منذ {Math.floor((Date.now() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-xs font-medium text-gray-600">
                                {product.stock > 0 ? 'متاح' : 'غير متاح'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View - Enhanced */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            المنتج
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            الفئة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            السعر
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            المخزون
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                          <tr 
                            key={product.id} 
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                          >
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={buildImageUrl(product.mainImage)}
                                  alt={product.name}
                                  className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                />
                                <div className="mr-4">
                                  <div className="text-sm font-bold text-gray-900 mb-1">{product.name}</div>
                                  {product.description && (
                                    <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {categories.find(cat => cat.id === product.categoryId)?.name || 'غير محدد'}
                              </span>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-lg font-bold text-green-600">{product.price} ر.س</div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                product.stock > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : product.stock > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.stock} قطعة
                              </span>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowEditModal(true);
                                  }}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
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
                            {/* Order Items Preview */}
                            {order.items && order.items.length > 0 && (
                              <div className="mt-2 bg-gray-50 rounded p-2">
                                <p className="compact-text text-gray-600 mb-1">المنتجات:</p>
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 mb-1">
                                    <span className="compact-text font-medium">{item.productName}</span>
                                    <span className="compact-text text-gray-500">×{item.quantity}</span>
                                    {/* Selected Options Preview */}
                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                      <span className="compact-badge bg-blue-100 text-blue-800">
                                        مع مواصفات
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <span className="compact-text text-gray-500">
                                    +{order.items.length - 2} منتج آخر
                                  </span>
                                )}
                              </div>
                            )}
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
                            المنتجات والمواصفات
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
                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                {order.items && order.items.length > 0 ? (
                                  <div className="space-y-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                      <div key={idx} className="bg-gray-50 rounded-lg p-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-medium text-gray-900 truncate">
                                            {item.productName}
                                          </span>
                                          <span className="text-xs text-gray-500 ml-2">×{item.quantity}</span>
                                        </div>
                                        {/* Selected Options */}
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                          <div className="space-y-1">
                                            {Object.entries(item.selectedOptions).slice(0, 2).map(([optionName, value]) => (
                                              <div key={optionName} className="flex items-center gap-1">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                                  {optionName === 'size' ? 'مقاس' : 
                                                   optionName === 'color' ? 'لون' :
                                                   optionName === 'nameOnSash' ? 'الاسم' :
                                                   optionName === 'embroideryColor' ? 'لون التطريز' :
                                                   optionName}
                                                </span>
                                                <span className="text-xs text-gray-700 truncate max-w-20">
                                                  {String(value)}
                                                </span>
                                              </div>
                                            ))}
                                            {Object.keys(item.selectedOptions).length > 2 && (
                                              <span className="text-xs text-gray-500">
                                                +{Object.keys(item.selectedOptions).length - 2} مواصفة أخرى
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {order.items.length > 3 && (
                                      <div className="text-xs text-gray-500 text-center py-1">
                                        +{order.items.length - 3} منتج آخر
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">لا توجد تفاصيل</span>
                                )}
                              </div>
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

        {/* Shipping Zones Section */}
        <div className={`${activeMobileSection === 'shipping' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">مناطق الشحن</h2>
                <button
                  onClick={() => setShowAddZoneModal(true)}
                  className="bg-blue-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg hover:bg-blue-700 flex items-center justify-center text-xs lg:text-sm transition-colors duration-200 mobile-action-button"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  إضافة منطقة جديدة
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingShipping ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل مناطق الشحن...</p>
                </div>
              ) : shippingZones.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Truck className="h-8 w-8 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
                  <p className="text-gray-500 text-sm">لا توجد مناطق شحن متاحة</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    {shippingZones.map((zone) => (
                      <div key={zone.id} className="mobile-compact-card">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="compact-title text-gray-900 mb-1">{zone.name}</h3>
                            <p className="compact-text text-gray-600 line-clamp-1">{zone.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingZone(zone);
                                setShowEditZoneModal(true);
                              }}
                              className="compact-button bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteZone(zone.id)}
                              className="compact-button bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {shippingZones.map((zone) => (
                      <div key={zone.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2">{zone.name}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{zone.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">المدن:</span> {zone.cities.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">تكلفة الشحن:</span> {zone.shippingCost} ر.س
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">الحد الأدنى للشحن:</span> {zone.freeShippingThreshold} ر.س
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">المدة المقدرة:</span> {zone.estimatedDays}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {zone.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">الأولوية:</span> {zone.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="font-medium">تاريخ الإنشاء:</span> {new Date(zone.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingZone(zone);
                                setShowEditZoneModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteZone(zone.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Settings Section */}
        <div className={`${activeMobileSection === 'shipping' ? 'block' : 'hidden'} lg:block slide-up`}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-100 mb-4 lg:mb-6">
            <div className="px-3 lg:px-6 py-2 lg:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 lg:gap-3">
                <h2 className="text-base lg:text-xl font-semibold text-gray-900">إعدادات الشحن</h2>
                <button
                  onClick={() => setShowShippingSettingsModal(true)}
                  className="bg-blue-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg hover:bg-blue-700 flex items-center justify-center text-xs lg:text-sm transition-colors duration-200 mobile-action-button"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                  تحديث إعدادات الشحن
                </button>
              </div>
            </div>
            
            <div className="p-3 lg:p-6">
              {loadingShipping ? (
                <div className="text-center py-6 lg:py-8">
                  <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">جاري تحميل إعدادات الشحن...</p>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="block lg:hidden space-y-2">
                    <div className="mobile-compact-card">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="compact-title font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">
                              الحد الأدنى للشحن المجاني
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                              {shippingSettings.globalFreeShippingThreshold} ر.س
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">التكلفة الافتراضية:</span> {shippingSettings.defaultShippingCost} ر.س
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">{shippingSettings.enableFreeShipping ? 'يتم تطبيق الشحن المجاني' : 'لا يتم تطبيق الشحن المجاني'}</span>
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">{shippingSettings.enableZoneBasedShipping ? 'يتم تطبيق الشحن على أساس منطقة' : 'لا يتم تطبيق الشحن على أساس منطقة'}</span>
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">{shippingSettings.enableExpressShipping ? 'يتم تطبيق الشحن السريع' : 'لا يتم تطبيق الشحن السريع'}</span>
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">تكلفة الشحن السريع:</span> {shippingSettings.expressShippingCost} ر.س
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">المدة المقدرة للشحن السريع:</span> {shippingSettings.expressShippingDays}
                            </p>
                            <p className="compact-text text-gray-600">
                              <span className="font-medium">معدل الضريبة:</span> {shippingSettings.shippingTaxRate}%
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowShippingSettingsModal(true)}
                          className="compact-button bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحد الأدنى للشحن المجاني
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التكلفة الافتراضية
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تطبيق الشحن المجاني
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تطبيق الشحن على أساس منطقة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تطبيق الشحن السريع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تكلفة الشحن السريع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المدة المقدرة للشحن السريع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            معدل الضريبة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.globalFreeShippingThreshold} ر.س</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.defaultShippingCost} ر.س</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.enableFreeShipping ? 'نعم' : 'لا'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.enableZoneBasedShipping ? 'نعم' : 'لا'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.enableExpressShipping ? 'نعم' : 'لا'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.expressShippingCost} ر.س</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.expressShippingDays}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{shippingSettings.shippingTaxRate}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setShowShippingSettingsModal(true)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
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

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowAddZoneModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">إضافة منطقة جديدة</h3>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">اسم المنطقة</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="أدخل اسم المنطقة"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الوصف</label>
                <textarea
                  value={newZone.description}
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base resize-none"
                  placeholder="وصف المنطقة"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المدن</label>
                <input
                  type="text"
                  value={(newZone.cities || []).join(', ')}
                  onChange={(e) => setNewZone({...newZone, cities: e.target.value.split(',').map(city => city.trim())})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="أدخل المدن (مفصولة بفواصل)"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">تكلفة الشحن</label>
                <input
                  type="number"
                  value={newZone.shippingCost}
                  onChange={(e) => setNewZone({...newZone, shippingCost: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الحد الأدنى للشحن المجاني</label>
                <input
                  type="number"
                  value={newZone.freeShippingThreshold}
                  onChange={(e) => setNewZone({...newZone, freeShippingThreshold: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المدة المقدرة للشحن</label>
                <input
                  type="text"
                  value={newZone.estimatedDays}
                  onChange={(e) => setNewZone({...newZone, estimatedDays: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="أدخل المدة المقدرة (مثال: 2-3 أيام)"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الأولوية</label>
                <input
                  type="number"
                  value={newZone.priority}
                  onChange={(e) => setNewZone({...newZone, priority: parseInt(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddZone}
                className="flex-1 bg-green-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إضافة المنطقة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {showEditZoneModal && editingZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowEditZoneModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">تعديل المنطقة</h3>
              <button
                onClick={() => setShowEditZoneModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">اسم المنطقة</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({...editingZone, name: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الوصف</label>
                <textarea
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({...editingZone, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base resize-none"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المدن</label>
                <input
                  type="text"
                  value={editingZone.cities.join(', ')}
                  onChange={(e) => setEditingZone({...editingZone, cities: e.target.value.split(',').map(city => city.trim())})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="أدخل المدن (مفصولة بفواصل)"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">تكلفة الشحن</label>
                <input
                  type="number"
                  value={editingZone.shippingCost}
                  onChange={(e) => setEditingZone({...editingZone, shippingCost: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الحد الأدنى للشحن المجاني</label>
                <input
                  type="number"
                  value={editingZone.freeShippingThreshold}
                  onChange={(e) => setEditingZone({...editingZone, freeShippingThreshold: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المدة المقدرة للشحن</label>
                <input
                  type="text"
                  value={editingZone.estimatedDays}
                  onChange={(e) => setEditingZone({...editingZone, estimatedDays: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="أدخل المدة المقدرة (مثال: 2-3 أيام)"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الأولوية</label>
                <input
                  type="number"
                  value={editingZone.priority}
                  onChange={(e) => setEditingZone({...editingZone, priority: parseInt(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowEditZoneModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateZone}
                className="flex-1 bg-blue-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings Modal */}
      {showShippingSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowShippingSettingsModal(false)}>
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">تحديث إعدادات الشحن</h3>
              <button
                onClick={() => setShowShippingSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">الحد الأدنى للشحن المجاني</label>
                <input
                  type="number"
                  value={shippingSettings.globalFreeShippingThreshold}
                  onChange={(e) => setShippingSettings({...shippingSettings, globalFreeShippingThreshold: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">التكلفة الافتراضية</label>
                <input
                  type="number"
                  value={shippingSettings.defaultShippingCost}
                  onChange={(e) => setShippingSettings({...shippingSettings, defaultShippingCost: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">{shippingSettings.enableFreeShipping ? 'تطبيق الشحن المجاني' : 'تطبيق الشحن المجاني'}</label>
                <select
                  value={shippingSettings.enableFreeShipping ? 'yes' : 'no'}
                  onChange={(e) => setShippingSettings({...shippingSettings, enableFreeShipping: e.target.value === 'yes'})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                >
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">{shippingSettings.enableZoneBasedShipping ? 'تطبيق الشحن على أساس منطقة' : 'تطبيق الشحن على أساس منطقة'}</label>
                <select
                  value={shippingSettings.enableZoneBasedShipping ? 'yes' : 'no'}
                  onChange={(e) => setShippingSettings({...shippingSettings, enableZoneBasedShipping: e.target.value === 'yes'})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                >
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">{shippingSettings.enableExpressShipping ? 'تطبيق الشحن السريع' : 'تطبيق الشحن السريع'}</label>
                <select
                  value={shippingSettings.enableExpressShipping ? 'yes' : 'no'}
                  onChange={(e) => setShippingSettings({...shippingSettings, enableExpressShipping: e.target.value === 'yes'})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                >
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">تكلفة الشحن السريع</label>
                <input
                  type="number"
                  value={shippingSettings.expressShippingCost}
                  onChange={(e) => setShippingSettings({...shippingSettings, expressShippingCost: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">المدة المقدرة للشحن السريع</label>
                <input
                  type="text"
                  value={shippingSettings.expressShippingDays}
                  onChange={(e) => setShippingSettings({...shippingSettings, expressShippingDays: e.target.value})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="1-2 أيام"
                />
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">معدل الضريبة</label>
                <input
                  type="number"
                  value={shippingSettings.shippingTaxRate}
                  onChange={(e) => setShippingSettings({...shippingSettings, shippingTaxRate: parseFloat(e.target.value)})}
                  className="w-full p-2 lg:p-3 border border-gray-300 rounded-md lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => setShowShippingSettingsModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-md lg:rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm lg:text-base font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateShippingSettings}
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