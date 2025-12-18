import { Seller, Customer, Invoice } from '../types';
import { BACKEND_URL } from "../constants";
/**
 * تنها راه ارتباط UI با بک‌اند
 */
async function callBackend<T>(payload: any): Promise<T> {
  const res = await fetch(BACKEND_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

  if (!res.ok) {
    throw new Error("خطا در ارتباط با سرور");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "خطای بک‌اند");
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
export async function createInvoice(payload: {
  seller_id: string;
  invoice_date: string;
  payment_method?: string;
  payment_status?: string;
  customer: Partial<Customer>;
  items: any[];
  tax_amount?: number;
  total_amount?: number;
}): Promise<{ invoice_id: string; invoice_number: string }> {
  const data = await callBackend<{
    invoice: { invoice_id: string; invoice_number: string };
  }>({
    action: 'create_invoice',
    ...payload,
  });

  return data.invoice;
}

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
