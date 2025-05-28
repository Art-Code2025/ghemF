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
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

// ... existing interfaces ...

const Dashboard: React.FC = () => {
  // ... existing state variables ...

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

  // CRUD operations using new API system
  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach(key => {
        if (key === 'dynamicOptions') {
          formData.append(key, JSON.stringify(newProduct[key]));
        } else if (key === 'specifications') {
          formData.append(key, JSON.stringify(newProduct[key]));
        } else {
          formData.append(key, newProduct[key]);
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
      Object.keys(editingProduct).forEach(key => {
        if (key === 'dynamicOptions') {
          formData.append(key, JSON.stringify(editingProduct[key]));
        } else if (key === 'specifications') {
          formData.append(key, JSON.stringify(editingProduct[key]));
        } else if (key !== 'id') {
          formData.append(key, editingProduct[key]);
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

  // Helper function to build API URLs
  const buildApiUrl = (endpoint: string): string => {
    return buildApiUrl(endpoint);
  };
} 