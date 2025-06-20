// Shipping calculation utilities
export interface ShippingZone {
  id: number;
  name: string;
  cities: string[];
  shippingCost: number;
  freeShippingThreshold: number;
  estimatedDays: string;
  isActive: boolean;
  priority: number;
}

export interface ShippingSettings {
  globalFreeShippingThreshold: number;
  defaultShippingCost: number;
  enableFreeShipping: boolean;
  enableZoneBasedShipping: boolean;
  enableExpressShipping: boolean;
  expressShippingCost: number;
  expressShippingDays: string;
  shippingTaxRate: number;
}

// Default shipping settings
const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  globalFreeShippingThreshold: 500,
  defaultShippingCost: 50,
  enableFreeShipping: true,
  enableZoneBasedShipping: false,
  enableExpressShipping: true,
  expressShippingCost: 100,
  expressShippingDays: '1-2 أيام',
  shippingTaxRate: 0
};

// Get shipping settings from localStorage or use defaults
export const getShippingSettings = (): ShippingSettings => {
  try {
    const stored = localStorage.getItem('shippingSettings');
    if (stored) {
      return { ...DEFAULT_SHIPPING_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading shipping settings:', error);
  }
  return DEFAULT_SHIPPING_SETTINGS;
};

// Get shipping zones from localStorage or use defaults
export const getShippingZones = (): ShippingZone[] => {
  try {
    const stored = localStorage.getItem('shippingZones');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading shipping zones:', error);
  }
  return [];
};

// Find shipping zone by city
export const findShippingZoneByCity = (city: string, zones: ShippingZone[]): ShippingZone | null => {
  if (!city || !zones.length) return null;
  
  const normalizedCity = city.trim().toLowerCase();
  return zones.find(zone => 
    zone.isActive && zone.cities.some(zoneCity => 
      zoneCity.toLowerCase().includes(normalizedCity) || 
      normalizedCity.includes(zoneCity.toLowerCase())
    )
  ) || null;
};

// Calculate shipping cost based on city and amount
export const calculateShippingCost = (
  subtotal: number, 
  city?: string, 
  isExpress: boolean = false
): {
  shipping: number;
  isFreeShipping: boolean;
  zone?: ShippingZone;
  settings: ShippingSettings;
} => {
  const settings = getShippingSettings();
  const zones = getShippingZones();
  
  // Check for express shipping
  if (isExpress && settings.enableExpressShipping) {
    return {
      shipping: settings.expressShippingCost,
      isFreeShipping: false,
      settings
    };
  }
  
  // Check if zone-based shipping is enabled and city is provided
  if (settings.enableZoneBasedShipping && city) {
    const zone = findShippingZoneByCity(city, zones);
    
    if (zone) {
      // Check zone-specific free shipping threshold
      const isFreeShipping = settings.enableFreeShipping && subtotal >= zone.freeShippingThreshold;
      return {
        shipping: isFreeShipping ? 0 : zone.shippingCost,
        isFreeShipping,
        zone,
        settings
      };
    }
  }
  
  // Fall back to global settings
  const isFreeShipping = settings.enableFreeShipping && subtotal >= settings.globalFreeShippingThreshold;
  return {
    shipping: isFreeShipping ? 0 : settings.defaultShippingCost,
    isFreeShipping,
    settings
  };
};

// Calculate total with shipping (backward compatibility)
export const calculateTotalWithShipping = (subtotal: number, city?: string): {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
} => {
  const result = calculateShippingCost(subtotal, city);
  
  return {
    subtotal,
    shipping: result.shipping,
    total: subtotal + result.shipping,
    isFreeShipping: result.isFreeShipping
  };
};

// Check if order qualifies for free shipping
export const isFreeShippingEligible = (subtotal: number, city?: string): boolean => {
  const result = calculateShippingCost(subtotal, city);
  return result.isFreeShipping;
};

// Get amount needed for free shipping
export const getAmountNeededForFreeShipping = (subtotal: number, city?: string): number => {
  const settings = getShippingSettings();
  const zones = getShippingZones();
  
  if (!settings.enableFreeShipping) return 0;
  
  // Check zone-based threshold
  if (settings.enableZoneBasedShipping && city) {
    const zone = findShippingZoneByCity(city, zones);
    if (zone) {
      return Math.max(0, zone.freeShippingThreshold - subtotal);
    }
  }
  
  // Fall back to global threshold
  return Math.max(0, settings.globalFreeShippingThreshold - subtotal);
};

// Format shipping cost for display
export const formatShippingCost = (cost: number): string => {
  if (cost === 0) {
    return 'مجاني';
  }
  return `${cost.toFixed(2)} ر.س`;
};

// Get shipping message for display
export const getShippingMessage = (subtotal: number, city?: string): string => {
  const result = calculateShippingCost(subtotal, city);
  
  if (result.isFreeShipping) {
    return '🎉 تهانينا! حصلت على الشحن المجاني';
  }
  
  const amountNeeded = getAmountNeededForFreeShipping(subtotal, city);
  if (amountNeeded > 0) {
    return `أضف ${amountNeeded.toFixed(0)} ر.س أخرى للحصول على الشحن المجاني`;
  }
  
  return `تكلفة الشحن: ${formatShippingCost(result.shipping)}`;
};

// Get estimated delivery time
export const getEstimatedDelivery = (city?: string, isExpress: boolean = false): string => {
  const settings = getShippingSettings();
  
  if (isExpress && settings.enableExpressShipping) {
    return settings.expressShippingDays;
  }
  
  if (settings.enableZoneBasedShipping && city) {
    const zones = getShippingZones();
    const zone = findShippingZoneByCity(city, zones);
    if (zone) {
      return zone.estimatedDays;
    }
  }
  
  return '2-5 أيام عمل';
};

// Save shipping settings to localStorage
export const saveShippingSettings = (settings: ShippingSettings): void => {
  try {
    localStorage.setItem('shippingSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving shipping settings:', error);
  }
};

// Save shipping zones to localStorage
export const saveShippingZones = (zones: ShippingZone[]): void => {
  try {
    localStorage.setItem('shippingZones', JSON.stringify(zones));
  } catch (error) {
    console.error('Error saving shipping zones:', error);
  }
}; 