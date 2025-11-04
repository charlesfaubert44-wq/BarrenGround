/**
 * Shop Configuration
 *
 * This file contains all shop-specific branding and business information.
 * Update these values when deploying for a new coffee shop client.
 *
 * All values can be overridden via environment variables for multi-environment deployment.
 */

export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hours?: {
    [key: string]: string; // e.g., "monday": "7:00 AM - 6:00 PM"
  };
}

export interface ShopConfig {
  // Basic Information
  shopName: string;
  shopNameShort: string; // For mobile/small screens
  tagline: string;
  description: string;
  established: string; // Year or full date

  // Contact Information
  primaryPhone: string;
  primaryEmail: string;
  supportEmail: string;

  // Social Media
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };

  // Locations
  locations: ShopLocation[];

  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
    faviconUrl?: string;
  };

  // Business Settings
  business: {
    currency: string;
    currencySymbol: string;
    taxRate: number; // e.g., 0.05 for 5%
    timezone: string; // e.g., "America/Edmonton"

    // Order settings
    orderSettings: {
      minOrderValue: number; // Minimum order amount
      maxOrderValue: number; // Maximum order amount
      defaultPrepTime: number; // Minutes
      allowScheduling: boolean;
      schedulingMaxDays: number; // How far in advance customers can order
      allowGuestCheckout: boolean;
    };
  };

  // Feature Flags
  features: {
    membership: boolean;
    delivery: boolean;
    rewards: boolean;
    giftCards: boolean;
    catering: boolean;
  };

  // SEO & Metadata
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
}

/**
 * Default Configuration - Barren Ground Coffee
 *
 * This serves as the default/example configuration.
 * Copy this structure and modify for new clients.
 */
const defaultConfig: ShopConfig = {
  // Basic Information
  shopName: import.meta.env.VITE_SHOP_NAME || "Barren Ground Coffee",
  shopNameShort: import.meta.env.VITE_SHOP_NAME_SHORT || "Barren Ground",
  tagline: import.meta.env.VITE_SHOP_TAGLINE || "Northern roasted. Community powered.",
  description: import.meta.env.VITE_SHOP_DESCRIPTION || "Northern roasted coffee from Yellowknife, NT",
  established: import.meta.env.VITE_SHOP_ESTABLISHED || "2017",

  // Contact Information
  primaryPhone: import.meta.env.VITE_SHOP_PHONE || "(867) 873-3030",
  primaryEmail: import.meta.env.VITE_SHOP_EMAIL || "hello@barrengroundcoffee.com",
  supportEmail: import.meta.env.VITE_SHOP_SUPPORT_EMAIL || "support@barrengroundcoffee.com",

  // Social Media
  social: {
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || "@barrengroundcoffee",
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || "barrengroundcoffee",
    twitter: import.meta.env.VITE_SOCIAL_TWITTER,
    tiktok: import.meta.env.VITE_SOCIAL_TIKTOK,
  },

  // Locations
  locations: [
    {
      id: "main-cafe",
      name: "Main Café",
      address: "5103 52 Street",
      city: "Yellowknife",
      province: "NT",
      postalCode: "X1A 1T7",
      phone: "(867) 873-3030",
      coordinates: {
        lat: 62.4540,
        lng: -114.3718,
      },
      hours: {
        monday: "7:00 AM - 6:00 PM",
        tuesday: "7:00 AM - 6:00 PM",
        wednesday: "7:00 AM - 6:00 PM",
        thursday: "7:00 AM - 6:00 PM",
        friday: "7:00 AM - 6:00 PM",
        saturday: "8:00 AM - 5:00 PM",
        sunday: "9:00 AM - 4:00 PM",
      },
    },
    {
      id: "birchwood",
      name: "Birchwood Coffee",
      address: "5021 49 Street",
      city: "Yellowknife",
      province: "NT",
      postalCode: "X1A 1P5",
      phone: "(867) 873-3030",
      coordinates: {
        lat: 62.4520,
        lng: -114.3750,
      },
    },
  ],

  // Branding
  branding: {
    primaryColor: import.meta.env.VITE_BRAND_PRIMARY_COLOR || "#8B4513", // Coffee brown
    secondaryColor: import.meta.env.VITE_BRAND_SECONDARY_COLOR || "#2C1810", // Dark brown
    accentColor: import.meta.env.VITE_BRAND_ACCENT_COLOR || "#D4A574", // Cream
    logoUrl: import.meta.env.VITE_BRAND_LOGO_URL,
    faviconUrl: import.meta.env.VITE_BRAND_FAVICON_URL,
  },

  // Business Settings
  business: {
    currency: import.meta.env.VITE_CURRENCY || "CAD",
    currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || "$",
    taxRate: parseFloat(import.meta.env.VITE_TAX_RATE || "0.05"),
    timezone: import.meta.env.VITE_TIMEZONE || "America/Edmonton",

    orderSettings: {
      minOrderValue: parseFloat(import.meta.env.VITE_MIN_ORDER_VALUE || "0"),
      maxOrderValue: parseFloat(import.meta.env.VITE_MAX_ORDER_VALUE || "500"),
      defaultPrepTime: parseInt(import.meta.env.VITE_DEFAULT_PREP_TIME || "15"),
      allowScheduling: import.meta.env.VITE_ALLOW_SCHEDULING !== "false",
      schedulingMaxDays: parseInt(import.meta.env.VITE_SCHEDULING_MAX_DAYS || "1"),
      allowGuestCheckout: import.meta.env.VITE_ALLOW_GUEST_CHECKOUT !== "false",
    },
  },

  // Feature Flags
  features: {
    membership: import.meta.env.VITE_FEATURE_MEMBERSHIP !== "false",
    delivery: import.meta.env.VITE_FEATURE_DELIVERY === "true",
    rewards: import.meta.env.VITE_FEATURE_REWARDS === "true",
    giftCards: import.meta.env.VITE_FEATURE_GIFTCARDS === "true",
    catering: import.meta.env.VITE_FEATURE_CATERING === "true",
  },

  // SEO & Metadata
  metadata: {
    title: import.meta.env.VITE_META_TITLE || "Barren Ground Coffee - Online Ordering",
    description: import.meta.env.VITE_META_DESCRIPTION || "Order fresh, northern roasted coffee from Barren Ground Coffee in Yellowknife, NT. Browse our menu and schedule pickup.",
    keywords: (import.meta.env.VITE_META_KEYWORDS || "coffee,espresso,yellowknife,barren ground,online ordering,coffee shop").split(","),
    ogImage: import.meta.env.VITE_META_OG_IMAGE,
  },
};

/**
 * Get the current shop configuration
 */
export const getShopConfig = (): ShopConfig => {
  return defaultConfig;
};

/**
 * Helper function to format address
 */
export const formatAddress = (location: ShopLocation): string => {
  return `${location.address}, ${location.city}, ${location.province} ${location.postalCode}`;
};

/**
 * Helper function to format phone number for links
 */
export const formatPhoneLink = (phone: string): string => {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
};

/**
 * Helper function to format social media links
 */
export const getSocialLink = (platform: keyof ShopConfig['social'], handle?: string): string | undefined => {
  if (!handle) return undefined;

  const cleanHandle = handle.replace("@", "");

  const baseUrls = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    twitter: "https://twitter.com/",
    tiktok: "https://tiktok.com/@",
  };

  return baseUrls[platform] + cleanHandle;
};

// Export singleton instance
export const shopConfig = getShopConfig();
