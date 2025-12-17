// ===============================
// Backend (Apps Script) – SINGLE SOURCE OF TRUTH
// ===============================

/**
 * تنها و تنها نقطه اتصال UI به بک‌اند
 * هر لاگین، هر ثبت‌نام، هر فاکتور از این URL رد می‌شود
 */
// src/constants.ts
export const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzI7CfAQpnu9FAxy-T42AB55wY5AFZUKu_7QxyH1qqdf9QIlptwVzOF0PxKO2F6UYU7rQ/exec";


// ===============================
// Payments
// ===============================

export const PAYMENT_CONFIG = {
  BLU_PAYMENT_LINK: 'https://app.blubank.com/s/nQNBRra',
  AMANI_DEPOSIT_PERCENT: 30, // درصد پیش‌پرداخت فروش امانی
};


// ===============================
// UI Seed Data (ONLY FOR FIRST LOAD / FALLBACK)
// ===============================

/**
 * ⚠️ فقط برای نمایش اولیه UI
 * منبع اصلی دیتا: Google Sheet از طریق Apps Script
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


// ===============================
// ❌ REMOVED: LOCAL ADMIN
// ===============================

/**
 * ❌ حذف شد
 * لاگین ادمین باید از بک‌اند بیاد، نه localStorage
 */
// export const INITIAL_ADMIN = { ... }
