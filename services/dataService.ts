import { Seller, Customer, Invoice } from '../types';
import { BACKEND_URL } from "../constants";
/**
 * تنها راه ارتباط UI با بک‌اند
 */
async function callBackend<T>(payload: any): Promise<T> {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    mode: "cors",            // 🔴 خیلی مهم
    cache: "no-cache",
    credentials: "omit",     // 🔴 خیلی مهم
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Network error");
  }

  const data = await res.json();
  console.log("BACKEND RESPONSE:", data);

  if (!data.success) {
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}

/* ===============================
   SELLERS (AUTH)
================================ */

/**
 * لاگین فروشنده با شماره موبایل
 */
export async function loginSeller(mobile: string): Promise<Seller> {
  if (!mobile) throw new Error('شماره موبایل الزامی است');

  const data = await callBackend<{ user: Seller }>({
    action: 'login_user',
    mobile,
  });

  return data.user;
}

/**
 * ثبت‌نام فروشنده جدید
 */
export async function registerSeller(
  mobile: string,
  fullName: string,
  email: string
): Promise<Seller> {
  if (!mobile || !fullName || !email) {
    throw new Error('همه فیلدها الزامی هستند');
  }

  const data = await callBackend<{ user: Seller }>({
    action: 'register_user',
    mobile,
    full_name: fullName,
    email,
  });

  return data.user;
}

/* ===============================
   INVOICES
================================ */

/**
 * ساخت فاکتور
 */


/**
 * لیست فاکتورهای یک فروشنده
 */
export async function listInvoicesBySeller(
  sellerId: string
): Promise<Invoice[]> {
  if (!sellerId) throw new Error('seller_id الزامی است');

  const data = await callBackend<{ invoices: Invoice[] }>({
    action: 'list_invoices_by_seller',
    seller_id: sellerId,
  });

  return data.invoices;
}

export async function adminLogin(email: string, password: string) {
  // فعلاً فقط با موبایل یا ایمیل لاگین می‌کنیم
  return callBackend({
    action: 'login_user',
    mobile: email, // بعداً اصلاح می‌کنیم
  });
}

// گرفتن فاکتورهای یک فروشنده
export async function getInvoices(sellerId: string) {
  return callBackend({
    action: "list_invoices_by_seller",
    seller_id: sellerId,
  });
}

// گرفتن لیست فروشنده‌ها (فعلاً ساده / فیک)
export async function getSellers() {
  // چون بک‌اندت هنوز endpoint فروشنده‌ها نداره
  // فعلاً آرایه خالی برمی‌گردونیم که UI کرش نکنه
  return [];
}

// آپدیت دسترسی فروشنده (فعلاً mock)
export async function updateSellerPermission(
  sellerId: string,
  permission: string,
  value: boolean
) {
  // چون هنوز endpoint واقعی نداریم
  // فقط موفق برمی‌گردونیم تا UI کرش نکنه
  return {
    success: true,
    sellerId,
    permission,
    value,
  };
}

// VAT سراسری (فعلاً mock)
let _globalVatRate = 0.09; // ۹٪ پیش‌فرض - هرچی خواستی بعداً عوض کن

export async function getGlobalVatRate() {
  return _globalVatRate;
}

export async function updateGlobalVatRate(newRate: number) {
  _globalVatRate = Number(newRate) || 0;
  return { success: true, vatRate: _globalVatRate };
}

// محصولات (فعلاً mock)
export async function getProducts() {
  return [];
}

// پیدا کردن مشتری با موبایل (فعلاً mock)
export async function findCustomerByMobile(mobile: string) {
  return null;
}

// ساخت فاکتور (واقعی: وصل به Apps Script)
export async function createInvoice(payload: any) {
  // اگر UI همین payload رو درست می‌فرسته، این مستقیم می‌ره به بک‌اندت
  return callBackend({
    action: "create_invoice",
    ...payload,
  });
}
