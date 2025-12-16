import { Seller, Customer, Product, Invoice, InvoiceItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ADMIN, SHEET_IDS, GOOGLE_API_CONFIG } from '../constants';
import { generateId, generateInvoiceId, toJalaliDate } from '../utils';

// Global gapi declaration
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const STORAGE_KEYS = {
    SELLERS: 'gantiro_sellers',
    CUSTOMERS: 'gantiro_customers',
    PRODUCTS: 'gantiro_products',
    INVOICES: 'gantiro_invoices',
    INVOICE_ITEMS: 'gantiro_invoice_items',
    SETTINGS: 'gantiro_settings', // Added for global settings like VAT
};

// --- Initialization ---
const initData = () => {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
        // Seed with one admin
        localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify([INITIAL_ADMIN]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    }
    // Initialize Settings if not exist
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ vat_rate: 9 }));
    }
};

initData();

// --- Helpers ---
const getStorage = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Google API Logic ---

let gapiInited = false;
let gisInited = false;
let tokenClient: any;

export const initializeGoogleApi = async () => {
    if (gapiInited && gisInited) return;

    return new Promise<void>((resolve, reject) => {
        const checkScripts = setInterval(() => {
            if (window.gapi && window.google) {
                clearInterval(checkScripts);
                
                // Initialize gapi.client
                window.gapi.load('client', async () => {
                    try {
                        await window.gapi.client.init({
                            apiKey: GOOGLE_API_CONFIG.API_KEY,
                            discoveryDocs: GOOGLE_API_CONFIG.DISCOVERY_DOCS,
                        });
                        gapiInited = true;

                        // Initialize GIS (Identity Services)
                        tokenClient = window.google.accounts.oauth2.initTokenClient({
                            client_id: GOOGLE_API_CONFIG.CLIENT_ID,
                            scope: GOOGLE_API_CONFIG.SCOPES,
                            callback: '', // defined at request time
                        });
                        gisInited = true;
                        console.log('Google API Initialized');
                        resolve();
                    } catch (err) {
                        console.error('Error initializing GAPI', err);
                        reject(err);
                    }
                });
            }
        }, 100);
    });
};

export const handleGoogleAuth = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject("Google API not initialized. Refresh page.");
            return;
        }
        
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                reject(resp);
            }
            resolve();
        };

        if (window.gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    });
};

const appendRowToSheet = async (spreadsheetId: string, range: string, values: any[]) => {
    try {
        if (!window.gapi?.client?.sheets) {
            console.warn("GAPI Sheets not loaded, skipping cloud save.");
            return;
        }

        const response = await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values],
            },
        });
        console.log('Row appended', response);
        return response;
    } catch (error) {
        console.error('Error appending row to sheet:', error);
        throw error;
    }
};

// --- Settings (VAT) ---
export const getGlobalVatRate = (): number => {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settings) {
        return JSON.parse(settings).vat_rate || 9;
    }
    return 9;
};

export const updateGlobalVatRate = (rate: number) => {
    const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    settings.vat_rate = rate;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// --- Sellers ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI7CfAQpnu9FAxy-T42AB55wY5AFZUKu_7QxyH1qqdf9QIlptwVzOF0PxKO2F6UYU7rQ/exec';

export const loginOrRegisterSeller = async (
  mobile: string,
  fullName?: string,
  email?: string
): Promise<Seller> => {
  const action = fullName ? 'register_user' : 'login_user';

  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
  action,
  mobile,
  full_name: fullName,
  email: email ?? '',
}),
  });

  if (!res.ok) {
    throw new Error('خطا در ارتباط با سرور');
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'خطای لاگین');
  }

  return data.user as Seller;
};

export const getSellers = async (): Promise<Seller[]> => {
    return getStorage<Seller>(STORAGE_KEYS.SELLERS);
};

export const updateSellerPermission = async (sellerId: string, canSeeHistory: boolean) => {
    const sellers = getStorage<Seller>(STORAGE_KEYS.SELLERS);
    const updated = sellers.map(s => s.seller_id === sellerId ? { ...s, can_see_history: canSeeHistory } : s);
    setStorage(STORAGE_KEYS.SELLERS, updated);
};

// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
    return getStorage<Product>(STORAGE_KEYS.PRODUCTS);
};

// --- Customers ---
export const findCustomerByMobile = async (mobile: string): Promise<Customer | undefined> => {
    const customers = getStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.find(c => c.mobile === mobile);
};

export const saveCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
    const customers = getStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    let customer = customers.find(c => c.mobile === customerData.mobile);

    const now = new Date().toISOString();

    if (customer) {
        // Update existing (Local Only for now, updating rows in sheets is complex without row ID tracking)
        customer = { ...customer, ...customerData, updated_at: now };
        const index = customers.findIndex(c => c.customer_id === customer?.customer_id);
        customers[index] = customer;
    } else {
        // Create new
        customer = {
            customer_id: generateId('C'),
            full_name: customerData.full_name || '',
            company_name: customerData.company_name || '',
            mobile: customerData.mobile || '',
            whatsapp: customerData.whatsapp || '',
            email: customerData.email || '',
            created_at: now,
            updated_at: now,
        };
        customers.push(customer);
        
        // Save to Sheet
        try {
            await appendRowToSheet(SHEET_IDS.CUSTOMERS, 'Sheet1!A:H', [
                customer.customer_id,
                customer.full_name,
                customer.company_name,
                customer.mobile,
                customer.whatsapp,
                customer.email,
                customer.created_at,
                customer.updated_at
            ]);
        } catch (e) {
            console.warn('Could not save customer to sheet', e);
        }
    }
    
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return customer;
};

// --- Invoices ---
export const createInvoice = async (
    seller: Seller,
    customerData: Partial<Customer>,
    items: Omit<InvoiceItem, 'invoice_id' | 'line_number' | 'line_total' | 'line_subtotal' | 'vat_amount'>[],
    invoiceMeta: {
        payment_mode: Invoice['payment_mode'];
        payment_method: Invoice['payment_method'];
        payment_channel_for_link: Invoice['payment_channel_for_link'];
        is_vat_enabled: boolean;
        amount_paid: number;
    }
): Promise<Invoice> => {
    
    // Check Auth First if we want to write to sheets
    if (!window.gapi?.client?.sheets) {
         try {
             await initializeGoogleApi();
             await handleGoogleAuth();
         } catch (e) {
             const proceed = window.confirm('اتصال به گوگل برقرار نشد. فاکتور فقط در حافظه مرورگر ذخیره شود؟ (برای ذخیره در شیت باید لاگین کنید)');
             if (!proceed) throw new Error('Google Auth Failed');
         }
    }

    // 1. Ensure Customer Exists
    const customer = await saveCustomer(customerData);

    // 2. Prepare Invoice Data
    const invoices = getStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const sequence = invoices.length + 1;
    const invoiceId = generateInvoiceId(sequence);
    const now = new Date();

    // 3. Process Items
    let subtotal = 0;
    let totalVat = 0;
    let totalItemsCount = 0;

    const invoiceItems: InvoiceItem[] = items.map((item, index) => {
        const lineSubtotal = item.unit_price * item.quantity;
        const vatAmount = invoiceMeta.is_vat_enabled ? (lineSubtotal * item.vat_percent / 100) : 0;
        const lineTotal = lineSubtotal + vatAmount;

        subtotal += lineSubtotal;
        totalVat += vatAmount;
        totalItemsCount += item.quantity;

        return {
            ...item,
            invoice_id: invoiceId,
            line_number: index + 1,
            line_subtotal: lineSubtotal,
            vat_amount: vatAmount,
            line_total: lineTotal
        };
    });

    const totalAmount = subtotal + totalVat;
    
    // Deposit Calculation
    let depositRequired = totalAmount; 
    if (invoiceMeta.payment_mode === 'credit') {
        depositRequired = totalAmount * 0.30;
    }

    let paymentStatus: Invoice['payment_status'] = 'Pending';
    if (invoiceMeta.amount_paid >= totalAmount) {
        paymentStatus = 'Paid';
    } else if (invoiceMeta.amount_paid > 0) {
        paymentStatus = 'Partially Paid';
    }

    // 4. Create Invoice Object
    const newInvoice: Invoice = {
        invoice_id: invoiceId,
        invoice_date_gregorian: now.toISOString(),
        invoice_date_jalali: toJalaliDate(now),
        seller_id: seller.seller_id,
        seller_name: seller.full_name,
        customer_id: customer.customer_id,
        customer_name: customer.full_name,
        customer_mobile: customer.mobile,
        payment_mode: invoiceMeta.payment_mode,
        payment_method: invoiceMeta.payment_method,
        payment_channel_for_link: invoiceMeta.payment_channel_for_link,
        is_vat_enabled: invoiceMeta.is_vat_enabled,
        subtotal_amount: subtotal,
        vat_amount_total: totalVat,
        amount_total: totalAmount,
        amount_deposit_required: depositRequired,
        amount_paid: invoiceMeta.amount_paid,
        amount_remaining: totalAmount - invoiceMeta.amount_paid,
        payment_status: paymentStatus,
        pdf_url: '',
        created_at: now.toISOString(),
        total_items: totalItemsCount
    };

    // 5. Save to Local Storage
    invoices.push(newInvoice);
    setStorage(STORAGE_KEYS.INVOICES, invoices);

    const allItems = getStorage<InvoiceItem>(STORAGE_KEYS.INVOICE_ITEMS);
    allItems.push(...invoiceItems);
    setStorage(STORAGE_KEYS.INVOICE_ITEMS, allItems);

    // 6. Save to Google Sheets (Real)
    try {
        // Save Invoice Header
        // Added total_items at the end
        const invoiceRow = [
            newInvoice.invoice_id,
            newInvoice.invoice_date_gregorian,
            newInvoice.invoice_date_jalali,
            newInvoice.seller_id,
            newInvoice.seller_name,
            newInvoice.customer_id,
            newInvoice.customer_name,
            newInvoice.customer_mobile,
            newInvoice.payment_mode,
            newInvoice.payment_method,
            newInvoice.payment_channel_for_link || '',
            newInvoice.is_vat_enabled,
            newInvoice.subtotal_amount,
            newInvoice.vat_amount_total,
            newInvoice.amount_total,
            newInvoice.amount_deposit_required,
            newInvoice.amount_paid,
            newInvoice.amount_remaining,
            newInvoice.payment_status,
            newInvoice.pdf_url,
            newInvoice.created_at,
            seller.seller_id,
            newInvoice.total_items
        ];

        await appendRowToSheet(SHEET_IDS.INVOICES, 'Sheet1!A:W', invoiceRow);

        // Save Invoice Items
        for (const item of invoiceItems) {
            const itemRow = [
                item.invoice_id,
                item.line_number,
                item.product_id,
                item.product_code,
                item.product_name,
                item.unit_price,
                item.quantity,
                item.line_subtotal,
                item.vat_percent,
                item.vat_amount,
                item.line_total
            ];
            await appendRowToSheet(SHEET_IDS.INVOICE_ITEMS, 'Sheet1!A:K', itemRow);
        }

        console.log("Successfully saved to Google Sheets");

    } catch (e) {
        console.error("Failed to save to Google Sheets", e);
        // Don't fail the UI, just warn
        alert("فاکتور ذخیره شد اما اتصال به گوگل شیت برقرار نبود. داده‌ها فقط در حافظه مرورگر هستند.");
    }

    return newInvoice;
};

export const getInvoices = async (seller?: Seller): Promise<Invoice[]> => {
    const invoices = getStorage<Invoice>(STORAGE_KEYS.INVOICES);
    if (!seller || seller.role === 'admin') {
        return invoices.reverse(); 
    }
    return invoices.filter(inv => inv.seller_id === seller.seller_id).reverse();
};


export const adminLogin = async (email: string, password: string): Promise<Seller> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const sellers = getStorage<Seller>(STORAGE_KEYS.SELLERS);
    
    // Find admin user in local storage
    const admin = sellers.find(s => s.email === email && s.role === 'admin');

    if (!admin) {
        throw new Error('کاربری با این ایمیل و دسترسی ادمین یافت نشد.');
    }

    // Hardcoded password check for demo/MVP
    // Since we don't have a backend or stored password hashes, we use a default.
    if (password !== '123456') {
        throw new Error('رمز عبور اشتباه است.');
    }

    return admin;
};
