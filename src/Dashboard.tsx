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
  FileText, Image, Upload, Save, ArrowLeft, ArrowRight
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

  // Delete Modal States
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'product' as 'product' | 'category' | 'order' | 'customer' | 'coupon',
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

    if (term) {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(term.toLowerCase()) ||
        customer.email.toLowerCase().includes(term.toLowerCase()) ||
        customer.phone?.includes(term)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
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
  const openDeleteModal = (type: 'product' | 'category' | 'order' | 'customer' | 'coupon', id: number, name: string) => {
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
      }

      toast.success(successMessage);
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('فشل في الحذف');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 to-purple-50 font-sans" dir="rtl">
      <ToastContainer position="bottom-left" />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-pink-600 to-pink-700 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="p-4 border-b border-pink-500 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Ghem Store" className="h-8 w-auto object-contain" />
            <div className="mr-3">
              <p className="text-xs text-pink-200">لوحة التحكم</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white hover:text-pink-200 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {/* Quick Links */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">روابط سريعة</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('overview')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'overview' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">📊</span>
                  نظرة عامة
                </button>
                
                <Link
                  to="/admin/product/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200"
                >
                  <span className="ml-3 text-lg">➕</span>
                  منتج جديد
                </Link>
                
                <Link
                  to="/admin/category/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200"
                >
                  <span className="ml-3 text-lg">📂</span>
                  فئة جديدة
                </Link>
                
                <Link
                  to="/admin/coupon/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white transition-all duration-200"
                >
                  <span className="ml-3 text-lg">🎫</span>
                  كوبون جديد
                </Link>
              </div>
            </div>

            {/* Catalog */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">الكتالوج</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('products')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'products' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">📦</span>
                  المنتجات
                </button>
                
                <button
                  onClick={() => switchTab('categories')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'categories' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">📂</span>
                  الفئات
                </button>
              </div>
            </div>

            {/* Sales */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">المبيعات</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('orders')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'orders' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">🛒</span>
                  الطلبات
                </button>
              </div>
            </div>

            {/* Customer */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">العملاء</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('customers')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'customers' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">👥</span>
                  العملاء
                </button>
              </div>
            </div>

            {/* Promotion */}
            <div>
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">العروض</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('coupons')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'coupons' 
                      ? 'bg-white text-pink-700 shadow-lg' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white'
                  }`}
                >
                  <span className="ml-3 text-lg">🎫</span>
                  الكوبونات
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-pink-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 text-sm font-bold ml-3 shadow-lg">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-pink-200">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-pink-100 hover:bg-pink-500 rounded-xl transition-all duration-200"
          >
            <span className="ml-2">🚪</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-gradient-to-b from-pink-600 to-pink-700 shadow-2xl flex-col">
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-pink-500">
          <div className="flex items-center">
            <div>
              <img src={logo} alt="Ghem Store" className="h-8 lg:h-10 w-auto object-contain" />
              <p className="text-xs lg:text-sm text-pink-200">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 lg:p-4">
          <div className="space-y-2">
            {/* Quick Links */}
            <div className="mb-4 lg:mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-2 lg:mb-3">روابط سريعة</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('overview')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'overview' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">📊</span>
                  نظرة عامة
                </button>
                
                <Link
                  to="/admin/product/add"
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md transition-all duration-200"
                >
                  <span className="ml-3 text-lg">➕</span>
                  منتج جديد
                </Link>
                
                <Link
                  to="/admin/category/add"
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md transition-all duration-200"
                >
                  <span className="ml-3 text-lg">📂</span>
                  فئة جديدة
                </Link>
                
                <Link
                  to="/admin/coupon/add"
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md transition-all duration-200"
                >
                  <span className="ml-3 text-lg">🎫</span>
                  كوبون جديد
                </Link>
              </div>
            </div>

            {/* Catalog */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">الكتالوج</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('products')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'products' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">📦</span>
                  المنتجات
                </button>
                
                <button
                  onClick={() => switchTab('categories')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'categories' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">📂</span>
                  الفئات
                </button>
              </div>
            </div>

            {/* Sales */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">المبيعات</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('orders')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'orders' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">🛒</span>
                  الطلبات
                </button>
              </div>
            </div>

            {/* Customer */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">العملاء</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('customers')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'customers' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">👥</span>
                  العملاء
                </button>
              </div>
            </div>

            {/* Promotion */}
            <div>
              <h3 className="text-xs font-semibold text-pink-200 uppercase tracking-wide mb-3">العروض</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('coupons')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentTab === 'coupons' 
                      ? 'bg-white text-pink-700 shadow-lg transform scale-105' 
                      : 'text-pink-100 hover:bg-pink-500 hover:text-white hover:shadow-md'
                  }`}
                >
                  <span className="ml-3 text-lg">🎫</span>
                  الكوبونات
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-pink-500">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 text-sm font-bold ml-3 shadow-lg">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-pink-200">Administrator</p>
            </div>
          </div>
                      <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-pink-100 hover:bg-pink-500 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <span className="ml-2">🚪</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-xl border-b border-gray-100">
          {/* Main Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:space-x-6">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div>
                  <div className="flex items-center mb-2 lg:mb-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        مرحباً بك، <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Admin</span>
                      </h1>
                      <p className="text-gray-500 text-xs sm:text-sm">آخر دخول: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-pink-200">
                      <span className="mr-2">
                        {currentTab === 'overview' && '📊'}
                        {currentTab === 'products' && '📦'}
                        {currentTab === 'categories' && '📂'}
                        {currentTab === 'orders' && '🛒'}
                        {currentTab === 'customers' && '👥'}
                        {currentTab === 'coupons' && '🎫'}
                      </span>
                      <span className="hidden sm:inline">
                        {currentTab === 'overview' && 'نظرة عامة'}
                        {currentTab === 'products' && 'إدارة المنتجات'}
                        {currentTab === 'categories' && 'إدارة التصنيفات'}
                        {currentTab === 'orders' && 'إدارة الطلبات'}
                        {currentTab === 'customers' && 'إدارة العملاء'}
                        {currentTab === 'coupons' && 'إدارة الكوبونات'}
                      </span>
                      <span className="sm:hidden">
                        {currentTab === 'overview' && 'عامة'}
                        {currentTab === 'products' && 'منتجات'}
                        {currentTab === 'categories' && 'تصنيفات'}
                        {currentTab === 'orders' && 'طلبات'}
                        {currentTab === 'customers' && 'عملاء'}
                        {currentTab === 'coupons' && 'كوبونات'}
                      </span>
                    </div>
                    
                    {/* Live Stats */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2">
                        <div className="flex items-center text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1 sm:mr-2"></div>
                          <span className="text-xs font-medium">متصل</span>
                        </div>
                      </div>
                      
                      {currentTab === 'orders' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2">
                          <div className="flex items-center text-blue-700">
                            <span className="text-xs font-medium">{stats.pendingOrders} طلب</span>
                          </div>
                        </div>
                      )}
                      
                      {currentTab === 'products' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2">
                          <div className="flex items-center text-orange-700">
                            <span className="text-xs font-medium">{stats.outOfStockProducts} نفد</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Quick Actions */}
                <div className="hidden sm:flex items-center space-x-3">
                  <button className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors relative group">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="p-3">
                        <p className="text-xs text-gray-600 mb-2">إشعارات جديدة</p>
                        <div className="space-y-2">
                          <div className="text-xs bg-blue-50 p-2 rounded">طلب جديد #{orders[0]?.id}</div>
                          <div className="text-xs bg-orange-50 p-2 rounded">مخزون منخفض</div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="hidden sm:block h-6 sm:h-8 w-px bg-gray-300"></div>
                
                <Link 
                  to="/" 
                  className="flex items-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">عرض المتجر</span>
                  <span className="sm:hidden">المتجر</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Sub Header with Breadcrumb */}
          <div className="bg-gradient-to-r from-gray-50 to-pink-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <span className="text-gray-500">الرئيسية</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {currentTab === 'overview' && 'نظرة عامة'}
                  {currentTab === 'products' && 'المنتجات'}
                  {currentTab === 'categories' && 'التصنيفات'}
                  {currentTab === 'orders' && 'الطلبات'}
                  {currentTab === 'customers' && 'العملاء'}
                  {currentTab === 'coupons' && 'الكوبونات'}
                </span>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-500">
                آخر تحديث: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-pink-50 p-4 sm:p-6 lg:p-8">
          {/* Products Tab */}
          {currentTab === 'products' && (
            <div>
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">المنتجات</h2>
                  <p className="text-sm sm:text-base text-gray-500">إدارة وتنظيم منتجات المتجر</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <Link
                    to="/admin/product/add"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl shadow-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">إضافة منتج جديد</span>
                    <span className="sm:hidden">منتج جديد</span>
                  </Link>
                  <button className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md hover:shadow-lg transition-all duration-200">
                    تحديث
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    إظهار المرشح
                  </button>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث عن منتج..."
                      value={productSearchTerm}
                      onChange={handleProductSearch}
                      className="w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm shadow-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">السعر</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">المخزون</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الفئة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">المنتج</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="text-gray-500">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <p className="text-gray-900 font-medium text-lg">فشل جلب المنتجات</p>
                            <p className="text-gray-500 text-sm">حاول مرة أخرى لاحقاً</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-pink-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/admin/product/edit/${product.id}`}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="تعديل"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => openDeleteModal('product', product.id, product.name)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="حذف"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              product.stock > 5 ? 'bg-green-100 text-green-800' : 
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock > 5 ? 'متوفر' : product.stock > 0 ? 'مخزون منخفض' : 'نفد المخزون'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {product.originalPrice && product.originalPrice > product.price ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 line-through">
                                    {product.originalPrice.toFixed(2)} ر.س
                                  </span>
                                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-green-600">
                                  {product.price.toFixed(2)} ر.س
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold">
                                {product.price.toFixed(2)} ر.س
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {categories.find(cat => cat.id === product.categoryId)?.name || 'غير مصنف'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img 
                                  className="h-12 w-12 rounded-xl object-cover shadow-md" 
                                  src={buildImageUrl(product.mainImage)} 
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {currentTab === 'categories' && (
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">التصنيفات</h2>
                  <p className="text-gray-500">تنظيم وإدارة فئات المنتجات</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة تصنيف جديد
                  </Link>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في التصنيفات..."
                    value={categorySearchTerm}
                    onChange={handleCategorySearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="text-gray-500">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-bold text-xl mb-2">لا توجد تصنيفات متاحة</p>
                      <p className="text-gray-500 text-sm mb-6">ابدأ بإضافة تصنيفات لتنظيم منتجاتك</p>
                      <Link
                        to="/admin/category/add"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                      >
                        إضافة أول تصنيف
                      </Link>
                    </div>
                  </div>
                ) : (
                  filteredCategories.map(category => {
                    const categoryProductsCount = products.filter(p => p.categoryId === category.id).length;
                    
                    return (
                      <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="h-48 overflow-hidden">
                          {category.image ? (
                            <img 
                              src={buildImageUrl(category.image)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                              <span className="text-white text-5xl">📂</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                              {categoryProductsCount} منتج
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-6 line-clamp-2">{category.description}</p>
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/category/edit/${category.id}`}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-center transform hover:scale-105"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => openDeleteModal('category', category.id, category.name)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {currentTab === 'orders' && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h2>
                  <p className="text-gray-600">متابعة ومعالجة جميع طلبات العملاء</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-blue-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-white font-bold">📊</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm block">إجمالي الطلبات</span>
                        <span className="font-bold text-2xl text-blue-600">{orders.length}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={fetchOrders}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🔄 تحديث
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: 'في الانتظار', count: orders.filter(o => o.status === 'pending').length, color: 'from-yellow-400 to-orange-500', icon: '⏳', urgent: true },
                  { label: 'مؤكد', count: orders.filter(o => o.status === 'confirmed').length, color: 'from-blue-400 to-blue-600', icon: '✅' },
                  { label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: 'from-purple-400 to-purple-600', icon: '⚙️' },
                  { label: 'تم الشحن', count: orders.filter(o => o.status === 'shipped').length, color: 'from-indigo-400 to-indigo-600', icon: '🚚' },
                  { label: 'تم التسليم', count: orders.filter(o => o.status === 'delivered').length, color: 'from-green-400 to-green-600', icon: '✅' },
                  { label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: 'from-red-400 to-red-600', icon: '❌' }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${stat.urgent && stat.count > 0 ? 'animate-pulse ring-4 ring-red-200' : ''}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-3">{stat.icon}</div>
                      <div className="text-3xl font-bold mb-1">{stat.count}</div>
                      <div className="text-sm font-medium opacity-90">{stat.label}</div>
                      {stat.urgent && stat.count > 0 && (
                        <div className="text-xs mt-2 bg-white bg-opacity-20 rounded-full px-2 py-1">
                          🚨 يحتاج انتباه
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Search and Filter */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الطلبات (الاسم، الهاتف، رقم الطلب)..."
                      value={orderSearchTerm}
                      onChange={handleOrderSearch}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={handleOrderStatusFilter}
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white transition-all duration-200"
                  >
                    <option value="all">🔍 جميع الطلبات</option>
                    <option value="pending">⏳ قيد المراجعة</option>
                    <option value="confirmed">✅ مؤكد</option>
                    <option value="preparing">⚙️ قيد التحضير</option>
                    <option value="shipped">🚚 تم الشحن</option>
                    <option value="delivered">✅ تم التسليم</option>
                    <option value="cancelled">❌ ملغي</option>
                  </select>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">
                      عرض {filteredOrders.length} من {orders.length} طلب
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Orders Table */}
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600 font-medium">جاري تحميل الطلبات...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">🔧</span>
                              الإجراءات
                            </div>
                          </th>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">📊</span>
                              الحالة
                            </div>
                          </th>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">💰</span>
                              المبلغ الإجمالي
                            </div>
                          </th>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">🛍️</span>
                              المنتجات
                            </div>
                          </th>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">👤</span>
                              بيانات العميل
                            </div>
                          </th>
                          <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">📋</span>
                              رقم الطلب
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y-2 divide-gray-100">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                              <div className="text-gray-500">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
                                <p className="text-gray-500">لم يتم العثور على طلبات تطابق معايير البحث الحالية</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => {
                            const orderDate = new Date(order.createdAt);
                            const hoursAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                            const isPriority = order.status === 'pending' && hoursAgo > 12;
                            const isUrgent = order.status === 'pending' && hoursAgo > 24;
                            
                            return (
                              <tr 
                                key={order.id} 
                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
                                  isUrgent ? 'bg-red-50 border-l-4 border-red-500' : 
                                  isPriority ? 'bg-orange-50 border-l-4 border-orange-500' : 
                                  'border-l-4 border-transparent'
                                } ${isPriority ? 'animate-pulse' : ''}`}
                              >
                                {/* Actions Column */}
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => openOrderModal(order)}
                                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                                      title="عرض التفاصيل"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal('order', order.id, `طلب #${order.id} - ${order.customerName}`)}
                                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                                      title="حذف الطلب"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>

                                {/* Status Column */}
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <select
                                    value={order.status}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleOrderStatusUpdate(order.id, e.target.value);
                                    }}
                                    className={`text-sm font-bold px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-offset-2 hover:shadow-lg transform hover:scale-105 cursor-pointer ${getOrderStatusColor(order.status)}`}
                                  >
                                    <option value="pending">⏳ قيد المراجعة</option>
                                    <option value="confirmed">✅ مؤكد</option>
                                    <option value="preparing">⚙️ قيد التحضير</option>
                                    <option value="shipped">🚚 تم الشحن</option>
                                    <option value="delivered">🎉 تم التسليم</option>
                                    <option value="cancelled">❌ ملغي</option>
                                  </select>
                                  {isUrgent && (
                                    <div className="text-xs text-red-600 font-bold mt-1 bg-red-100 px-2 py-1 rounded-full animate-bounce">
                                      🚨 متأخر {Math.floor(hoursAgo)}ساعة
                                    </div>
                                  )}
                                </td>

                                {/* Total Amount Column */}
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                      {order.total.toFixed(2)} ر.س
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                      💳 {order.paymentMethod || 'الدفع عند الاستلام'}
                                    </div>
                                  </div>
                                </td>

                                {/* Products Column */}
                                <td className="px-6 py-6">
                                  <div className="space-y-2 max-w-xs">
                                    <div className="flex items-center text-sm font-semibold text-gray-800 mb-2">
                                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                        <span className="text-purple-600 text-xs font-bold">{order.items.length}</span>
                                      </div>
                                      {order.items.length === 1 ? 'منتج واحد' : `${order.items.length} منتجات`}
                                    </div>
                                    {order.items.slice(0, 2).map((item, index) => (
                                      <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-start space-x-2 mb-2">
                                          {item.productImage && (
                                            <img
                                              src={buildImageUrl(item.productImage)}
                                              alt={item.productName}
                                              className="w-10 h-10 rounded-lg object-cover border mr-2 flex-shrink-0"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{item.productName}</p>
                                            <p className="text-xs text-gray-500 mb-1">الكمية: {item.quantity} | السعر: {item.price} ر.س</p>
                                          </div>
                                        </div>
                                        
                                        {/* المواصفات المختارة */}
                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            <p className="text-xs font-semibold text-blue-600 mb-1">🎨 المواصفات:</p>
                                            <div className="space-y-1">
                                              {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                                                <div key={optionName} className="flex justify-between items-center text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                                  <span className="text-gray-600 font-medium">
                                                    {formatOptionName(optionName)}:
                                                  </span>
                                                  <span className="font-bold text-blue-700">
                                                    {value}
                                                    {item.optionsPricing?.[optionName] && item.optionsPricing[optionName] > 0 && (
                                                      <span className="text-green-600 text-xs mr-1">
                                                        (+{item.optionsPricing[optionName]} ر.س)
                                                      </span>
                                                    )}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* المرفقات */}
                                        {item.attachments && (item.attachments.text || (item.attachments.images && item.attachments.images.length > 0)) && (
                                          <div className="mt-2 space-y-1">
                                            <p className="text-xs font-semibold text-purple-600 mb-1">📎 المرفقات:</p>
                                            
                                            {item.attachments.text && (
                                              <div className="text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                                <span className="text-gray-600 font-medium">📝 ملاحظات:</span>
                                                <div className="text-purple-700 mt-1 text-xs">
                                                  {item.attachments.text.length > 50 
                                                    ? `${item.attachments.text.substring(0, 50)}...` 
                                                    : item.attachments.text
                                                  }
                                                </div>
                                              </div>
                                            )}
                                            
                                            {item.attachments.images && item.attachments.images.length > 0 && (
                                              <div className="text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                                <span className="text-gray-600 font-medium">🖼️ صور:</span>
                                                <span className="text-purple-700 font-bold mr-1">
                                                  {item.attachments.images.length} صورة مرفقة
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {order.items.length > 2 && (
                                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded text-center hover:bg-blue-100 transition-colors cursor-pointer">
                                        +{order.items.length - 2} منتج آخر
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Customer Column */}
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg mr-4">
                                      {order.customerName.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-gray-900 mb-1">{order.customerName}</div>
                                      <div className="text-sm text-gray-500 flex items-center mb-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {order.customerPhone}
                                      </div>
                                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        📧 {order.customerEmail}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Order ID Column */}
                                <td className="px-6 py-6 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg mr-4">
                                      <div className="text-center">
                                        <div className="text-xs font-medium opacity-80">طلب</div>
                                        <div className="text-lg font-bold">#{order.id}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-gray-900 mb-1">#{order.id}</div>
                                      <div className="text-xs text-gray-500">
                                        📅 {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        🕐 {new Date(order.createdAt).toLocaleTimeString('ar-SA', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coupons Tab */}
          {currentTab === 'coupons' && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">الكوبونات</h2>
                  <p className="text-sm text-gray-600">إدارة كوبونات الخصم والعروض</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/admin/coupon/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة كوبون جديد
                  </Link>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في الكوبونات..."
                    value={couponSearchTerm}
                    onChange={handleCouponSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Coupons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCoupons.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <p className="text-gray-900 font-medium">لا توجد كوبونات متاحة</p>
                      <p className="text-gray-500 text-sm mb-4">ابدأ بإضافة كوبونات خصم جديدة</p>
                      <Link
                        to="/admin/coupon/add"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-pink-600 hover:bg-pink-700"
                      >
                        إضافة أول كوبون
                      </Link>
                    </div>
                  </div>
                ) : (
                  filteredCoupons.map(coupon => (
                    <div key={coupon.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg">{coupon.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl px-4 py-3 rounded-lg text-center relative overflow-hidden">
                            <span className="relative z-10">{coupon.code}</span>
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
                              <span className="text-sm font-bold text-pink-600">
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
                            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors text-center"
                          >
                            تعديل
                          </Link>
                          <button
                            onClick={() => openDeleteModal('coupon', coupon.id, coupon.name)}
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
            </div>
          )}

          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div>
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h2>
                    <p className="text-pink-100 mb-4">إليك نظرة شاملة على أداء متجرك اليوم</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        📅 {new Date().toLocaleDateString('ar-SA')}
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        🕐 {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <div className="text-6xl">📊</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">💰</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{stats.totalRevenue.toLocaleString('ar-SA')} ر.س</div>
                      <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-green-500 text-sm font-medium flex items-center">
                      <span className="mr-1">📈</span>
                      +{((stats.totalRevenue / Math.max(stats.totalOrders, 1)) * 0.1).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">مقارنة بالشهر الماضي</div>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🛒</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{stats.totalOrders}</div>
                      <div className="text-sm text-gray-500">إجمالي الطلبات</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-blue-500 text-sm font-medium flex items-center">
                      <span className="mr-1">📊</span>
                      {stats.pendingOrders} معلق
                    </div>
                    <div className="text-xs text-gray-500">يحتاج متابعة</div>
                  </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">💎</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{stats.averageOrderValue.toFixed(0)} ر.س</div>
                      <div className="text-sm text-gray-500">متوسط قيمة الطلب</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-purple-500 text-sm font-medium flex items-center">
                      <span className="mr-1">💹</span>
                      +{(stats.averageOrderValue * 0.05).toFixed(0)} ر.س
                    </div>
                    <div className="text-xs text-gray-500">تحسن هذا الشهر</div>
                  </div>
                </div>

                {/* Inventory Status */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📦</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{stats.totalProducts}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium flex items-center ${stats.outOfStockProducts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      <span className="mr-1">{stats.outOfStockProducts > 0 ? '⚠️' : '✅'}</span>
                      {stats.outOfStockProducts} نفد المخزون
                    </div>
                    <div className="text-xs text-gray-500">{stats.lowStockProducts} مخزون منخفض</div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Charts and Analytics */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2">🛒</span>
                        أحدث الطلبات
                      </h3>
                      <button 
                        onClick={() => switchTab('orders')}
                        className="text-pink-600 hover:text-pink-700 text-sm font-medium bg-pink-50 px-3 py-1 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🛒</span>
                          </div>
                          <p className="text-gray-500">لا توجد طلبات بعد</p>
                        </div>
                      ) : (
                        orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                               onClick={() => {setSelectedOrder(order); setIsOrderModalOpen(true);}}>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2">🏆</span>
                        أفضل المنتجات
                      </h3>
                      <button 
                        onClick={() => switchTab('products')}
                        className="text-pink-600 hover:text-pink-700 text-sm font-medium bg-pink-50 px-3 py-1 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {products.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📦</span>
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
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">⚡</span>
                      إجراءات سريعة
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to="/admin/product/add"
                        className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        <span className="mr-2">➕</span>
                        إضافة منتج جديد
                      </Link>
                      <Link
                        to="/admin/category/add"
                        className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        <span className="mr-2">📂</span>
                        إضافة تصنيف جديد
                      </Link>
                      <button
                        onClick={() => switchTab('orders')}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        <span className="mr-2">🛒</span>
                        إدارة الطلبات
                      </button>
                    </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">⚠️</span>
                      تنبيهات المخزون
                    </h3>
                    <div className="space-y-3">
                      {stats.outOfStockProducts > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-red-500 mr-2">🚨</span>
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
                            <span className="text-yellow-500 mr-2">⚠️</span>
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
                            <span className="text-green-500 mr-2">✅</span>
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
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">📈</span>
                      أداء المتجر
                    </h3>
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
        </main>
      </div>
      
      {/* Order Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={closeOrderModal}
        onStatusUpdate={handleOrderStatusUpdate}
      />
      
      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={`حذف ${
          deleteModal.type === 'product' ? 'المنتج' :
          deleteModal.type === 'category' ? 'التصنيف' :
          deleteModal.type === 'order' ? 'الطلب' :
          deleteModal.type === 'customer' ? 'العميل' :
          deleteModal.type === 'coupon' ? 'الكوبون' : 'العنصر'
        }`}
        message={`هل أنت متأكد من حذف هذا ${
          deleteModal.type === 'product' ? 'المنتج' :
          deleteModal.type === 'category' ? 'التصنيف' :
          deleteModal.type === 'order' ? 'الطلب' :
          deleteModal.type === 'customer' ? 'العميل' :
          deleteModal.type === 'coupon' ? 'الكوبون' : 'العنصر'
        }؟`}
        itemName={deleteModal.name}
        type={deleteModal.type}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default Dashboard;