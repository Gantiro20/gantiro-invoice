import React, { useState, useEffect } from 'react';
import { Seller } from './types';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvoiceCreate } from './pages/InvoiceCreate';
import { Layout } from './components/Layout';

const DEFAULT_ROUTE = '#create';

const normalizeHash = (hash: string) => {
  if (!hash) return DEFAULT_ROUTE;
  return hash.startsWith('#') ? hash : `#${hash}`;
};

const App: React.FC = () => {
  const [user, setUser] = useState<Seller | null>(null);
  const [route, setRoute] = useState<string>(
    normalizeHash(window.location.hash)
  );

/* =========================
   Restore session + routing
========================== */
useEffect(() => {
  // ♻️ Restore session
  const savedUser = localStorage.getItem('gantiro_user_session');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }

  // 🧭 Routing
  const handleHashChange = () => {
    setRoute(normalizeHash(window.location.hash));
  };

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  return () => {
    window.removeEventListener('hashchange', handleHashChange);
  };
}, []);
  
  /* =========================
     Navigation helpers
  ========================== */
  const navigate = (hash: string) => {
    window.location.hash = normalizeHash(hash);
  };

  const handleLogin = (loggedInUser: Seller) => {
    setUser(loggedInUser);
    localStorage.setItem(
      'gantiro_user_session',
      JSON.stringify(loggedInUser)
    );

    navigate(loggedInUser.role === 'admin' ? '#admin' : '#create');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gantiro_user_session');
    navigate(DEFAULT_ROUTE);
  };

  /* =========================
     Auth gate
  ========================== */
 /* =========================
   Auth Gate (FINAL – CLEAN)
========================== */

const hash = window.location.hash || '';
const isAdminRoute =
  hash.startsWith('#admin-login') &&
  hash.includes('key=GANTIRO_ADMIN');

if (!user) {
  if (isAdminRoute) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <Login onLogin={handleLogin} />;
}

  /* =========================
     Route resolution
  ========================== */
  let content: React.ReactNode = null;
  let title = '';

  switch (route) {
    case '#create':
      content = (
        <InvoiceCreate
          user={user}
          onSuccess={() => navigate('#dashboard')}
        />
      );
      title = 'ثبت فاکتور جدید';
      break;

    case '#dashboard':
      if (user.role === 'admin' || user.can_see_history) {
        content = <Dashboard user={user} />;
        title = 'تاریخچه فروش';
      } else {
        content = (
  <InvoiceCreate
    user={user}
    onSuccess={() => navigate('#dashboard')}
  />
);
title = 'ثبت فاکتور جدید';
break;
      }
      break;

    case '#admin':
      if (user.role === 'admin') {
        content = <AdminDashboard />;
        title = 'پنل مدیریت';
      } else {
        content = (
  <InvoiceCreate
    user={user}
    onSuccess={() => navigate('#dashboard')}
  />
);
title = 'ثبت فاکتور جدید';
break;
      }
      break;

    default:
  content = (
    <InvoiceCreate
      user={user}
      onSuccess={() => navigate('#dashboard')}
    />
  );
  title = 'ثبت فاکتور جدید';
  break;
  }

  /* =========================
     Layout
  ========================== */
  return (
    <Layout
      user={user}
      title={title}
      route={route}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {content}
    </Layout>
  );
};

export default App;
