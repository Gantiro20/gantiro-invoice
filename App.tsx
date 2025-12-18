import React, { useState, useEffect } from 'react';
import { Seller } from './types';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvoiceCreate } from './pages/InvoiceCreate';
import { Layout } from './components/Layout';

// Simple Hash Router Implementation
const App: React.FC = () => {
    const [user, setUser] = useState<Seller | null>(null);
    const [route, setRoute] = useState<string>('');

    useEffect(() => {
        // Restore session if exists (in real app, verify token)
        const savedUser = localStorage.getItem('gantiro_user_session');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        const handleHashChange = () => {
    const raw = window.location.hash || '';
    const normalized = raw.replace(/^#\/?/, '#');
    setRoute(normalized);
};

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Init

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleLogin = (loggedInUser: Seller) => {
        setUser(loggedInUser);
        localStorage.setItem('gantiro_user_session', JSON.stringify(loggedInUser));
        // Redirect based on role
        if (loggedInUser.role === 'admin') {
            window.location.hash = '#admin';
        } else {
            window.location.hash = '#create';
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('gantiro_user_session');
        window.location.hash = '';
    };

    if (!user) {
  if (route === '#admin-login') {
    return <AdminLogin onLogin={handleLogin} />;
  }
  return <Login onLogin={handleLogin} />;
}

    let Content = <div />;
    let title = 'داشبورد';

    switch (route) {
        case '#create':
            Content = <InvoiceCreate user={user} onSuccess={() => window.location.hash = '#dashboard'} />;
            title = 'ثبت فاکتور جدید';
            break;
        case '#dashboard':
            // Check permission: Only admin or users with can_see_history permission can view
            if (user.role === 'admin' || user.can_see_history) {
                Content = <Dashboard user={user} />;
                title = 'تاریخچه فروش';
            } else {
                Content = (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-500 text-center px-4">
                        <span className="material-icons-round text-6xl mb-4 text-gray-300">lock_person</span>
                        <p className="font-bold text-lg text-gray-700">عدم دسترسی</p>
                        <p className="mt-2 text-sm">شما مجوز مشاهده تاریخچه فروش را ندارید.</p>
                        <button 
                            onClick={() => window.location.hash = '#create'}
                            className="mt-6 text-indigo-600 text-sm hover:underline"
                        >
                            بازگشت به ثبت فاکتور
                        </button>
                    </div>
                );
                title = 'عدم دسترسی';
            }
            break;
        case '#admin':
            if (user.role !== 'admin') {
                Content = <div className="p-10 text-center text-red-500">دسترسی ندارید</div>;
            } else {
                Content = <AdminDashboard />;
                title = 'پنل مدیریت';
            }
            break;
        default:
             // Default redirection
             if (user.role === 'admin') {
                Content = <AdminDashboard />;
                title = 'پنل مدیریت';
             } else {
                Content = <InvoiceCreate user={user} onSuccess={() => window.location.hash = '#dashboard'} />;
                title = 'ثبت فاکتور جدید';
             }
    }

    return (
        <Layout user={user} onLogout={handleLogout} title={title}>
            {Content}
        </Layout>
    );
};

export default App;
