import React, { useEffect, useState } from 'react';
import { Seller, Invoice } from '../types';
import { getInvoices, getSellers } from '../services/dataService';
import { formatCurrency, formatNumber, getJalaliNow, jalaliToGregorian } from '../utils';

interface DashboardProps {
    user: Seller;
}

type DateFilter = 'all' | 'this_month' | 'last_month' | 'custom';

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Admin Specific State
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>('all');
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    
    // Custom Persian Date State
    const nowJ = getJalaliNow();
    const [startJ, setStartJ] = useState({ y: nowJ.y, m: nowJ.m, d: 1 }); // Default to start of this month
    const [endJ, setEndJ] = useState({ y: nowJ.y, m: nowJ.m, d: nowJ.d });

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [allInvoices, searchTerm, dateFilter, startJ, endJ, selectedSellerId]);

    const loadData = async () => {
        setLoading(true);
        const data = await getInvoices(user);
        
        // If admin, load sellers list for the filter dropdown
        if (user.role === 'admin') {
            const sellersList = await getSellers();
            setSellers(sellersList);
        }
        
        setAllInvoices(data);
        setLoading(false);
    };

    const applyFilters = () => {
        let result = [...allInvoices];

        // 0. Admin Seller Filter
        if (user.role === 'admin' && selectedSellerId !== 'all') {
            result = result.filter(inv => inv.seller_id === selectedSellerId);
        }

        // 1. Search Filter (Customer Name)
        if (searchTerm) {
            result = result.filter(inv => 
                inv.customer_name.includes(searchTerm) || 
                inv.customer_mobile.includes(searchTerm)
            );
        }

        // 2. Date Filter
        const now = new Date();
        const currentYear = now.getFullYear(); // Gregorian for logic
        const currentMonth = now.getMonth();

        if (dateFilter === 'this_month') {
            result = result.filter(inv => {
                const d = new Date(inv.invoice_date_gregorian);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });
        } else if (dateFilter === 'last_month') {
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            result = result.filter(inv => {
                const d = new Date(inv.invoice_date_gregorian);
                return d.getFullYear() === lastMonthDate.getFullYear() && d.getMonth() === lastMonthDate.getMonth();
            });
        } else if (dateFilter === 'custom') {
            // Convert Jalali state to Gregorian Date objects for comparison
            const startDate = jalaliToGregorian(startJ.y, startJ.m, startJ.d);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = jalaliToGregorian(endJ.y, endJ.m, endJ.d);
            endDate.setHours(23, 59, 59, 999);
            
            result = result.filter(inv => {
                const d = new Date(inv.invoice_date_gregorian);
                return d >= startDate && d <= endDate;
            });
        }

        setFilteredInvoices(result);
    };

    // Calculate Stats
    const totalSales = filteredInvoices.reduce((acc, curr) => acc + curr.amount_total, 0);
    const totalItems = filteredInvoices.reduce((acc, curr) => acc + (curr.total_items || 0), 0);

    if (loading) return <div className="flex justify-center p-10"><span className="animate-spin material-icons-round text-indigo-600 text-4xl">refresh</span></div>;

    return (
        <div className="space-y-4 pb-20">
            {/* Admin Filter Header */}
            {user.role === 'admin' && (
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-2 animate-fadeIn">
                    <span className="material-icons-round text-indigo-600">supervisor_account</span>
                    <select 
                        value={selectedSellerId}
                        onChange={(e) => setSelectedSellerId(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="all">گزارش کل فروشگاه (همه فروشندگان)</option>
                        {sellers.map(s => (
                            <option key={s.seller_id} value={s.seller_id}>
                                👤 {s.full_name} ({s.mobile})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-5 text-white shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-indigo-200 text-xs mb-1">
                            {user.role === 'admin' && selectedSellerId !== 'all' 
                                ? `جمع فروش (${sellers.find(s=>s.seller_id === selectedSellerId)?.full_name || 'کاربر'})`
                                : 'جمع فروش (فیلتر شده)'}
                        </p>
                        <h2 className="text-2xl font-bold">{formatNumber(totalSales)} <span className="text-sm font-normal">تومان</span></h2>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <span className="material-icons-round text-white">analytics</span>
                    </div>
                </div>
                <div className="flex gap-4 border-t border-white/10 pt-3">
                    <div>
                        <p className="text-indigo-200 text-xs">تعداد فاکتور</p>
                        <p className="font-bold text-lg">{filteredInvoices.length}</p>
                    </div>
                    <div>
                        <p className="text-indigo-200 text-xs">تعداد کالا</p>
                        <p className="font-bold text-lg">{formatNumber(totalItems)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="grid gap-3">
                    {/* Search */}
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-gray-400">search</span>
                        <input 
                            type="text" 
                            placeholder="جستجو نام مشتری یا موبایل..." 
                            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Date Toggle */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <FilterChip label="همه" active={dateFilter === 'all'} onClick={() => setDateFilter('all')} />
                        <FilterChip label="این ماه" active={dateFilter === 'this_month'} onClick={() => setDateFilter('this_month')} />
                        <FilterChip label="ماه قبل" active={dateFilter === 'last_month'} onClick={() => setDateFilter('last_month')} />
                        <FilterChip label="بازه زمانی" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
                    </div>

                    {/* Custom Date Inputs (Persian) */}
                    {dateFilter === 'custom' && (
                        <div className="space-y-3 animate-fadeIn bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-8">از:</span>
                                <PersianDateSelector value={startJ} onChange={setStartJ} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-8">تا:</span>
                                <PersianDateSelector value={endJ} onChange={setEndJ} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* List */}
            <div className="grid gap-4 sm:grid-cols-2">
                {filteredInvoices.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-400 text-sm">
                        موردی یافت نشد.
                    </div>
                ) : (
                    filteredInvoices.map(inv => (
                        <div key={inv.invoice_id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-indigo-700 text-sm">{inv.invoice_id}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${getStatusColor(inv.payment_status)}`}>
                                    {translateStatus(inv.payment_status)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-700 font-medium">
                                    <span className="material-icons-round text-xs ml-1 align-middle text-gray-400">person</span>
                                    {inv.customer_name}
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {inv.total_items ? `${inv.total_items} کالا` : '-'}
                                </div>
                            </div>
                            {/* Show Seller Name for Admin when viewing All */}
                            {user.role === 'admin' && selectedSellerId === 'all' && (
                                <div className="text-xs text-indigo-500 mb-1 flex items-center">
                                    <span className="material-icons-round text-[10px] ml-1">badge</span>
                                    فروشنده: {inv.seller_name}
                                </div>
                            )}
                            <div className="text-xs text-gray-400 mb-3 flex items-center">
                                <span className="material-icons-round text-[10px] ml-1">calendar_today</span>
                                {inv.invoice_date_jalali}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-dashed">
                                <div className="text-xs text-gray-500">مبلغ کل:</div>
                                <div className="font-bold text-gray-800">{formatCurrency(inv.amount_total)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Components ---

const FilterChip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick} 
        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

interface JDate { y: number; m: number; d: number; }

const PersianDateSelector = ({ value, onChange }: { value: JDate, onChange: (v: JDate) => void }) => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    const years = [1402, 1403, 1404, 1405]; // Can be dynamic

    return (
        <div className="flex gap-1 w-full">
            <select 
                className="bg-white border rounded text-xs p-1 flex-1"
                value={value.d}
                onChange={e => onChange({ ...value, d: parseInt(e.target.value) })}
            >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
                className="bg-white border rounded text-xs p-1 flex-[1.5]"
                value={value.m}
                onChange={e => onChange({ ...value, m: parseInt(e.target.value) })}
            >
                {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select 
                className="bg-white border rounded text-xs p-1 flex-1"
                value={value.y}
                onChange={e => onChange({ ...value, y: parseInt(e.target.value) })}
            >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
};

const getStatusColor = (s: string) => {
    switch (s) {
        case 'Paid': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        case 'Partially Paid': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const translateStatus = (s: string) => {
    switch (s) {
        case 'Paid': return 'پرداخت شده';
        case 'Pending': return 'در انتظار';
        case 'Partially Paid': return 'پرداخت ناقص';
        default: return s;
    }
};