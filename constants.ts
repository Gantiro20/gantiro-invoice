export const SHEET_IDS = {
    SELLERS: '1ZGlR5MRuqBvhCT1CjqDSw2Lfo_3jhYl4sxjoFcvDgdU',
    CUSTOMERS: '1dEAXeiHz1L77tY9L1vc72uOcMZsvaJhu2AGhHNYH6lo',
    PRODUCTS: '1opqcGS_Oiu6q1MEX0SFUeLDhe0mA62g_7GEMGNev_bQ',
    INVOICES: '1_H_9l7gWyMU4-wurMLeOJL2EHx1qxpN6ERL_5wn41kA',
    INVOICE_ITEMS: '1vUToLyJVsuGI3ObMf0g9hbq7f9gChdRaXcqCJAz08zw',
};

export const DRIVE_FOLDERS = {
    PDF_INVOICES: '1kw3RVie9DdHvqruk-JIhBwUXhhJ6jb0y',
};

// *** IMPORTANT: You must replace these with your actual Google Cloud Console Credentials ***
export const GOOGLE_API_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    API_KEY: 'YOUR_API_KEY_HERE',
    // Scopes needed: Sheets (Read/Write), Drive (File Create)
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    DISCOVERY_DOCS: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ]
};

export const PAYMENT_CONFIG = {
  BLU_PAYMENT_LINK: 'https://app.blubank.com/s/nQNBRra',
  AMANI_DEPOSIT_PERCENT: 30, // حداقل پیش‌پرداخت برای پرداخت امانی
};

// Initial Mock Data to seed the application if empty
export const INITIAL_PRODUCTS = [
    { product_id: 'P-101', product_code: '1001', product_name: 'لپ‌تاپ ایسوس', unit_price_default: 45000000, vat_percent: 9, is_active: true },
    { product_id: 'P-102', product_code: '1002', product_name: 'ماوس بی‌سیم', unit_price_default: 1200000, vat_percent: 9, is_active: true },
    { product_id: 'P-103', product_code: '1003', product_name: 'مانیتور ال‌جی', unit_price_default: 8500000, vat_percent: 9, is_active: true },
    { product_id: 'P-104', product_code: '1004', product_name: 'خدمات نصب نرم‌افزار', unit_price_default: 500000, vat_percent: 0, is_active: true },
];

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
