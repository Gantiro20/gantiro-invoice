import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { adminLogin } from '../services/dataService';
import { Seller } from '../types';

interface AdminLoginProps {
  onLogin: (user: Seller) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      onLogin(result);
    } catch (err: any) {
      setError(err.message || 'خطا در ورود ادمین');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-800">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-900 p-8 text-center text-white">
                <div className="flex justify-center mb-4">
                    <span className="material-icons-round text-5xl text-gray-400">admin_panel_settings</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">ورود به پنل مدیریت</h1>
                <p className="opacity-60 text-sm">لطفاً اطلاعات ادمین را وارد کنید</p>
            </div>
            
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="ایمیل"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                        placeholder="admin@gantiro.com"
                        required
                    />

                    <Input
                        label="رمز عبور"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••"
                        required
                    />

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
                             <span className="material-icons-round text-lg ml-2">error</span>
                             {error}
                        </div>
                    )}

                    <Button type="submit" isLoading={loading} className="bg-gray-800 hover:bg-gray-700 shadow-gray-400">
                        {loading ? 'در حال بررسی...' : 'ورود به پنل'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        type="button"
                        onClick={() => window.location.hash = ''}
                        className="text-gray-500 text-sm hover:text-gray-800 flex items-center justify-center w-full"
                    >
                        <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                        بازگشت به صفحه ورود فروشندگان
                    </button>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>رمز عبور پیش‌فرض: 123456</p>
                </div>
            </div>
        </div>
    </div>
  );
};