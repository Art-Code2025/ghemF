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
  RefreshCw
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
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('خطأ في تحميل الفئات');
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('خطأ في تحميل العملاء');
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.ORDERS);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطأ في تحميل الطلبات');
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.COUPONS);
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('خطأ في تحميل الكوبونات');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMER_STATS);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('خطأ في تحميل الإحصائيات');
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
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">المنتجات</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">جاري التحميل...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      <tr key={product.id}>
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
                          <div className="text-sm text-gray-900">{product.price} ر.س</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 ml-4"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">الفئات</h2>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة فئة
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <img
                    src={buildImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 