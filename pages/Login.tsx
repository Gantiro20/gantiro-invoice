import React, { useState } from 'react';
import { Seller } from '../types';
import { loginSeller, registerSeller } from '../services/dataService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLogin: (user: Seller) => void;
}

function normalizeMobile(input: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits  = '٠١٢٣٤٥٦٧٨٩';

  return input
    .replace(/[۰-۹]/g, d => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)))
    .replace(/\s+/g, '')
    .replace(/^0+/, '')
    .trim();
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: Seller;

const normalizedMobile = normalizeMobile(mobile);
      
      if (isRegistering) {
        user = await registerSeller(normalizedMobile, fullName, email);
      } else {
        user = await loginSeller(normalizedMobile);
      }

      onLogin(user);
    } catch (err: any) {
      const msg = err.message || 'خطا در ورود';

      // اگر لاگین خورد به یوزر نداشت → برو ثبت‌نام
      if (!isRegistering && msg.includes('User not found')) {
        setIsRegistering(true);
        setError('کاربر یافت نشد. لطفاً ثبت‌نام کنید.');
      } else {
        setError(msg);
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
          <p className="opacity-80 text-sm">سیستم مدیریت فروش</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegistering ? 'ثبت‌نام فروشنده' : 'ورود فروشنده'}
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

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={loading}>
              {isRegistering ? 'ثبت‌نام و ورود' : 'ورود'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              {isRegistering
                ? 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'
                : 'حساب ندارید؟ ثبت‌نام کنید'}
            </button>
          </div>

          
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
