import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';

// Import components directly for debugging
import ImageSlider from './components/ImageSlider';
import ProductCard from './components/ProductCard';
import WhatsAppButton from './components/WhatsAppButton';
import cover1 from './assets/cover1.jpg';
import { createCategorySlug } from './utils/slugify';
import cover2 from './assets/cover2.jpg';
import cover3 from './assets/cover3.jpg';

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

interface CategoryProducts {
  category: Category;
  products: Product[];
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

const App: React.FC = () => {
  // تحميل البيانات فوراً من localStorage لتجنب الفلاش
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts[]>(() => {
    const saved = localStorage.getItem('cachedCategoryProducts');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const heroImages = [cover1, cover2, cover3];

  useEffect(() => {
    fetchCategoriesWithProducts();
    
    // Listen for categories updates
    const handleCategoriesUpdate = () => {
      fetchCategoriesWithProducts();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000); // Faster slide transition
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const fetchCategoriesWithProducts = async () => {
    try {
      // Use normal fetch instead of fastGet
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/categories'),
        fetch('http://localhost:3001/api/products')
      ]);
      
      const categoriesData = await categoriesResponse.json();
      const products = await productsResponse.json();
      
      setCategories(categoriesData);
      
      const categoryProductsData: CategoryProducts[] = categoriesData.map((category: Category) => ({
        category,
        products: products.filter((product: Product) => product.categoryId === category.id).slice(0, 4),
      })).filter((cp: CategoryProducts) => cp.products.length > 0);
      setCategoryProducts(categoryProductsData);
      
      // حفظ في localStorage لتجنب الفلاش في المرة القادمة
      localStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
      localStorage.setItem('cachedCategoryProducts', JSON.stringify(categoryProductsData));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  // No loading screen - instant display

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden" dir="rtl">

      
      {/* Premium Hero Slider */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] mb-12 sm:mb-16 lg:mb-20 overflow-hidden">
        <ImageSlider images={heroImages} currentIndex={currentSlide} />
        
        {/* Modern Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute right-4 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 bg-pink-500/80 backdrop-blur-xl border border-white/30 text-white p-2 sm:p-3 lg:p-4 rounded-full hover:bg-pink-600/90 shadow-2xl z-30 group transition-all duration-300"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute left-4 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 bg-pink-500/80 backdrop-blur-xl border border-white/30 text-white p-2 sm:p-3 lg:p-4 rounded-full hover:bg-pink-600/90 shadow-2xl z-30 group transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
      </section>
      
      {/* Premium Collection Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-rose-50/30 to-pink-100/40" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-pink-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-rose-300/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Header with Icons */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-500 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                مجموعاتنا المميزة
              </h2>
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-500 animate-pulse" />
            </div>
            <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400 rounded-full mb-6 sm:mb-8 mx-auto w-32 sm:w-48 lg:w-64 shadow-lg" />
            <p className="text-base sm:text-lg text-gray-700 font-medium max-w-4xl mx-auto leading-relaxed px-4">
              اكتشف تشكيلة متنوعة من المجموعات الحصرية المصممة خصيصاً لتناسب جميع أذواقكم الرفيعة
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              <span className="text-sm sm:text-base text-gray-700 font-semibold">{categories.length} مجموعة متاحة</span>
            </div>
          </div>
          
          {/* Dynamic Categories Grid */}
          {/* عرض Categories فوراً بدون شرط */}
          {categories.length > 0 && (
            <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
              categories.length === 1 ? 'grid-cols-1 max-w-sm sm:max-w-md mx-auto' :
              categories.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl sm:max-w-4xl mx-auto' :
              categories.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              categories.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              {categories.map((category, index) => (
                <div 
                  key={category.id} 
                  className="relative group"
                >
                  <Link to={`/category/${createCategorySlug(category.id, category.name)}`}>
                    <div className="relative bg-gradient-to-br from-white via-pink-50/50 to-white backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-pink-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-pink-300/80">
                      
                      <div className="relative">
                        {/* Category Image */}
                        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                          <img
                            src={category.image ? `http://localhost:3001${category.image}` : `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3`}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3`;
                            }}
                          />
                          
                          {/* Premium Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-pink-500/20 to-transparent" />
                          
                          {/* Category Number Badge */}
                          <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg animate-pulse">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Category Info */}
                        <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-white to-pink-50/30">
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                              {category.name}
                            </h3>
                            
                            <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full mb-3 sm:mb-4 mx-auto w-12 sm:w-16" />
                            
                            <p className="text-responsive-sm text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-2">
                              {category.description || 'اكتشف مجموعة متنوعة من المنتجات عالية الجودة'}
                            </p>
                            
                            {/* Luxury Button */}
                            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 shadow-lg backdrop-blur-xl border border-pink-400/30 inline-flex items-center gap-1 sm:gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base">
                              <span> استكشف مجموعاتنا </span>
                              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium Products Section */}
      <main className="relative container-responsive py-12 sm:py-16 lg:py-20">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-50/40 via-transparent to-rose-50/40" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-rose-200/20 rounded-full blur-3xl" />
        
        {/* عرض Products فوراً بدون شرط */}
        {categoryProducts.length > 0 && (
  <div className="relative space-y-20 sm:space-y-28 lg:space-y-40">
    {categoryProducts.map((categoryProduct, sectionIndex) => (
      <section key={categoryProduct.category.id} className="relative py-8 sm:py-10 lg:py-12">
        {/* Section Background */}
        <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-br from-white/70 via-pink-50/40 to-white/70 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-pink-100/50 shadow-lg" />
        
        <div className="relative z-10">
          <div className="mb-12 sm:mb-16 lg:mb-24 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent w-16 sm:w-24 lg:w-32" />
              <h2 className="text-responsive-3xl font-black bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm px-3 sm:px-4 lg:px-6 py-1 sm:py-2">
                {categoryProduct.category.name}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent w-16 sm:w-24 lg:w-32" />
            </div>
            
            <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400 rounded-full mb-6 sm:mb-8 lg:mb-10 mx-auto w-20 sm:w-24 lg:w-32 shadow-lg" />
            <p className="text-responsive-base text-gray-700 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-4">
              {categoryProduct.category.description || 'مجموعة مختارة من أفضل المنتجات المصنوعة بعناية فائقة'}
            </p>
            <Link 
              to={`/category/${createCategorySlug(categoryProduct.category.id, categoryProduct.category.name)}`} 
              className="inline-flex items-center text-gray-700 hover:text-pink-600 font-semibold bg-white/90 backdrop-blur-xl border border-pink-200/60 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-pink-50/80 hover:border-pink-300/80 gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <span>عرض جميع المنتجات</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          
          {/* Products Container */}
          <div className="relative py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 justify-items-center">
              {categoryProduct.products.map((product, idx) => (
                <div
                  key={product.id}
                  className="w-full max-w-sm"
                >
                  <ProductCard
                    product={product}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ))}
  </div>
)}
      </main>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-br from-white via-pink-50 to-rose-50 py-12 sm:py-16 lg:py-20 border-t border-pink-200/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-transparent to-rose-100/30" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-pink-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-rose-200/15 rounded-full blur-3xl" />
        
        <div className="relative container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
            <div className="text-center md:text-right">
              <h3 className="text-responsive-xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                GHEM.STORE
              </h3>
              <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400 rounded-full mb-3 sm:mb-4 w-20 sm:w-24 mx-auto md:mx-0 shadow-lg" />
              <p className="text-responsive-sm text-gray-700 font-medium leading-relaxed">
                متجرك المفضل لأفضل المنتجات بجودة عالية وتصميم فاخر
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-bold text-gray-800 mb-4 sm:mb-6 text-responsive-lg">روابط سريعة</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link to="/" className="text-responsive-sm text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl hover:bg-pink-50/80 hover:border-pink-300/70 inline-block transition-all duration-300 hover:scale-105">الرئيسية</Link></li>
                <li><Link to="/products" className="text-responsive-sm text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl hover:bg-pink-50/80 hover:border-pink-300/70 inline-block transition-all duration-300 hover:scale-105">المنتجات</Link></li>
                <li><Link to="/about" className="text-responsive-sm text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl hover:bg-pink-50/80 hover:border-pink-300/70 inline-block transition-all duration-300 hover:scale-105">من نحن</Link></li>
                <li><Link to="/contact" className="text-responsive-sm text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl hover:bg-pink-50/80 hover:border-pink-300/70 inline-block transition-all duration-300 hover:scale-105">اتصل بنا</Link></li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800 mb-4 sm:mb-6 text-responsive-lg">تواصل معنا</h4>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-responsive-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-pink-50/50 transition-all duration-300">📞 +966547493606</p>
                <p className="text-responsive-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-pink-50/50 transition-all duration-300">✉️ info@ghem.store</p>
                <p className="text-responsive-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-pink-200/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-pink-50/50 transition-all duration-300">📍 المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-pink-200/60 pt-6 sm:pt-8 text-center">
            <div className="bg-gradient-to-r from-white/80 via-pink-50/90 to-white/80 backdrop-blur-xl border border-pink-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm lg:max-w-md mx-auto shadow-lg">
              <p className="text-responsive-sm text-gray-700 font-medium">
                © 2025 GHEM.STORE. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default App;