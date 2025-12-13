import React, { useState } from 'react';
import { Seller } from '../types';
import { loginOrRegisterSeller } from '../services/dataService';
import { adminLogin } from '../services/dataService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
    onLogin: (user: Seller) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [mobile, setMobile] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
           // ---------- ADMIN LOGIN ----------
            if (email && password && !isRegistering) {
              // Only try admin login if we are NOT in registration mode (unless admin login is hidden separate route)
              // Since the UI logic for admin login is a bit mixed here based on previous context, 
              // but typically standard users don't have password.
              // Based on previous file content, admin checks happen if email+password exist.
              
              // However, since we are making email mandatory for register, we need to be careful not to confuse regular login vs admin.
              // Regular login usually just asks for Mobile. 
              // Admin login asks for Email + Password.
              
              // Let's keep existing logic structure:
              // If password is provided, assume admin attempt.
              if (password) {
                  const result = await adminLogin(email, password);
                  if (!result || result.role !== 'admin') {
                    throw new Error('دسترسی ادمین نامعتبر است');
                  }
                  onLogin(result);
                  return;
              }
            }

            // ---------- SELLER LOGIN / REGISTER ----------
            if (!mobile) {
              throw new Error("شماره موبایل الزامی است");
            }

            if (isRegistering) {
                if (!fullName) {
                    throw new Error("نام و نام خانوادگی الزامی است");
                }
                if (!email) {
                    throw new Error("ایمیل الزامی است");
                }
            }

            const user = await loginOrRegisterSeller(
              mobile,
              isRegistering ? fullName : undefined,
              email
            );

            onLogin(user);
        } catch (err: any) {
            setError(err.message || 'خطا در ورود');
            // If user not found during login attempt, switch to register mode automatically
            if (!isRegistering && err.message.includes('یافت نشد')) {
                setIsRegistering(true);
                setError('کاربر یافت نشد. لطفا مشخصات خود را تکمیل کنید.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-700 p-8 text-center text-white">
                    <h1 className="text-2xl font-bold mb-2">فاکتور فروش گانتیرو</h1>
                    <p className="opacity-80 text-sm">سیستم جامع مدیریت فروش</p>
                </div>
                
                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                        {isRegistering ? 'ثبت نام فروشنده جدید' : 'ورود به حساب کاربری'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="شماره موبایل" 
                            type="tel" 
                            placeholder="0912..." 
                            value={mobile} 
                            onChange={e => setMobile(e.target.value)}
                            required 
                        />
                        
                        {isRegistering && (
                            <>
                                <Input 
                                    label="نام و نام خانوادگی" 
                                    type="text" 
                                    placeholder="علی محمدی" 
                                    value={fullName} 
                                    onChange={e => setFullName(e.target.value)}
                                    required 
                                />
                                <Input 
                                    label="ایمیل" 
                                    type="email" 
                                    placeholder="example@mail.com" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </>
                        )}

                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                        <Button type="submit" isLoading={loading}>
                            {isRegistering ? 'ثبت نام و ورود' : 'ورود'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                            {isRegistering ? 'حساب دارید؟ وارد شوید' : 'حساب ندارید؟ ثبت نام کنید'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.hash = '#admin-login';
                        }}
                        className="text-gray-400 text-xs hover:text-gray-600"
                      >
                        ورود ادمین
                      </button>
                    </div>
                </div>
            </div>
        </div>
    );
};