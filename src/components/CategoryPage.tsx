import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight, Package, Filter, Grid, List, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import WhatsAppButton from './WhatsAppButton';
import { extractIdFromSlug, isValidSlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS } from '../config/api';


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

const CategoryPage: React.FC = () => {
  const { categoryId, slug } = useParams<{ categoryId?: string; slug?: string }>();
  // تحميل البيانات فوراً من localStorage لتجنب الفلاش
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`cachedCategoryProducts_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState<Category | null>(() => {
    const saved = localStorage.getItem(`cachedCategory_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // No loading state needed
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // تحديد الـ ID من slug أو categoryId
    let catId: number | null = null;
    
    if (slug) {
      // إذا كان slug موجود، استخرج الـ ID منه
      if (isValidSlug(slug)) {
        catId = extractIdFromSlug(slug);
      } else {
        toast.error('رابط التصنيف غير صحيح');
        // No loading needed
        return;
      }
    } else if (categoryId) {
      // إذا كان categoryId موجود مباشرة
      catId = parseInt(categoryId);
    }
    
    if (catId) {
      fetchCategoryAndProducts(catId);
    }
  }, [categoryId, slug]);

  const fetchCategoryAndProducts = async (catId: number) => {
    try {
      // Use new API system
      const [categoryData, allProducts] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORY_BY_ID(catId)),
        apiCall(API_ENDPOINTS.PRODUCTS)
      ]);
      
      setCategory(categoryData);
      const categoryProducts = allProducts.filter((product: Product) => product.categoryId === catId);
      setProducts(categoryProducts);
      
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem(`cachedCategory_${catId}`, JSON.stringify(categoryData));
      localStorage.setItem(`cachedCategoryProducts_${catId}`, JSON.stringify(categoryProducts));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل بيانات التصنيف');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // No loading screen - instant display

  if (!category) {
    return (
      <div className="min-h-screen bg-f8f5f0 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gold-600 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">جاري التحميل...</h2>
          <p className="text-gray-600 text-sm">يتم تحميل بيانات التصنيف</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f8f5f0" dir="rtl">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <Link to="/" className="text-gold-600 hover:text-gold-700 transition-colors whitespace-nowrap">
              الرئيسية
            </Link>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 rotate-180 flex-shrink-0" />
            <span className="text-gray-600 truncate">{category.name}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {category.name}
            </h1>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-600 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-cream-50" />
            </div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {category.description}
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 text-sm sm:text-base"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price-low">السعر: من الأقل إلى الأعلى</option>
                <option value="price-high">السعر: من الأعلى إلى الأقل</option>
              </select>
            </div>

            {/* View Mode & Results Count */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-gray-600 text-sm sm:text-base">
                <span className="font-semibold text-gold-600">{products.length}</span> منتج
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-semibold text-sm sm:text-base hidden sm:inline">عرض:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-gold-100 text-gold-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-gold-100 text-gold-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center place-items-center w-full max-w-7xl mx-auto'
            : 'space-y-4 sm:space-y-6 max-w-7xl mx-auto'
          }>
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full max-w-sm mx-auto flex justify-center">
                <ProductCard
                  product={product}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">لا توجد منتجات في هذا التصنيف</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
              سيتم إضافة منتجات جديدة لهذا التصنيف قريباً
            </p>
            <Link
              to="/"
              className="inline-block bg-gold-600 text-cream-50 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gold-700 transition-all duration-300 font-semibold text-sm sm:text-base"
            >
              العودة للرئيسية
            </Link>
          </div>
        )}
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default CategoryPage;