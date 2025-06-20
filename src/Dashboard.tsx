import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, Calendar, 
  Eye, Edit, Trash2, Plus, Search, Filter, Download, RefreshCw,
  BarChart3, PieChart, Activity, Clock, CheckCircle, XCircle,
  AlertTriangle, Star, Heart, MessageSquare, Phone, Mail,
  MapPin, CreditCard, Truck, Gift, Tag, Percent, Settings,
  LogOut, Home, Menu, X, ChevronDown, ChevronRight, Bell,
  FileText, Image, Upload, Save, ArrowLeft, ArrowRight,
  Grid, List, MoreVertical, AlertCircle as AlertIcon,
  Circle, Zap, Shield, Monitor, Smartphone
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { apiCall, API_ENDPOINTS, buildImageUrl } from './config/api';
import OrderModal from './components/OrderModal';
import DeleteModal from './components/DeleteModal';
import logo from './assets/logo.png';

// تعريف الأنواع
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  createdAt?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages: string[];
  specifications: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  createdAt?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  attachments?: {
    images?: string[];
    text?: string;
  };
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

interface Customer {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  city?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  lastLogin?: string;
  createdAt: string;
  status?: 'active' | 'inactive';
  // إضافة الإحصائيات الجديدة
  cartItemsCount?: number;
  wishlistItemsCount?: number;
  hasCart?: boolean;
  hasWishlist?: boolean;
}

interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

// إضافة interfaces نظام الشحن
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

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  
  // الحالات المشتركة
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // حالات المنتجات والتصنيفات
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');

  // حالات الكوبونات والـ Wishlist
  const [coupons, setCoupons] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const [couponSearchTerm, setCouponSearchTerm] = useState<string>('');

  // حالات الطلبات والإحصائيات
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // حالات العملاء
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');

  // حالات نظام الشحن
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [filteredShippingZones, setFilteredShippingZones] = useState<ShippingZone[]>([]);
  const [shippingZoneSearchTerm, setShippingZoneSearchTerm] = useState<string>('');
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    id: 1,
    globalFreeShippingThreshold: 500,
    defaultShippingCost: 50,
    enableFreeShipping: true,
    enableZoneBasedShipping: true, // تفعيل الشحن حسب المنطقة
    enableExpressShipping: true,
    expressShippingCost: 100,
    expressShippingDays: '1-2 أيام',
    shippingTaxRate: 0,
    updatedAt: new Date().toISOString()
  });
  const [showShippingZoneModal, setShowShippingZoneModal] = useState<boolean>(false);
  const [showShippingSettingsModal, setShowShippingSettingsModal] = useState<boolean>(false);
  const [editingShippingZone, setEditingShippingZone] = useState<ShippingZone | null>(null);
  const [newShippingZone, setNewShippingZone] = useState<Partial<ShippingZone>>({
    name: '',
    description: '',
    cities: [],
    shippingCost: 0,
    freeShippingThreshold: 0,
    estimatedDays: '2-3 أيام',
    isActive: true,
    priority: 1
  });

  // Delete Modal States
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'product' as 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'shippingZone',
    id: 0,
    name: '',
    loading: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCoupons();
    fetchWishlistItems();
    fetchOrders();
    fetchCustomers();
    fetchCustomerStats();
    
    // Generate sales data for charts
    generateSalesData();
    
    // Listen for updates
    const handleCategoriesUpdate = () => {
      fetchCategories();
    };
    
    const handleProductsUpdate = () => {
      fetchProducts();
    };
    
    const handleCouponsUpdate = () => {
      fetchCoupons();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('productsUpdated', handleProductsUpdate);
    window.addEventListener('couponsUpdated', handleCouponsUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('couponsUpdated', handleCouponsUpdate);
    };
  }, []);

  // Update filtered orders when orders change or when switching to orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      filterOrders(orderSearchTerm, orderStatusFilter);
    }
  }, [orders, currentTab, orderSearchTerm, orderStatusFilter]);

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchOrders();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentTab]);

  // وظائف المنتجات
  const fetchProducts = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.PRODUCTS);
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('فشل في جلب المنتجات');
    }
  };

  // وظائف التصنيفات
  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('فشل في جلب التصنيفات');
    }
  };

  // وظائف الكوبونات
  const fetchCoupons = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.COUPONS);
      setCoupons(data);
      setFilteredCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('فشل في جلب الكوبونات');
    }
  };

  // وظائف قائمة الأمنيات
  const fetchWishlistItems = async () => {
    try {
      // Note: This might need user ID - for now using a placeholder
      const data = await apiCall('wishlist');
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      // Don't show error toast for wishlist as it might not be critical
    }
  };

  // وظائف الطلبات
  const fetchOrders = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.ORDERS);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('فشل في جلب الطلبات');
    }
  };

  // وظائف العملاء
  const fetchCustomers = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('فشل في جلب العملاء');
    }
  };

  // إضافة useEffect لتحديث العملاء كل 30 ثانية
  useEffect(() => {
    if (currentTab === 'customers') {
      fetchCustomers();
      
      // تحديث تلقائي كل 30 ثانية
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing customers...');
        fetchCustomers();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentTab]);

  // جلب إحصائيات العملاء
  const [customerStats, setCustomerStats] = useState<any>(null);
  
  const fetchCustomerStats = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMER_STATS);
      return data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (currentTab === 'customers') {
      fetchCustomerStats();
    }
  }, [currentTab]);

  const generateSalesData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const salesData: SalesData[] = months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 8000) + 5000 + (index * 500),
      orders: Math.floor(Math.random() * 40) + 20 + (index * 3)
    }));
    setSalesData(salesData);

    if (products.length > 0) {
      const topProductsData = products.slice(0, 5).map((product, index) => ({
        name: product.name,
        sales: Math.floor(Math.random() * 80) + 20 - (index * 5),
        revenue: (Math.floor(Math.random() * 80) + 20 - (index * 5)) * product.price
      }));
      setTopProducts(topProductsData);
    }
  };

  const handleOrderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setOrderSearchTerm(term);
    filterOrders(term, orderStatusFilter);
  };

  const handleOrderStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setOrderStatusFilter(status);
    filterOrders(orderSearchTerm, status);
  };

  const filterOrders = (searchTerm: string, statusFilter: string) => {
    let filtered = orders;

    if (statusFilter !== 'all' && statusFilter !== '') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  // Order update handler
  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setLoading(true);
      
      await apiCall(API_ENDPOINTS.ORDER_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      // تحديث الطلب في الحالة المحلية
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );
      
      // تحديث الطلبات المفلترة أيضاً
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );

      toast.success(`تم تحديث حالة الطلب إلى: ${getOrderStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('فشل في تحديث حالة الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setLoading(true);
      
      await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderId), {
        method: 'DELETE',
      });

      // إزالة الطلب من الحالة المحلية
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setFilteredOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      toast.success('تم حذف الطلب بنجاح');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('فشل في حذف الطلب');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOrderStatusText = (status: string) => {
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

  const getOrderPriorityColor = (order: any) => {
    const orderDate = new Date(order.createdAt);
    const hoursAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
    
    if (order.status === 'pending' && hoursAgo > 24) return 'border-l-4 border-red-500 bg-red-50';
    if (order.status === 'pending' && hoursAgo > 12) return 'border-l-4 border-orange-500 bg-orange-50';
    if (order.status === 'pending') return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-gray-300';
  };

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش',
      fabric: 'نوع القماش',
      length: 'الطول',
      width: 'العرض'
    };
    return optionNames[optionName] || optionName;
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'DELETE',
      });
      
      setProducts(products.filter(p => p.id !== id));
      setFilteredProducts(filteredProducts.filter(p => p.id !== id));
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('فشل في حذف المنتج');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.COUPON_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCoupons(coupons.filter(c => c.id !== id));
      setFilteredCoupons(filteredCoupons.filter(c => c.id !== id));
      toast.success('تم حذف الكوبون بنجاح');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('فشل في حذف الكوبون');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCategories(categories.filter(c => c.id !== id));
      setFilteredCategories(filteredCategories.filter(c => c.id !== id));
      toast.success('تم حذف التصنيف بنجاح');
      
      // Trigger categories update event
      window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف التصنيف');
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setProductSearchTerm(term);
    
    if (term) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCategorySearchTerm(term);

    if (term) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(term.toLowerCase()) ||
        category.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const handleCouponSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCouponSearchTerm(term);

    if (term) {
      const filtered = coupons.filter(coupon =>
        coupon.name.toLowerCase().includes(term.toLowerCase()) ||
        coupon.code.toLowerCase().includes(term.toLowerCase()) ||
        coupon.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  };

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearchTerm(term);
    
    if (!term) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => {
        const searchTerm = term.toLowerCase();
        const customerName = (customer.name || customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()).toLowerCase();
        const customerEmail = (customer.email || '').toLowerCase();
        const customerPhone = (customer.phone || '').toLowerCase();
        
        return customerName.includes(searchTerm) || 
               customerEmail.includes(searchTerm) || 
               customerPhone.includes(searchTerm);
      });
      setFilteredCustomers(filtered);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const switchTab = (tab: string) => {
    setSearchParams({ tab });
    setIsMobileMenuOpen(false); // Close mobile menu when switching tabs
  };

  // إحصائيات المتجر
  const getStoreStats = () => {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const outOfStockProducts = products.filter(p => p.stock <= 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const wishlistItemsCount = wishlistItems.length;
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalProducts,
      totalCategories,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      totalCoupons,
      activeCoupons,
      wishlistItemsCount,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue
    };
  };

  const stats = getStoreStats();

  // Refresh categories when returning from add/edit
  useEffect(() => {
    if (currentTab === 'categories') {
      fetchCategories();
    }
  }, [currentTab]);

  // Delete Modal Functions
  const openDeleteModal = (type: 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'shippingZone', id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      let endpoint = '';
      let successMessage = '';
      
      switch (deleteModal.type) {
        case 'product':
          endpoint = API_ENDPOINTS.PRODUCT_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف المنتج بنجاح!';
          break;
        case 'category':
          endpoint = API_ENDPOINTS.CATEGORY_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف التصنيف بنجاح!';
          break;
        case 'order':
          endpoint = `orders/${deleteModal.id}`;
          successMessage = 'تم حذف الطلب بنجاح!';
          break;
        case 'customer':
          endpoint = `customers/${deleteModal.id}`;
          successMessage = 'تم حذف العميل بنجاح!';
          break;
        case 'coupon':
          endpoint = API_ENDPOINTS.COUPON_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف الكوبون بنجاح!';
          break;
        case 'shippingZone':
          endpoint = `shippingZones/${deleteModal.id}`;
          successMessage = 'تم حذف منطقة الشحن بنجاح!';
          break;
      }

      await apiCall(endpoint, { method: 'DELETE' });

      // Update local state
      switch (deleteModal.type) {
        case 'product':
          setProducts(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredProducts(prev => prev.filter(item => item.id !== deleteModal.id));
          break;
        case 'category':
          setCategories(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredCategories(prev => prev.filter(item => item.id !== deleteModal.id));
          // Update products that had this category
          const updatedProducts = products.map(product => 
            product.categoryId === deleteModal.id ? { ...product, categoryId: null } : product
          );
          setProducts(updatedProducts);
          setFilteredProducts(filteredProducts.map(product => 
            product.categoryId === deleteModal.id ? { ...product, categoryId: null } : product
          ));
          window.dispatchEvent(new Event('categoriesUpdated'));
          break;
        case 'order':
          setOrders(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredOrders(prev => prev.filter(item => item.id !== deleteModal.id));
          break;
        case 'customer':
          setCustomers(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredCustomers(prev => prev.filter(item => item.id !== deleteModal.id));
          break;
        case 'coupon':
          setCoupons(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredCoupons(prev => prev.filter(item => item.id !== deleteModal.id));
          break;
        case 'shippingZone':
          setShippingZones(prev => prev.filter(item => item.id !== deleteModal.id));
          setFilteredShippingZones(prev => prev.filter(item => item.id !== deleteModal.id));
          break;
      }

      toast.success(successMessage);
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('فشل في الحذف');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // وظائف نظام الشحن
  const fetchShippingZones = async () => {
    try {
      // محاولة تحميل البيانات من localStorage أولاً
      const savedZones = localStorage.getItem('shippingZones');
      if (savedZones) {
        const zones = JSON.parse(savedZones);
        if (Array.isArray(zones) && zones.length > 0) {
          setShippingZones(zones);
          setFilteredShippingZones(zones);
          return;
        }
      }

      // إذا لم توجد بيانات محفوظة، استخدم البيانات الافتراضية
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
      
      // حفظ البيانات الافتراضية في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(mockZones));
      setShippingZones(mockZones);
      setFilteredShippingZones(mockZones);
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      toast.error('فشل في جلب مناطق الشحن');
    }
  };

  const handleShippingZoneSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setShippingZoneSearchTerm(term);
    
    if (!term) {
      setFilteredShippingZones(shippingZones);
    } else {
      const filtered = shippingZones.filter(zone => 
        zone.name.toLowerCase().includes(term.toLowerCase()) ||
        zone.description.toLowerCase().includes(term.toLowerCase()) ||
        zone.cities.some(city => city.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredShippingZones(filtered);
    }
  };

  const handleAddShippingZone = async () => {
    try {
      const zoneData: Omit<ShippingZone, 'id' | 'createdAt'> = {
        name: newShippingZone.name || '',
        description: newShippingZone.name || '', // استخدام اسم المنطقة كوصف
        cities: [newShippingZone.name || ''], // استخدام اسم المنطقة كمدينة افتراضية
        shippingCost: newShippingZone.shippingCost || 0,
        freeShippingThreshold: 500, // قيمة افتراضية ثابتة
        estimatedDays: newShippingZone.estimatedDays || '2-3 أيام',
        isActive: true, // تفعيل افتراضي
        priority: shippingZones.length + 1 // أولوية تلقائية
      };

      // محاكاة إضافة المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const newZoneWithId: ShippingZone = {
        ...zoneData,
        id: Math.max(...shippingZones.map(z => z.id), 0) + 1,
        createdAt: new Date().toISOString()
      };

      const updatedZones = [...shippingZones, newZoneWithId];
      setShippingZones(updatedZones);
      setFilteredShippingZones([...filteredShippingZones, newZoneWithId]);
      
      // حفظ المناطق في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      // إشعار المكونات الأخرى بالتحديث
      window.dispatchEvent(new Event('shippingZonesUpdated'));
      
      // إشعار المكونات الأخرى بالتحديث
      window.dispatchEvent(new Event('shippingZonesUpdated'));
      
      setShowShippingZoneModal(false);
      setNewShippingZone({
        name: '',
        description: '',
        cities: [],
        shippingCost: 0,
        freeShippingThreshold: 0,
        estimatedDays: '2-3 أيام',
        isActive: true,
        priority: 1
      });
      toast.success('تم إضافة منطقة الشحن بنجاح');
    } catch (error) {
      console.error('Error adding shipping zone:', error);
      toast.error('فشل في إضافة منطقة الشحن');
    }
  };

  const handleUpdateShippingZone = async () => {
    if (!editingShippingZone) return;

    try {
      // محاكاة تحديث المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const updatedZones = shippingZones.map(z => z.id === editingShippingZone.id ? editingShippingZone : z);
      setShippingZones(updatedZones);
      setFilteredShippingZones(filteredShippingZones.map(z => z.id === editingShippingZone.id ? editingShippingZone : z));
      
      // حفظ المناطق في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      setShowShippingZoneModal(false);
      setEditingShippingZone(null);
      toast.success('تم تحديث منطقة الشحن بنجاح');
    } catch (error) {
      console.error('Error updating shipping zone:', error);
      toast.error('فشل في تحديث منطقة الشحن');
    }
  };

  const handleDeleteShippingZone = async (id: number) => {
    try {
      // محاكاة حذف المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const updatedZones = shippingZones.filter(z => z.id !== id);
      setShippingZones(updatedZones);
      setFilteredShippingZones(filteredShippingZones.filter(z => z.id !== id));
      
      // حفظ المناطق المحدثة في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      // إشعار المكونات الأخرى بالتحديث
      window.dispatchEvent(new Event('shippingZonesUpdated'));
      
      toast.success('تم حذف منطقة الشحن بنجاح');
    } catch (error) {
      console.error('Error deleting shipping zone:', error);
      toast.error('فشل في حذف منطقة الشحن');
    }
  };

  const handleUpdateShippingSettings = async () => {
    try {
      // محاكاة تحديث إعدادات الشحن (سيتم ربطها بالباك إند لاحقاً)
      const updatedSettings = {
        ...shippingSettings,
        updatedAt: new Date().toISOString()
      };
      
      setShippingSettings(updatedSettings);
      
      // حفظ الإعدادات في localStorage
      localStorage.setItem('shippingSettings', JSON.stringify(updatedSettings));
      
      setShowShippingSettingsModal(false);
      toast.success('تم تحديث إعدادات الشحن بنجاح');
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      toast.error('فشل في تحديث إعدادات الشحن');
    }
  };

  // إضافة useEffect لجلب بيانات الشحن
  useEffect(() => {
    if (currentTab === 'shipping') {
      fetchShippingZones();
    }
  }, [currentTab]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden" dir="rtl">
      <ToastContainer position="bottom-left" />
      
      {/* Desktop Sidebar - Black Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800 shadow-2xl">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <img src={logo} alt="Ghem Store" className="h-8 w-auto filter brightness-0 invert" />
          <div className="mr-3">
            <h1 className="text-white text-sm font-bold">لوحة التحكم</h1>
            <p className="text-gray-400 text-xs">إدارة المتجر</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Dashboard Overview */}
          <div className="mb-6">
            <button
              onClick={() => switchTab('overview')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentTab === 'overview' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 ml-3" />
              نظرة عامة
            </button>
          </div>

          {/* Products & Categories */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الكتالوج</h3>
            <div className="space-y-1">
              <button
                onClick={() => switchTab('products')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'products' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Package className="w-5 h-5 ml-3" />
                المنتجات
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {stats.totalProducts}
                </span>
              </button>
              
              <button
                onClick={() => switchTab('categories')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'categories' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5 ml-3" />
                التصنيفات
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {stats.totalCategories}
                </span>
              </button>
            </div>
          </div>

          {/* Orders & Customers */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">المبيعات والعملاء</h3>
            <div className="space-y-1">
              <button
                onClick={() => switchTab('orders')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'orders' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5 ml-3" />
                الطلبات
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {stats.pendingOrders}
                </span>
              </button>
              
              <button
                onClick={() => switchTab('customers')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'customers' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 ml-3" />
                العملاء
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {customers.length}
                </span>
              </button>
            </div>
          </div>

          {/* Coupons */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">العروض</h3>
            <div className="space-y-1">
              <button
                onClick={() => switchTab('coupons')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'coupons' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Tag className="w-5 h-5 ml-3" />
                الكوبونات
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {stats.activeCoupons}
                </span>
              </button>
            </div>
          </div>

          {/* Shipping */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الشحن والتوصيل</h3>
            <div className="space-y-1">
              <button
                onClick={() => switchTab('shipping')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'shipping' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Truck className="w-5 h-5 ml-3" />
                إدارة الشحن
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {shippingZones.length}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-800">
          <div className="space-y-2">
            <Link
              to="/admin/product/add"
              className="w-full flex items-center justify-center bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              منتج جديد
            </Link>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold ml-3">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-black shadow-2xl flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Ghem Store" className="h-8 w-auto filter brightness-0 invert" />
            <div className="mr-3">
              <h1 className="text-white text-sm font-bold">لوحة التحكم</h1>
              <p className="text-xs text-gray-400">إدارة المتجر</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div>
              <button
                onClick={() => {
                  switchTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'overview' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5 ml-3" />
                نظرة عامة
              </button>
            </div>

            {/* Products & Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">الكتالوج</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    switchTab('products');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'products' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5 ml-3" />
                  المنتجات
                </button>
                
                <button
                  onClick={() => {
                    switchTab('categories');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'categories' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5 ml-3" />
                  التصنيفات
                </button>
              </div>
            </div>

            {/* Orders & Customers */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">المبيعات والعملاء</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    switchTab('orders');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'orders' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 ml-3" />
                  الطلبات
                </button>
                
                <button
                  onClick={() => {
                    switchTab('customers');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'customers' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 ml-3" />
                  العملاء
                </button>
              </div>
            </div>

            {/* Coupons */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">العروض</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    switchTab('coupons');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'coupons' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Tag className="w-5 h-5 ml-3" />
                  الكوبونات
                </button>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">الشحن والتوصيل</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    switchTab('shipping');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'shipping' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Truck className="w-5 h-5 ml-3" />
                  إدارة الشحن
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">إجراءات سريعة</h3>
              <div className="space-y-2">
                <Link
                  to="/admin/product/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                >
                  <Plus className="w-5 h-5 ml-3" />
                  منتج جديد
                </Link>
                
                <Link
                  to="/admin/category/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                >
                  <Grid className="w-5 h-5 ml-3" />
                  تصنيف جديد
                </Link>
                
                <Link
                  to="/admin/coupon/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                >
                  <Tag className="w-5 h-5 ml-3" />
                  كوبون جديد
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold ml-3">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - White Theme */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currentTab === 'overview' && 'نظرة عامة'}
                    {currentTab === 'products' && 'إدارة المنتجات'}
                    {currentTab === 'categories' && 'إدارة التصنيفات'}
                    {currentTab === 'orders' && 'إدارة الطلبات'}
                    {currentTab === 'customers' && 'إدارة العملاء'}
                    {currentTab === 'coupons' && 'إدارة الكوبونات'}
                    {currentTab === 'shipping' && 'إدارة الشحن والتوصيل'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    آخر تحديث: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Stats Badges */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center text-green-700">
                      <Circle className="w-2 h-2 fill-current mr-2" />
                      <span className="text-xs font-medium">متصل</span>
                    </div>
                  </div>
                  
                  {currentTab === 'orders' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <div className="flex items-center text-blue-700">
                        <span className="text-xs font-medium">{stats.pendingOrders} طلب معلق</span>
                      </div>
                    </div>
                  )}
                  
                  {currentTab === 'products' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <div className="flex items-center text-orange-700">
                        <span className="text-xs font-medium">{stats.outOfStockProducts} نفد المخزون</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Products Tab */}
          {currentTab === 'products' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">المنتجات</h2>
                  <p className="text-gray-600">إدارة وتنظيم منتجات المتجر</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/admin/product/add"
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منتج جديد
                  </Link>
                  <button 
                    onClick={fetchProducts}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    تحديث
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
                      <div className="text-sm text-gray-500">نفد المخزون</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Circle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
                      <div className="text-sm text-gray-500">مخزون منخفض</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{stats.totalValue.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">قيمة المخزون (ر.س)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث عن منتج..."
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Products List - Mobile First Design */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة منتجات جديدة لمتجرك</p>
                  <Link
                    to="/admin/product/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول منتج
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {filteredProducts.map((product) => {
                      const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'غير محدد';
                      const stockStatus = product.stock <= 0 ? 'نفد المخزون' : product.stock <= 5 ? 'مخزون منخفض' : 'متوفر';
                      const stockColor = product.stock <= 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600';
                      const stockBg = product.stock <= 0 ? 'bg-red-50' : product.stock <= 5 ? 'bg-yellow-50' : 'bg-green-50';
                      
                      return (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.mainImage ? (
                                <img 
                                  src={buildImageUrl(product.mainImage)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                  {categoryName}
                                </span>
                                <span className={`${stockBg} ${stockColor} px-2 py-1 rounded-md text-xs font-medium`}>
                                  {stockStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-gray-500 text-sm">السعر</span>
                              <div className="font-bold text-lg text-black">{product.price.toFixed(2)} ر.س</div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">المخزون</span>
                              <div className="font-bold text-lg">{product.stock}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">النوع</span>
                              <div className="font-medium text-sm">{product.productType || 'عادي'}</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/admin/product/edit/${product.id}`}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => openDeleteModal('product', product.id, product.name)}
                              className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">المنتج</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">التصنيف</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">السعر</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">المخزون</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProducts.map((product) => {
                            const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'غير محدد';
                            const stockStatus = product.stock <= 0 ? 'نفد المخزون' : product.stock <= 5 ? 'مخزون منخفض' : 'متوفر';
                            const stockColor = product.stock <= 0 ? 'text-red-600 bg-red-50' : product.stock <= 5 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
                            
                            return (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 ml-4 flex-shrink-0">
                                      {product.mainImage ? (
                                        <img 
                                          src={buildImageUrl(product.mainImage)}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">{product.name}</div>
                                      <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {categoryName}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-black">{product.price.toFixed(2)} ر.س</div>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-sm text-gray-500 line-through">{product.originalPrice.toFixed(2)} ر.س</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      product.stock <= 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <span className="font-medium">{product.stock}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${stockColor}`}>
                                    {stockStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/admin/product/edit/${product.id}`}
                                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                      onClick={() => openDeleteModal('product', product.id, product.name)}
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {currentTab === 'customers' && (
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">العملاء</h2>
                  <p className="text-gray-500">إدارة ومتابعة بيانات العملاء المسجلين ونشاطهم</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                    <span className="text-gray-600 text-sm">إجمالي العملاء: </span>
                    <span className="font-bold text-blue-600">{customers.length}</span>
                  </div>
                  {customerStats && (
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                      <span className="text-gray-600 text-sm">النشطين: </span>
                      <span className="font-bold text-green-600">{customerStats.activeCustomers}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Stats Cards */}
              {customerStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">👥</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.totalCustomers}</div>
                        <div className="text-sm text-gray-500">عميل</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">إجمالي العملاء</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🛒</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.totalCartItems}</div>
                        <div className="text-sm text-gray-500">منتج</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">في العربات</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">❤️</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.totalWishlistItems}</div>
                        <div className="text-sm text-gray-500">منتج</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">في المفضلة</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.avgCartItems}</div>
                        <div className="text-sm text-gray-500">متوسط</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">منتجات/عربة</div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في العملاء..."
                    value={customerSearchTerm}
                    onChange={handleCustomerSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل بيانات العملاء...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <div className="text-red-500 mb-4">❌</div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={fetchCustomers}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* Customers Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCustomers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="text-gray-500">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">لا يوجد عملاء مسجلين</p>
                        <p className="text-gray-500 text-sm mb-6">سيظهر العملاء هنا عند التسجيل عبر النظام الجديد</p>
                        <button 
                          onClick={fetchCustomers}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تحديث البيانات
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredCustomers.map(customer => (
                      <div key={customer.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {customer.fullName?.[0] || customer.firstName?.[0] || customer.name?.[0] || '؟'}
                          </div>
                          <div className="mr-3 flex-1">
                            <h3 className="font-bold text-lg text-gray-800">
                              {customer.fullName || 
                               (customer.firstName && customer.lastName 
                                ? `${customer.firstName} ${customer.lastName}`
                                : customer.name || 'غير محدد'
                               )}
                            </h3>
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                              {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{customer.email}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{customer.phone || 'غير محدد'}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                            <span>
                              تاريخ التسجيل: {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Activity Stats */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">نشاط العميل</span>
                            <div className="flex space-x-2">
                              {customer.hasCart && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="لديه منتجات في العربة"></div>
                              )}
                              {customer.hasWishlist && (
                                <div className="w-2 h-2 bg-pink-500 rounded-full" title="لديه منتجات في المفضلة"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{customer.cartItemsCount || 0}</div>
                              <div className="text-xs text-gray-500">عربة التسوق</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-pink-600">{customer.wishlistItemsCount || 0}</div>
                              <div className="text-xs text-gray-500">المفضلة</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{customer.totalOrders || 0}</div>
                              <div className="text-xs text-gray-500">الطلبات</div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-500">آخر دخول:</span>
                            <span className="font-medium text-gray-700">
                              {customer.lastLogin 
                                ? new Date(customer.lastLogin).toLocaleDateString('ar-SA')
                                : 'لم يسجل دخول'
                              }
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                              عرض التفاصيل
                            </button>
                            <button
                              onClick={() => openDeleteModal('customer', customer.id, customer.fullName || customer.name || customer.email)}
                              className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">التصنيفات</h2>
                  <p className="text-gray-600">تنظيم وإدارة فئات المنتجات</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة تصنيف جديد
                  </Link>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في التصنيفات..."
                    value={categorySearchTerm}
                    onChange={handleCategorySearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories Grid */}
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تصنيفات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة تصنيفات لتنظيم منتجاتك</p>
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول تصنيف
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map(category => {
                    const categoryProductsCount = products.filter(p => p.categoryId === category.id).length;
                    
                    return (
                      <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 overflow-hidden">
                          {category.image ? (
                            <img 
                              src={buildImageUrl(category.image)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <Grid className="w-16 h-16 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                              {categoryProductsCount} منتج
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-6 line-clamp-2">{category.description}</p>
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/category/edit/${category.id}`}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => openDeleteModal('category', category.id, category.name)}
                              className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">الطلبات</h2>
                  <p className="text-gray-600">متابعة ومعالجة جميع طلبات العملاء</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'في الانتظار', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                  { label: 'مؤكد', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                  { label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-purple-50 border-purple-200 text-purple-800' },
                  { label: 'تم الشحن', count: orders.filter(o => o.status === 'shipped').length, color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
                  { label: 'تم التسليم', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-50 border-green-200 text-green-800' },
                  { label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-50 border-red-200 text-red-800' }
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} border rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold mb-1">{stat.count}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الطلبات..."
                      value={orderSearchTerm}
                      onChange={handleOrderSearch}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={handleOrderStatusFilter}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm bg-white"
                  >
                    <option value="all">جميع الطلبات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="preparing">قيد التحضير</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <div className="text-sm text-gray-600 flex items-center">
                    عرض {filteredOrders.length} من {orders.length} طلب
                  </div>
                </div>
              </div>

              {/* Orders List - Mobile First */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">طلب #{order.id}</h3>
                            <p className="text-gray-600 text-sm">{order.customerName}</p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-gray-600 text-sm">المبلغ الإجمالي</span>
                            <div className="font-bold text-lg text-black">{order.total.toFixed(2)} ر.س</div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">عدد المنتجات</span>
                            <div className="font-bold text-lg text-black">{order.items.length}</div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                          <button
                            onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                            className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">رقم الطلب</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">العميل</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">المبلغ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">التاريخ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-gray-900">#{order.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium text-gray-900">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-black">{order.total.toFixed(2)} ر.س</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className={`text-sm font-medium px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}
                                >
                                  <option value="pending">قيد المراجعة</option>
                                  <option value="confirmed">مؤكد</option>
                                  <option value="preparing">قيد التحضير</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="delivered">تم التسليم</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openOrderModal(order)}
                                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupons Tab */}
          {currentTab === 'coupons' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">الكوبونات</h2>
                  <p className="text-gray-600">إدارة كوبونات الخصم والعروض</p>
                </div>
                <Link
                  to="/admin/coupon/add"
                  className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة كوبون جديد
                </Link>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في الكوبونات..."
                    value={couponSearchTerm}
                    onChange={handleCouponSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Coupons Grid */}
              {filteredCoupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد كوبونات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة كوبونات خصم جديدة</p>
                  <Link
                    to="/admin/coupon/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول كوبون
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCoupons.map(coupon => (
                    <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">{coupon.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <div className="bg-black text-white font-bold text-xl px-4 py-3 rounded-lg text-center">
                            {coupon.code}
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <p className="text-gray-600 text-sm line-clamp-2">{coupon.description}</p>
                          
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">نوع الخصم:</span>
                              <span className="text-sm font-medium">
                                {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">قيمة الخصم:</span>
                              <span className="text-sm font-bold text-black">
                                {coupon.discountType === 'percentage' 
                                  ? `${coupon.discountValue}%` 
                                  : `${coupon.discountValue} ر.س`
                                }
                              </span>
                            </div>
                            {coupon.usageLimit && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">الاستخدام:</span>
                                <span className="text-sm">
                                  {coupon.usedCount || 0} / {coupon.usageLimit}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/coupon/edit/${coupon.id}`}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                          >
                            تعديل
                          </Link>
                          <button
                            onClick={() => openDeleteModal('coupon', coupon.id, coupon.name)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-black rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h2>
                    <p className="text-gray-300 mb-4">إليك نظرة شاملة على أداء متجرك اليوم</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleDateString('ar-SA')}
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${stats.outOfStockProducts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    <span className="mr-1">{stats.outOfStockProducts > 0 ? '⚠️' : '✅'}</span>
                    {stats.outOfStockProducts} نفد المخزون
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                      <div className="text-sm text-gray-500">إجمالي الطلبات</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {stats.pendingOrders} طلب معلق
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
                      <div className="text-sm text-gray-500">العملاء</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    عملاء نشطين
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">إجمالي الإيرادات (ر.س)</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600">
                    متوسط الطلب: {stats.averageOrderValue.toFixed(0)} ر.س
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        أحدث الطلبات
                      </h3>
                      <button 
                        onClick={() => switchTab('orders')}
                        className="text-black hover:text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">لا توجد طلبات بعد</p>
                        </div>
                      ) : (
                        orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                               onClick={() => {setSelectedOrder(order); setIsOrderModalOpen(true);}}>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                                #{order.id}
                              </div>
                              <div className="mr-4">
                                <p className="font-medium text-gray-900">{order.customerName}</p>
                                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{order.total.toFixed(2)} ر.س</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Package className="w-5 h-5 ml-2" />
                        المنتجات الأكثر مبيعاً
                      </h3>
                      <button 
                        onClick={() => switchTab('products')}
                        className="text-black hover:text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {products.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">لا توجد منتجات بعد</p>
                        </div>
                      ) : (
                        products.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                #{index + 1}
                              </div>
                              <div className="mr-4">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">المخزون: {product.stock}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{product.price.toFixed(2)} ر.س</p>
                              <p className="text-sm text-gray-500">{product.productType}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Quick Stats and Actions */}
                <div className="space-y-6">
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Link
                        to="/admin/product/add"
                        className="flex items-center justify-center bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة منتج
                      </Link>
                      <Link
                        to="/admin/category/add"
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Grid className="w-5 h-5 ml-2" />
                        إضافة تصنيف
                      </Link>
                      <button
                        onClick={() => switchTab('orders')}
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        إدارة الطلبات
                      </button>
                      <Link
                        to="/admin/coupon/add"
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Tag className="w-5 h-5 ml-2" />
                        إضافة كوبون
                      </Link>
                    </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">تنبيهات المخزون</h3>
                    <div className="space-y-3">
                      {stats.outOfStockProducts > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-red-800">نفد المخزون</p>
                              <p className="text-xs text-red-600">{stats.outOfStockProducts} منتج نفد من المخزون</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {stats.lowStockProducts > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <Circle className="w-5 h-5 text-yellow-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">مخزون منخفض</p>
                              <p className="text-xs text-yellow-600">{stats.lowStockProducts} منتج مخزونه منخفض</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {stats.outOfStockProducts === 0 && stats.lowStockProducts === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">المخزون جيد</p>
                              <p className="text-xs text-green-600">جميع المنتجات متوفرة</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Performance */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">أداء المتجر</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">معدل إتمام الطلبات</span>
                        <span className="font-bold text-green-600">
                          {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">قيمة المخزون الإجمالية</span>
                        <span className="font-bold text-blue-600">{stats.totalValue.toLocaleString('ar-SA')} ر.س</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">عدد التصنيفات</span>
                        <span className="font-bold text-purple-600">{stats.totalCategories}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الكوبونات النشطة</span>
                        <span className="font-bold text-orange-600">{stats.activeCoupons}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {currentTab === 'shipping' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">إدارة الشحن والتوصيل</h2>
                  <p className="text-gray-600">إدارة مناطق الشحن وإعدادات التوصيل</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowShippingSettingsModal(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    الإعدادات العامة
                  </button>
                  <button
                    onClick={() => setShowShippingZoneModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منطقة شحن
                  </button>
                </div>
              </div>

              {/* Shipping Settings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingSettings.globalFreeShippingThreshold}</div>
                      <div className="text-sm text-gray-500">حد الشحن المجاني (ر.س)</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${shippingSettings.enableFreeShipping ? 'text-green-600' : 'text-red-600'}`}>
                    {shippingSettings.enableFreeShipping ? 'مفعل' : 'معطل'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingZones.length}</div>
                      <div className="text-sm text-gray-500">مناطق الشحن</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {shippingZones.filter(z => z.isActive).length} منطقة نشطة
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingSettings.defaultShippingCost}</div>
                      <div className="text-sm text-gray-500">تكلفة الشحن الافتراضية (ر.س)</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${shippingSettings.enableExpressShipping ? 'text-green-600' : 'text-gray-600'}`}>
                    الشحن السريع: {shippingSettings.enableExpressShipping ? 'متاح' : 'غير متاح'}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في مناطق الشحن..."
                    value={shippingZoneSearchTerm}
                    onChange={handleShippingZoneSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Shipping Zones */}
              {filteredShippingZones.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مناطق شحن</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة مناطق شحن جديدة لتنظيم خدمة التوصيل</p>
                  <button
                    onClick={() => setShowShippingZoneModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول منطقة شحن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredShippingZones.map(zone => (
                    <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">{zone.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {zone.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">تكلفة الشحن:</span>
                              <span className="text-xl font-bold text-black">{zone.shippingCost} ر.س</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">مدة التوصيل:</span>
                              <span className="text-sm font-medium text-blue-600">{zone.estimatedDays}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingShippingZone(zone);
                              setShowShippingZoneModal(true);
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => openDeleteModal('shippingZone', zone.id, zone.name)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={closeOrderModal}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        title={`حذف ${
          deleteModal.type === 'product' ? 'المنتج' :
          deleteModal.type === 'category' ? 'التصنيف' :
          deleteModal.type === 'order' ? 'الطلب' :
          deleteModal.type === 'customer' ? 'العميل' :
          deleteModal.type === 'coupon' ? 'الكوبون' :
          'منطقة الشحن'
        }`}
        message={`هل أنت متأكد من حذف "${deleteModal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        loading={deleteModal.loading}
      />

      {/* Shipping Zone Modal */}
      {showShippingZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingShippingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowShippingZoneModal(false);
                    setEditingShippingZone(null);
                    setNewShippingZone({
                      name: '',
                      description: '',
                      cities: [],
                      shippingCost: 0,
                      freeShippingThreshold: 0,
                      estimatedDays: '2-3 أيام',
                      isActive: true,
                      priority: 1
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنطقة *</label>
                <input
                  type="text"
                  value={editingShippingZone?.name || newShippingZone.name || ''}
                  onChange={(e) => {
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, name: e.target.value});
                    } else {
                      setNewShippingZone({...newShippingZone, name: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="مثال: الرياض الكبرى"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن (ر.س) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingShippingZone?.shippingCost || newShippingZone.shippingCost || 0}
                  onChange={(e) => {
                    const cost = parseFloat(e.target.value) || 0;
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, shippingCost: cost});
                    } else {
                      setNewShippingZone({...newShippingZone, shippingCost: cost});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مدة التوصيل *</label>
                <input
                  type="text"
                  value={editingShippingZone?.estimatedDays || newShippingZone.estimatedDays || ''}
                  onChange={(e) => {
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, estimatedDays: e.target.value});
                    } else {
                      setNewShippingZone({...newShippingZone, estimatedDays: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="مثال: 2-3 أيام"
                  required
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowShippingZoneModal(false);
                  setEditingShippingZone(null);
                  setNewShippingZone({
                    name: '',
                    description: '',
                    cities: [],
                    shippingCost: 0,
                    freeShippingThreshold: 0,
                    estimatedDays: '2-3 أيام',
                    isActive: true,
                    priority: 1
                  });
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={editingShippingZone ? handleUpdateShippingZone : handleAddShippingZone}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                disabled={!(editingShippingZone?.name || newShippingZone.name) || 
                         !(editingShippingZone?.shippingCost || newShippingZone.shippingCost) ||
                         !(editingShippingZone?.estimatedDays || newShippingZone.estimatedDays)}
              >
                {editingShippingZone ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings Modal */}
      {showShippingSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">إعدادات الشحن العامة</h3>
                <button
                  onClick={() => setShowShippingSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للشحن المجاني (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.globalFreeShippingThreshold}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      globalFreeShippingThreshold: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن الافتراضية (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.defaultShippingCost}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      defaultShippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن السريع (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.expressShippingCost}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      expressShippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مدة الشحن السريع</label>
                  <input
                    type="text"
                    value={shippingSettings.expressShippingDays}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      expressShippingDays: e.target.value
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="مثال: 1-2 أيام"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">معدل ضريبة الشحن (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={shippingSettings.shippingTaxRate}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    shippingTaxRate: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableFreeShipping"
                    checked={shippingSettings.enableFreeShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableFreeShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableFreeShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن المجاني
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableZoneBasedShipping"
                    checked={shippingSettings.enableZoneBasedShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableZoneBasedShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableZoneBasedShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن حسب المنطقة
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableExpressShipping"
                    checked={shippingSettings.enableExpressShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableExpressShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableExpressShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن السريع
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowShippingSettingsModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateShippingSettings}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;