import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // تحسين حجم الملفات وتقسيمها
    chunkSizeWarningLimit: 1000,
    // تحسين الأداء
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // تقسيم المكتبات الكبيرة
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-toastify')) {
              return 'toast-vendor';
            }
            // باقي المكتبات
            return 'vendor';
          }
          
          // تقسيم مكونات التطبيق
          if (id.includes('ShoppingCart') || id.includes('cartOptimizer')) {
            return 'cart-components';
          }
          if (id.includes('ProductDetail') || id.includes('ProductsByCategory') || id.includes('ProductCard')) {
            return 'product-components';
          }
          if (id.includes('Checkout') || id.includes('ThankYou')) {
            return 'checkout-components';
          }
          if (id.includes('Admin') || id.includes('Form')) {
            return 'admin-components';
          }
        }
      }
    },
    // تحسين CSS
    cssCodeSplit: true,
    // ضغط أفضل
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
