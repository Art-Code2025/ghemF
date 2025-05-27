import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductCard from './ProductCard';
import WhatsAppButton from './WhatsAppButton';
import { extractIdFromSlug, isValidSlug } from '../utils/slugify';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const ProductsByCategory: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  // تحميل البيانات فوراً من localStorage لتجنب الفلاش
  const [products, setProducts] = useState<Product[]>(() => {
    const categoryId = slug ? extractIdFromSlug(slug).toString() : id;
    if (categoryId) {
      const saved = localStorage.getItem(`cachedCategoryProducts_${categoryId}`);
      try {
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [category, setCategory] = useState<Category | null>(() => {
    const categoryId = slug ? extractIdFromSlug(slug).toString() : id;
    if (categoryId) {
      const saved = localStorage.getItem(`cachedCategory_${categoryId}`);
      try {
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  // No loading state needed

  useEffect(() => {
    fetchCategory();
    fetchProductsByCategory();
  }, [id, slug]);

  const fetchCategory = async () => {
    // تحديد الـ ID من slug أو id
    let categoryId: string | undefined;
    
    if (slug) {
      // إذا كان slug موجود، استخرج الـ ID منه
      if (isValidSlug(slug)) {
        categoryId = extractIdFromSlug(slug).toString();
      } else {
        toast.error('رابط التصنيف غير صحيح');
        return;
      }
    } else if (id) {
      // إذا كان id موجود مباشرة
      categoryId = id;
    } else {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب التصنيف');
      }
      
      const data = await response.json();
      setCategory(data);
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem(`cachedCategory_${categoryId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('فشل في جلب التصنيف');
    }
  };

  const fetchProductsByCategory = async () => {
    // تحديد الـ ID من slug أو id
    let categoryId: string | undefined;
    
    if (slug) {
      // إذا كان slug موجود، استخرج الـ ID منه
      if (isValidSlug(slug)) {
        categoryId = extractIdFromSlug(slug).toString();
      } else {
        return;
      }
    } else if (id) {
      // إذا كان id موجود مباشرة
      categoryId = id;
    } else {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/products/category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب المنتجات');
      }
      
      const data = await response.json();
      setProducts(data);
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem(`cachedCategoryProducts_${categoryId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('فشل في جلب المنتجات');
    }
  };



  // No loading screen - instant display

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" dir="rtl">

      {category && (
        <div className="mb-6 sm:mb-8 text-center sm:text-right">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">{category.name}</h1>
          {category.description && (
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto sm:mx-0">{category.description}</p>
          )}
        </div>
      )}
      
      {products.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl sm:text-3xl">📦</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">لا توجد منتجات</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">لا توجد منتجات في هذا التصنيف حالياً.</p>
            <Link 
              to="/" 
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      )}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default ProductsByCategory; 