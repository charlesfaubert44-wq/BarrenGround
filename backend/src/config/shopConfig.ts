/**
 * Backend Shop Configuration
 *
 * This file contains shop-specific configuration for the backend API.
 * All values can be overridden via environment variables.
 */

export interface BackendShopConfig {
  // Shop Information
  shopName: string;
  shopNameShort: string;
  shopId: string; // Unique identifier for multi-tenant systems

  // Contact Information
  primaryEmail: string;
  supportEmail: string;
  primaryPhone: string;

  // Business Settings
  business: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    timezone: string;

    // Order configuration
    orderSettings: {
      minOrderValue: number;
      maxOrderValue: number;
      defaultPrepTime: number; // Minutes
      schedulingMaxDays: number;
      allowGuestCheckout: boolean;
    };

    // Payment settings
    paymentSettings: {
      provider: "stripe"; // Future: support other providers
      captureMethod: "automatic" | "manual";
      allowSavedPaymentMethods: boolean;
    };
  };

  // Email Configuration
  email: {
    fromName: string;
    fromEmail: string;
    replyToEmail: string;

    // Email templates customization
    templates: {
      orderConfirmation: boolean;
      orderReady: boolean;
      orderCancelled: boolean;
      welcomeEmail: boolean;
      passwordReset: boolean;
    };
  };

  // Feature Flags
  features: {
    membership: boolean;
    delivery: boolean;
    rewards: boolean;
    giftCards: boolean;
    catering: boolean;
    oauth: boolean; // Google/Facebook login
  };

  // Security Settings
  security: {
    jwtExpirationDays: number;
    refreshTokenExpirationDays: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    allowedOrigins: string[]; // CORS
  };

  // Database Settings
  database: {
    name: string;
    schema: string; // For multi-tenant
    connectionPoolSize: number;
  };
}

/**
 * Load configuration from environment variables
 */
const loadBackendConfig = (): BackendShopConfig => {
  return {
    // Shop Information
    shopName: process.env.SHOP_NAME || "Barren Ground Coffee",
    shopNameShort: process.env.SHOP_NAME_SHORT || "Barren Ground",
    shopId: process.env.SHOP_ID || "barrenground",

    // Contact Information
    primaryEmail: process.env.SHOP_EMAIL || "hello@barrengroundcoffee.com",
    supportEmail: process.env.SHOP_SUPPORT_EMAIL || "support@barrengroundcoffee.com",
    primaryPhone: process.env.SHOP_PHONE || "(867) 873-3030",

    // Business Settings
    business: {
      currency: process.env.CURRENCY || "CAD",
      currencySymbol: process.env.CURRENCY_SYMBOL || "$",
      taxRate: parseFloat(process.env.TAX_RATE || "0.05"),
      timezone: process.env.TIMEZONE || "America/Edmonton",

      orderSettings: {
        minOrderValue: parseFloat(process.env.MIN_ORDER_VALUE || "0"),
        maxOrderValue: parseFloat(process.env.MAX_ORDER_VALUE || "500"),
        defaultPrepTime: parseInt(process.env.DEFAULT_PREP_TIME || "15"),
        schedulingMaxDays: parseInt(process.env.SCHEDULING_MAX_DAYS || "1"),
        allowGuestCheckout: process.env.ALLOW_GUEST_CHECKOUT !== "false",
      },

      paymentSettings: {
        provider: "stripe",
        captureMethod: (process.env.PAYMENT_CAPTURE_METHOD as "automatic" | "manual") || "automatic",
        allowSavedPaymentMethods: process.env.ALLOW_SAVED_PAYMENT_METHODS !== "false",
      },
    },

    // Email Configuration
    email: {
      fromName: process.env.EMAIL_FROM_NAME || process.env.SHOP_NAME || "Barren Ground Coffee",
      fromEmail: process.env.EMAIL_FROM || "noreply@barrengroundcoffee.com",
      replyToEmail: process.env.EMAIL_REPLY_TO || process.env.SHOP_EMAIL || "hello@barrengroundcoffee.com",

      templates: {
        orderConfirmation: process.env.EMAIL_ORDER_CONFIRMATION !== "false",
        orderReady: process.env.EMAIL_ORDER_READY !== "false",
        orderCancelled: process.env.EMAIL_ORDER_CANCELLED !== "false",
        welcomeEmail: process.env.EMAIL_WELCOME === "true",
        passwordReset: process.env.EMAIL_PASSWORD_RESET !== "false",
      },
    },

    // Feature Flags
    features: {
      membership: process.env.FEATURE_MEMBERSHIP !== "false",
      delivery: process.env.FEATURE_DELIVERY === "true",
      rewards: process.env.FEATURE_REWARDS === "true",
      giftCards: process.env.FEATURE_GIFTCARDS === "true",
      catering: process.env.FEATURE_CATERING === "true",
      oauth: process.env.FEATURE_OAUTH !== "false",
    },

    // Security Settings
    security: {
      jwtExpirationDays: parseInt(process.env.JWT_EXPIRATION_DAYS || "7"),
      refreshTokenExpirationDays: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS || "30"),
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
      requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
        process.env.FRONTEND_URL || "http://localhost:8890",
        process.env.EMPLOYEE_DASHBOARD_URL || "http://localhost:8889",
      ],
    },

    // Database Settings
    database: {
      name: process.env.DB_NAME || process.env.SHOP_ID || "barrenground",
      schema: process.env.DB_SCHEMA || "public",
      connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || "20"),
    },
  };
};

/**
 * Validate required configuration
 */
const validateConfig = (config: BackendShopConfig): void => {
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Validate tax rate
  if (config.business.taxRate < 0 || config.business.taxRate > 1) {
    throw new Error("TAX_RATE must be between 0 and 1 (e.g., 0.05 for 5%)");
  }

  // Validate order values
  if (config.business.orderSettings.minOrderValue < 0) {
    throw new Error("MIN_ORDER_VALUE must be 0 or greater");
  }

  if (config.business.orderSettings.maxOrderValue <= config.business.orderSettings.minOrderValue) {
    throw new Error("MAX_ORDER_VALUE must be greater than MIN_ORDER_VALUE");
  }
};

// Load and validate configuration
export const shopConfig = loadBackendConfig();

// Validate on startup (except in test environment)
if (process.env.NODE_ENV !== "test") {
  try {
    validateConfig(shopConfig);
  } catch (error) {
    console.error("❌ Configuration Error:", (error as Error).message);
    // In serverless environments, throw instead of exit
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    process.exit(1);
  }
}

/**
 * Helper function to format currency values
 */
export const formatCurrency = (amount: number): string => {
  return `${shopConfig.business.currencySymbol}${amount.toFixed(2)}`;
};

/**
 * Helper function to calculate tax
 */
export const calculateTax = (amount: number): number => {
  return amount * shopConfig.business.taxRate;
};

/**
 * Helper function to calculate total with tax
 */
export const calculateTotalWithTax = (amount: number): number => {
  return amount + calculateTax(amount);
};
