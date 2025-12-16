// ===============================
// Backend (Apps Script)
// ===============================

/**
 * تنها نقطه اتصال UI به بک‌اند
 * Web App URL خروجی از Google Apps Script
 */
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzI7CfAQpnu9FAxy-T42AB55wY5AFZUKu_7QxyH1qqdf9QIlptwVzOF0PxKO2F6UYU7rQ/exec';
// ↑ اینو همونی بذار که الان داری استفاده می‌کنی


// ===============================
// Payments
// ===============================

export const PAYMENT_CONFIG = {
  BLU_PAYMENT_LINK: 'https://app.blubank.com/s/nQNBRra',
  AMANI_DEPOSIT_PERCENT: 30, // درصد پیش‌پرداخت فروش امانی
};


// ===============================
// Initial Local Seed Data (UI only)
// ===============================

/**
 * فقط برای حالت لوکال / اولین اجرا
 * منبع اصلی دیتا بک‌اند است، نه این‌ها
 */
export const INITIAL_PRODUCTS = [
  {
    product_id: 'P-101',
    product_code: '1001',
    product_name: 'لپ‌تاپ ایسوس',
    unit_price_default: 45000000,
    vat_percent: 9,
    is_active: true,
  },
  {
    product_id: 'P-102',
    product_code: '1002',
    product_name: 'ماوس بی‌سیم',
    unit_price_default: 1200000,
    vat_percent: 9,
    is_active: true,
  },
  {
    product_id: 'P-103',
    product_code: '1003',
    product_name: 'مانیتور ال‌جی',
    unit_price_default: 8500000,
    vat_percent: 9,
    is_active: true,
  },
  {
    product_id: 'P-104',
    product_code: '1004',
    product_name: 'خدمات نصب نرم‌افزار',
    unit_price_default: 500000,
    vat_percent: 0,
    is_active: true,
  },
];


/**
 * فقط برای لاگین ادمین لوکال (در صورت نیاز)
 * منبع اصلی یوزرها: Sheet → Apps Script
 */
export const INITIAL_ADMIN = {
  seller_id: 'S-ADMIN',
  full_name: 'مدیر سیستم',
  mobile: '09120000000',
  email: 'admin@gantiro.com',
  role: 'admin',
  can_see_history: true,
  created_at: new Date().toISOString(),
  status: 'active',
};
