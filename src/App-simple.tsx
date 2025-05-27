import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const AppSimple: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories...');
      const response = await fetch('http://localhost:3001/api/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Categories fetched:', data);
      
      setCategories(data);
      setError('');
      toast.success(`تم تحميل ${data.length} تصنيف بنجاح!`);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
      toast.error('فشل في تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchCategories}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-8" dir="rtl">
      <ToastContainer 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎉 الموقع يعمل بنجاح!</h1>
          <p className="text-xl text-gray-600 mb-8">تم تحميل البيانات بنجاح</p>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">إحصائيات النظام</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl">
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm">تصنيف</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl">
                <div className="text-3xl font-bold">✅</div>
                <div className="text-sm">Backend متصل</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-xl">
                <div className="text-3xl font-bold">🚀</div>
                <div className="text-sm">Frontend يعمل</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
                <img 
                  src={category.image.startsWith('http') ? category.image : `http://localhost:3001${category.image}`}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div class="text-6xl">${category.name.charAt(0)}</div>`;
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="mt-4 text-xs text-gray-500">ID: {category.id}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={fetchCategories}
            className="bg-pink-500 text-white px-8 py-4 rounded-xl hover:bg-pink-600 transition-colors text-lg font-semibold"
          >
            🔄 إعادة تحميل البيانات
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSimple; 