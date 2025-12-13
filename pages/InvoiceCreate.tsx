import React, { useState, useEffect } from 'react';
import { Seller, Product, Customer } from '../types';
import { getProducts, findCustomerByMobile, createInvoice, getGlobalVatRate, updateGlobalVatRate } from '../services/dataService';
import { formatNumber, formatCurrency } from '../utils';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

import { PAYMENT_CONFIG } from '../constants';

interface InvoiceCreateProps {
    user: Seller;
    onSuccess: () => void;
}

interface RowItem {
    id: number;
    product_id: string;
    product_name: string;
    product_code: string;
    unit_price: number;
    quantity: number;
    vat_percent: number;
}

export const InvoiceCreate: React.FC<InvoiceCreateProps> = ({ user, onSuccess }) => {
    // --- State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Customer Form
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerWhatsapp, setCustomerWhatsapp] = useState('');
    const [customerLoading, setCustomerLoading] = useState(false);

    // Invoice Settings
    const [isVatEnabled, setIsVatEnabled] = useState(false);
    const [vatRate, setVatRate] = useState(9); // Default will be overwritten by effect
    const [items, setItems] = useState<RowItem[]>([]);
    const [paymentMode, setPaymentMode] = useState<'instant' | 'credit'>('instant');
    const [paymentMethod, setPaymentMethod] = useState<'link' | 'pos' | 'cash'>('link');
    const [linkChannel, setLinkChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');

    // --- Effects ---
    useEffect(() => {
        // Load Global VAT Rate
        const globalRate = getGlobalVatRate();
        setVatRate(globalRate);
        
        loadProducts(globalRate);
    }, []);

    // Customer Lookup Logic
    useEffect(() => {
        const lookup = async () => {
            if (customerMobile.length >= 10) {
                setCustomerLoading(true);
                const found = await findCustomerByMobile(customerMobile);
                if (found) {
                    setCustomerName(found.full_name);
                    setCustomerCompany(found.company_name || '');
                    setCustomerEmail(found.email || '');
                    setCustomerWhatsapp(found.whatsapp || '');
                }
                setCustomerLoading(false);
            }
        };
        const timeout = setTimeout(lookup, 800);
        return () => clearTimeout(timeout);
    }, [customerMobile]);

    const loadProducts = async (currentVatRate: number) => {
        const data = await getProducts();
        setProducts(data);
        setLoadingProducts(false);
        // Initialize one empty row
        if (data.length > 0) addItemRow(data, currentVatRate);
    };

    // --- Handlers ---
    const addItemRow = (productList = products, rate = vatRate) => {
        const newItem: RowItem = {
            id: Date.now(),
            product_id: '',
            product_name: '',
            product_code: '',
            unit_price: 0,
            quantity: 1,
            vat_percent: rate, // Use current global rate
        };
        setItems(prev => [...prev, newItem]);
    };

    const updateItem = (id: number, field: keyof RowItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            
            if (field === 'product_id') {
                const selectedProduct = products.find(p => p.product_id === value);
                if (selectedProduct) {
                    return {
                        ...item,
                        product_id: selectedProduct.product_id,
                        product_name: selectedProduct.product_name,
                        product_code: selectedProduct.product_code,
                        unit_price: selectedProduct.unit_price_default,
                        vat_percent: vatRate // Override product default with current global rate for consistency
                    };
                }
            }
            
            return { ...item, [field]: value };
        }));
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleVatRateChange = (newRate: number) => {
        setVatRate(newRate);
        // Update all existing items to reflect the new rate
        setItems(prev => prev.map(item => ({ ...item, vat_percent: newRate })));
        
        // Persist for everyone if Admin
        if (user.role === 'admin') {
            updateGlobalVatRate(newRate);
        }
    };

    // --- Calculations ---
    const calculateTotals = () => {
        let subtotal = 0;
        let vatTotal = 0;

        items.forEach(item => {
            if (!item.product_id) return;
            const lineSub = item.unit_price * item.quantity;
            const lineVat = isVatEnabled ? (lineSub * item.vat_percent / 100) : 0;
            subtotal += lineSub;
            vatTotal += lineVat;
        });

        const total = subtotal + vatTotal;
        const deposit = paymentMode === 'credit' ? total * 0.3 : total;

        return { subtotal, vatTotal, total, deposit };
    };

    const totals = calculateTotals();

    const handleSendLink = () => {
        if (!customerName || !customerMobile) {
            alert('لطفاً نام و موبایل مشتری را وارد کنید');
            return;
        }

        const amountToPay =
            paymentMode === 'credit'
                ? Math.round(totals.total * PAYMENT_CONFIG.AMANI_DEPOSIT_PERCENT / 100)
                : totals.total;

        const messageBody = `
سلام ${customerName}
لطفاً مبلغ ${amountToPay.toLocaleString('fa-IR')} تومان را بابت فاکتور خرید از طریق لینک زیر واریز کنید:

${PAYMENT_CONFIG.BLU_PAYMENT_LINK}

با تشکر
گانتیرو
`.trim();

        if (linkChannel === 'whatsapp') {
            const waNumber = customerMobile.replace(/^0/, '98').replace(/\D/g, '');
            const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageBody)}`;
            window.open(url, '_blank');
        } else if (linkChannel === 'sms') {
            const url = `sms:${customerMobile}?body=${encodeURIComponent(messageBody)}`;
            window.open(url, '_self');
        } else if (linkChannel === 'email') {
            if (!customerEmail) {
                alert('برای ارسال ایمیل، لطفاً فیلد ایمیل را پر کنید.');
                return;
            }
            const subject = 'لینک پرداخت فاکتور';
            const url = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
            window.open(url, '_self');
        }
    };

    const handleSubmit = async () => {
        if (!customerName || !customerMobile) return alert('اطلاعات مشتری ناقص است');
        if (items.some(i => !i.product_id)) return alert('لطفا محصولات را انتخاب کنید');

        setSubmitting(true);
        try {
            await createInvoice(
                user,
                {
                    full_name: customerName,
                    mobile: customerMobile,
                    company_name: customerCompany,
                    email: customerEmail,
                    whatsapp: customerWhatsapp
                },
                items.map(i => ({
                    product_id: i.product_id,
                    product_code: i.product_code,
                    product_name: i.product_name,
                    unit_price: i.unit_price,
                    quantity: i.quantity,
                    vat_percent: i.vat_percent
                })),
                {
                    payment_mode: paymentMode,
                    payment_method: paymentMethod,
                    payment_channel_for_link: paymentMethod === 'link' ? linkChannel : null,
                    is_vat_enabled: isVatEnabled,
                    amount_paid: totals.deposit 
                }
            );
            alert('فاکتور با موفقیت ثبت شد!');
            onSuccess();
        } catch (error) {
            alert('خطا در ثبت فاکتور');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pb-24">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">اطلاعات خریدار</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Input 
                            label="شماره موبایل *" 
                            value={customerMobile} 
                            onChange={e => setCustomerMobile(e.target.value)} 
                            placeholder="0912..."
                        />
                        {customerLoading && <span className="absolute left-3 top-9 text-indigo-600 text-xs">در حال جستجو...</span>}
                    </div>
                    <Input label="نام و نام خانوادگی *" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    <Input label="نام شرکت (اختیاری)" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} />
                    <Input label="شماره واتساپ" value={customerWhatsapp} onChange={e => setCustomerWhatsapp(e.target.value)} />
                    <Input label="ایمیل (اختیاری)" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-800">اقلام فاکتور</h3>
                    <div className="flex items-center">
                        <label className="flex items-center text-sm cursor-pointer select-none">
                            <input type="checkbox" checked={isVatEnabled} onChange={e => setIsVatEnabled(e.target.checked)} className="ml-2" />
                            <span className="ml-1">محاسبه مالیات</span>
                        </label>
                        
                        {user.role === 'admin' ? (
                            <div className="flex items-center mr-2 bg-gray-50 rounded px-2 py-1 border border-gray-200">
                                <input 
                                    type="number" 
                                    value={vatRate}
                                    onChange={(e) => handleVatRateChange(Number(e.target.value))}
                                    className="w-10 text-center bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <span className="mr-1 text-sm font-bold text-gray-600">٪</span>
                            </div>
                        ) : (
                            <span className="mr-1 text-sm text-gray-500 font-medium">({vatRate}٪)</span>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative animate-fadeIn">
                            <div className="absolute top-2 left-2 text-xs font-mono text-gray-400">#{index + 1}</div>
                            {items.length > 1 && (
                                <button 
                                    onClick={() => removeItem(item.id)} 
                                    className="absolute top-2 left-8 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                    title="حذف ردیف"
                                >
                                    <span className="material-icons-round text-lg">delete</span>
                                </button>
                            )}
                            
                            <div className="grid grid-cols-12 gap-3 mt-4">
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="text-xs text-gray-500 block mb-1">محصول</label>
                                    <select 
                                        className="w-full p-2 border rounded-md bg-white text-sm"
                                        value={item.product_id}
                                        onChange={e => updateItem(item.id, 'product_id', e.target.value)}
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        {products.map(p => (
                                            <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="text-xs text-gray-500 block mb-1">کد کالا</label>
                                    <input className="w-full p-2 bg-gray-100 rounded text-sm text-center" value={item.product_code} disabled />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="text-xs text-gray-500 block mb-1">تعداد</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full p-2 border rounded bg-white text-sm text-center"
                                        value={item.quantity}
                                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="text-xs text-gray-500 block mb-1">قیمت واحد (تومان)</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2 border rounded bg-white text-sm"
                                        value={item.unit_price}
                                        onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-6 flex items-end justify-end">
                                    <div className="text-sm font-bold text-gray-700">
                                        {formatNumber(item.unit_price * item.quantity)} تومان
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <Button variant="outline" onClick={() => addItemRow()} icon="add" className="py-2 text-sm border-dashed">
                        افزودن محصول جدید
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">اطلاعات پرداخت</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">نوع پرداخت</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPaymentMode('instant')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm border ${paymentMode === 'instant' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
                            >
                                لحظه‌ای (کامل)
                            </button>
                            <button 
                                onClick={() => setPaymentMode('credit')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm border ${paymentMode === 'credit' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
                            >
                                امانی (اقساطی)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">روش پرداخت</label>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setPaymentMethod('link')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm border ${paymentMethod === 'link' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200'}`}
                            >
                                لینک پرداخت
                            </button>
                             <button 
                                onClick={() => setPaymentMethod('pos')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm border ${paymentMethod === 'pos' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200'}`}
                            >
                                کارتخوان
                            </button>
                             <button 
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm border ${paymentMethod === 'cash' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200'}`}
                            >
                                نقد
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'link' && (
                        <div className="col-span-1 md:col-span-2 bg-purple-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-purple-800 mb-2">ارسال لینک از طریق:</label>
                            <div className="flex gap-3">
                                {['whatsapp', 'sms', 'email'].map((c: any) => (
                                    <label key={c} className="flex items-center text-sm cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="channel" 
                                            checked={linkChannel === c} 
                                            onChange={() => setLinkChannel(c)}
                                            className="ml-1"
                                        />
                                        {c === 'whatsapp' ? 'واتساپ' : c === 'sms' ? 'پیامک' : 'ایمیل'}
                                    </label>
                                ))}
                            </div>
                            <button onClick={handleSendLink} className="mt-3 text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700">
                                ارسال لینک تست
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-gray-500">جمع کل:</span>
                        <span className="font-bold">{formatCurrency(totals.total)}</span>
                    </div>
                    {paymentMode === 'credit' && (
                        <div className="flex justify-between items-center mb-3 text-sm text-indigo-700">
                             <span>پیش‌پرداخت الزامی (۳۰٪):</span>
                             <span className="font-bold">{formatCurrency(totals.deposit)}</span>
                        </div>
                    )}
                    <Button onClick={handleSubmit} isLoading={submitting} disabled={totals.total === 0}>
                        ثبت نهایی فاکتور
                    </Button>
                </div>
            </div>
        </div>
    );
};