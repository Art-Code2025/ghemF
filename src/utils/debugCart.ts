// Debug utility for cart issues
export const debugCartSystem = () => {
  console.log('🔍 [DEBUG] Starting cart system diagnosis...');
  
  // Check localStorage
  const cart = localStorage.getItem('cart');
  const user = localStorage.getItem('user');
  
  console.log('💾 [DEBUG] localStorage cart:', cart ? JSON.parse(cart) : 'Empty');
  console.log('👤 [DEBUG] localStorage user:', user ? JSON.parse(user) : 'No user');
  
  // Check if events work
  console.log('🎯 [DEBUG] Testing cart update event...');
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  // Return diagnostic data
  return {
    hasCart: !!cart,
    cartItemsCount: cart ? JSON.parse(cart).length : 0,
    hasUser: !!user,
    timestamp: new Date().toISOString()
  };
};

// Force clear everything for fresh start
export const resetCartSystem = () => {
  console.log('🧹 [DEBUG] Resetting entire cart system...');
  
  // Clear all cart-related localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('cart') || key.includes('Cart'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🗑️ [DEBUG] Removing localStorage key:', key);
    localStorage.removeItem(key);
  });
  
  // Fire update events
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  window.dispatchEvent(new CustomEvent('forceCartUpdate'));
  
  console.log('✅ [DEBUG] Cart system reset complete');
};

// Test add to cart functionality
export const testAddToCart = () => {
  console.log('🧪 [DEBUG] Testing basic add to cart...');
  
  const testItem = {
    id: Date.now(),
    productId: 999,
    quantity: 1,
    selectedOptions: {},
    optionsPricing: {},
    attachments: {},
    product: {
      id: 999,
      name: 'Test Product',
      price: 100,
      mainImage: '',
      stock: 999,
      productType: '',
      dynamicOptions: [],
      specifications: []
    }
  };
  
  const existingCart = localStorage.getItem('cart');
  let cartItems = [];
  
  if (existingCart) {
    try {
      cartItems = JSON.parse(existingCart);
    } catch (e) {
      cartItems = [];
    }
  }
  
  cartItems.push(testItem);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  console.log('✅ [DEBUG] Test item added to cart:', testItem);
  console.log('📊 [DEBUG] New cart state:', cartItems);
  
  // Fire events
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return cartItems;
};

// Check API connectivity
export const checkAPIConnection = async () => {
  console.log('🌐 [DEBUG] Testing API connection...');
  
  try {
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    console.log('✅ [DEBUG] API connection successful:', data);
    return { connected: true, data };
  } catch (error) {
    console.error('❌ [DEBUG] API connection failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { connected: false, error: errorMessage };
  }
};

// Complete diagnostic
export const runFullDiagnostic = async () => {
  console.log('🏥 [DEBUG] Running full cart diagnostic...');
  
  const results = {
    cartSystem: debugCartSystem(),
    apiConnection: await checkAPIConnection(),
    timestamp: new Date().toISOString()
  };
  
  console.log('📋 [DEBUG] Full diagnostic results:', results);
  return results;
}; 