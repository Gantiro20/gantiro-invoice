import React, { useEffect, useState } from 'react';
import { Seller } from '../types';
import { getSellers, updateSellerPermission } from '../services/dataService';

export const AdminDashboard: React.FC = () => {
    const [sellers, setSellers] = useState<Seller[]>([]);

    useEffect(() => {
        loadSellers();
    }, []);

    const loadSellers = async () => {
        const data = await getSellers();
        setSellers(data);
    };

    const togglePermission = async (sellerId: string, current: boolean) => {
        await updateSellerPermission(sellerId, !current);
        loadSellers(); // Refresh
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                    <span className="material-icons ml-2 text-indigo-600">people</span>
                    مدیریت فروشندگان
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b">
                                <th className="p-3">نام</th>
                                <th className="p-3">موبایل</th>
                                <th className="p-3">ایمیل</th>
                                <th className="p-3 text-center">دسترسی تاریخچه</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers.map(seller => (
                                <tr key={seller.seller_id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-3 font-medium">{seller.full_name} <span className="text-xs text-gray-400 block">{seller.role}</span></td>
                                    <td className="p-3 text-gray-600">{seller.mobile}</td>
                                    <td className="p-3 text-gray-600">{seller.email || '-'}</td>
                                    <td className="p-3 text-center">
                                        {seller.role !== 'admin' && (
                                            <button 
                                                onClick={() => togglePermission(seller.seller_id, seller.can_see_history)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${seller.can_see_history ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${seller.can_see_history ? '-translate-x-6' : '-translate-x-1'}`} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};