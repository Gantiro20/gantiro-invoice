export type Role = 'admin' | 'seller';
export type Status = 'active' | 'inactive';
export type PaymentMode = 'instant' | 'credit'; // لحظه‌ای | امانی
export type PaymentMethod = 'link' | 'pos' | 'cash';
export type LinkChannel = 'whatsapp' | 'sms' | 'email' | null;
export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid';

export interface Seller {
  seller_id: string;
  full_name: string;
  mobile: string;
  email: string;
  role: Role;
  can_see_history: boolean;
  created_at: string;
  status: Status;
}

export interface Customer {
  customer_id: string;
  full_name: string;
  company_name?: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: string;
  product_code: string;
  product_name: string;
  unit_price_default: number;
  vat_percent: number;
  is_active: boolean;
}

export interface InvoiceItem {
  invoice_id: string;
  line_number: number;
  product_id: string;
  product_code: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_subtotal: number;
  vat_percent: number;
  vat_amount: number;
  line_total: number;
}

export interface Invoice {
  invoice_id: string;
  invoice_date_gregorian: string;
  invoice_date_jalali: string;
  seller_id: string;
  seller_name: string;
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  payment_mode: PaymentMode;
  payment_method: PaymentMethod;
  payment_channel_for_link: LinkChannel;
  is_vat_enabled: boolean;
  subtotal_amount: number; // Sum before VAT
  vat_amount_total: number; // Total VAT
  amount_total: number; // Final total
  amount_deposit_required: number;
  amount_paid: number;
  amount_remaining: number;
  payment_status: PaymentStatus;
  pdf_url?: string;
  created_at: string;
  total_items: number; // New field for total quantity of items
}