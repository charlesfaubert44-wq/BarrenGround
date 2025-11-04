/**
 * Employee Dashboard - Shop Configuration
 *
 * This file contains shop-specific configuration for the employee dashboard.
 * Simplified version of customer-frontend config with dashboard-specific settings.
 */

export interface DashboardConfig {
  // Basic Information
  shopName: string;
  shopNameShort: string;
  tagline: string;
  established: string;

  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };

  // Dashboard Settings
  dashboard: {
    // Notification settings
    soundNotifications: boolean;
    notificationVolume: number; // 0-1
    notificationSound?: string; // URL or path to sound file

    // Display settings
    ordersPerPage: number;
    autoRefreshInterval: number; // Seconds (0 = disabled)
    showCustomerPhone: boolean;
    showCustomerEmail: boolean;

    // Order management
    enableQuickActions: boolean;
    requireConfirmation: boolean; // Confirm before status changes
    allowOrderCancellation: boolean;
  };

  // Business Settings
  business: {
    currency: string;
    currencySymbol: string;
    timezone: string;
  };

  // Feature Access (what dashboard features are available)
  features: {
    menuManagement: boolean;
    analytics: boolean;
    customerManagement: boolean;
    membershipManagement: boolean;
    inventoryTracking: boolean;
  };
}

/**
 * Default Dashboard Configuration
 */
const defaultDashboardConfig: DashboardConfig = {
  // Basic Information
  shopName: import.meta.env.VITE_SHOP_NAME || "Barren Ground Coffee",
  shopNameShort: import.meta.env.VITE_SHOP_NAME_SHORT || "Barren Ground",
  tagline: import.meta.env.VITE_SHOP_TAGLINE || "Northern roasted. Community powered.",
  established: import.meta.env.VITE_SHOP_ESTABLISHED || "2017",

  // Branding
  branding: {
    primaryColor: import.meta.env.VITE_BRAND_PRIMARY_COLOR || "#8B4513",
    secondaryColor: import.meta.env.VITE_BRAND_SECONDARY_COLOR || "#2C1810",
    accentColor: import.meta.env.VITE_BRAND_ACCENT_COLOR || "#D4A574",
    logoUrl: import.meta.env.VITE_BRAND_LOGO_URL,
  },

  // Dashboard Settings
  dashboard: {
    soundNotifications: import.meta.env.VITE_DASHBOARD_SOUND_NOTIFICATIONS !== "false",
    notificationVolume: parseFloat(import.meta.env.VITE_DASHBOARD_NOTIFICATION_VOLUME || "0.7"),
    notificationSound: import.meta.env.VITE_DASHBOARD_NOTIFICATION_SOUND,
    ordersPerPage: parseInt(import.meta.env.VITE_DASHBOARD_ORDERS_PER_PAGE || "20"),
    autoRefreshInterval: parseInt(import.meta.env.VITE_DASHBOARD_AUTO_REFRESH || "30"),
    showCustomerPhone: import.meta.env.VITE_DASHBOARD_SHOW_PHONE !== "false",
    showCustomerEmail: import.meta.env.VITE_DASHBOARD_SHOW_EMAIL !== "false",
    enableQuickActions: import.meta.env.VITE_DASHBOARD_QUICK_ACTIONS !== "false",
    requireConfirmation: import.meta.env.VITE_DASHBOARD_REQUIRE_CONFIRMATION !== "false",
    allowOrderCancellation: import.meta.env.VITE_DASHBOARD_ALLOW_CANCELLATION !== "false",
  },

  // Business Settings
  business: {
    currency: import.meta.env.VITE_CURRENCY || "CAD",
    currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || "$",
    timezone: import.meta.env.VITE_TIMEZONE || "America/Edmonton",
  },

  // Feature Access
  features: {
    menuManagement: import.meta.env.VITE_FEATURE_MENU_MANAGEMENT !== "false",
    analytics: import.meta.env.VITE_FEATURE_ANALYTICS !== "false",
    customerManagement: import.meta.env.VITE_FEATURE_CUSTOMER_MANAGEMENT !== "false",
    membershipManagement: import.meta.env.VITE_FEATURE_MEMBERSHIP_MANAGEMENT !== "false",
    inventoryTracking: import.meta.env.VITE_FEATURE_INVENTORY_TRACKING === "true",
  },
};

/**
 * Get the current dashboard configuration
 */
export const getDashboardConfig = (): DashboardConfig => {
  return defaultDashboardConfig;
};

// Export singleton instance
export const dashboardConfig = getDashboardConfig();
