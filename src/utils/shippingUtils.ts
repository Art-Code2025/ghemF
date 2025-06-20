// Shipping configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 500, // 500 SAR
  STANDARD_SHIPPING_COST: 50,   // 50 SAR
  CURRENCY: 'ر.س'
};

// Calculate shipping cost based on order total
export const calculateShippingCost = (orderTotal: number): number => {
  if (orderTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0; // Free shipping
  }
  return SHIPPING_CONFIG.STANDARD_SHIPPING_COST;
};

// Check if order qualifies for free shipping
export const isFreeShippingEligible = (orderTotal: number): boolean => {
  return orderTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD;
};

// Calculate how much more needed for free shipping
export const getAmountNeededForFreeShipping = (orderTotal: number): number => {
  if (isFreeShippingEligible(orderTotal)) {
    return 0;
  }
  return SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - orderTotal;
};

// Format shipping cost for display
export const formatShippingCost = (shippingCost: number): string => {
  if (shippingCost === 0) {
    return 'مجاني';
  }
  return `${shippingCost} ${SHIPPING_CONFIG.CURRENCY}`;
};

// Get shipping message for display
export const getShippingMessage = (orderTotal: number): string => {
  if (isFreeShippingEligible(orderTotal)) {
    return '🎉 تهانينا! الشحن مجاني';
  }
  
  const amountNeeded = getAmountNeededForFreeShipping(orderTotal);
  return `أضف ${amountNeeded} ${SHIPPING_CONFIG.CURRENCY} أخرى للحصول على شحن مجاني`;
};

// Calculate total order cost including shipping
export const calculateTotalWithShipping = (orderTotal: number): {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
} => {
  const shipping = calculateShippingCost(orderTotal);
  const total = orderTotal + shipping;
  const isFreeShipping = shipping === 0;

  return {
    subtotal: orderTotal,
    shipping,
    total,
    isFreeShipping
  };
}; 