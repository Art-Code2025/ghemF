import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import App from './App';
import ProductDetail from './components/ProductDetail';
import ProductsByCategory from './components/ProductsByCategory';
import ShoppingCart from './components/ShoppingCart';
import Wishlist from './components/Wishlist';
import Login from './Login';
import Dashboard from './Dashboard';
import ServiceForm from './ServiceForm';
import ProductForm from './components/ProductForm';
import CategoryAdd from './CategoryAdd';
import CategoryEdit from './CategoryEdit';
import CouponForm from './components/CouponForm';
import AllProducts from './components/AllProducts';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';
import About from './pages/About';
import Contact from './pages/Contact';
import Media from './pages/Media';
import Partners from './pages/Partners';
import CategoryPage from './components/CategoryPage';
import './index.css';

// تعريف Props لـ ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// مكون للتحكم في النافبار والـ padding
const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/admin'];

  // التحقق إذا المسار الحالي هو /login أو بيبدأ بـ /admin
  const shouldHideNavbar = hideNavbarPaths.some(path => 
    path === '/login' ? location.pathname === path : location.pathname.startsWith(path)
  );

  // إضافة responsive padding بس لو النافبار موجود
  // للصفحة الرئيسية، نخلي الصورة تبدأ من النافبار مباشرة
  const isHomePage = location.pathname === '/';
  const contentClass = shouldHideNavbar ? '' : isHomePage ? '' : 'pt-16 sm:pt-20 lg:pt-24';

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <div className={contentClass}>
        <Routes>
          {/* E-commerce Routes */}
          <Route path="/" element={<App />} />
          <Route path="/products" element={<AllProducts />} />
          {/* SEO-friendly product routes */}
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* SEO-friendly category routes */}
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/wishlist" element={<Wishlist />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Services Management Routes (Legacy) */}
          <Route path="/admin/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/admin/service/add" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
          <Route path="/admin/service/edit/:id" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
          
          {/* New E-commerce Management Routes */}
          <Route path="/admin/product/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/admin/product/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/admin/category/add" element={<ProtectedRoute><CategoryAdd /></ProtectedRoute>} />
          <Route path="/admin/category/edit/:id" element={<ProtectedRoute><CategoryEdit /></ProtectedRoute>} />
          <Route path="/admin/coupon/add" element={<ProtectedRoute><CouponForm /></ProtectedRoute>} />
          <Route path="/admin/coupon/edit/:id" element={<ProtectedRoute><CouponForm /></ProtectedRoute>} />
          
          {/* Other Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/media" element={<Media />} />
          <Route path="/partners" element={<Partners />} />
        </Routes>
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LayoutWrapper />
      {/* Global ToastContainer for all pages */}
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        style={{ 
          zIndex: 999999,
          top: '80px',
          fontSize: '16px'
        }}
        toastStyle={{
          minHeight: '60px',
          fontSize: '16px'
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);