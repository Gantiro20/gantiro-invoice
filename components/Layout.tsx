import React, { useState } from 'react';
import { Seller } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: Seller | null;
    onLogout: () => void;
    title: string;
    route: string;
    onNavigate: (hash: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    onLogout,
    title,
    route,
    onNavigate
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Helper to check permission
    const canViewHistory = user && (user.role === 'admin' || user.can_see_history);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-lg font-bold truncate max-w-[150px]">{title}</h1>
                    
                    {user && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition focus:outline-none"
                            >
                                {/* Simple Hamburger Icon (SVG) */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 bg-black/20 z-40" 
                                        onClick={() => setIsMenuOpen(false)}
                                    ></div>
                                    <div className="absolute left-0 top-12 w-56 bg-white rounded-xl shadow-xl text-gray-800 z-50 overflow-hidden py-2 animate-fadeIn origin-top-left">
                                        <div className="px-4 py-3 border-b bg-gray-50 mb-1">
                                            <p className="font-bold text-sm truncate">{user.full_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.mobile.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}</p>
                                        </div>
                                        
                                        {canViewHistory && (
                                            <button 
                                                onClick={() => {
                                                    window.location.hash = '#dashboard';
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-right px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center text-sm transition border-b border-gray-100"
                                            >
                                                <span className="material-icons-round ml-3 text-lg text-indigo-600">analytics</span>
                                                آمار فروش
                                            </button>
                                        )}

                                        <button 
                                            onClick={onLogout}
                                            className="w-full text-right px-4 py-3 hover:bg-red-50 text-red-600 flex items-center text-sm transition"
                                        >
                                            <span className="material-icons-round ml-3 text-lg">logout</span>
                                            خروج از حساب
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-3xl mx-auto p-4">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            {user && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
                    <nav className="flex justify-around items-center h-16 max-w-3xl mx-auto">
                        <NavButton
  icon="post_add"
  label="فاکتور جدید"
  active={route === '#create'}
  onClick={() => onNavigate('#create')}
/>
                        
                        {canViewHistory && (
                            active={route === '#dashboard'}
onClick={() => onNavigate('#dashboard')}
                        
                        {user.role === 'admin' && (
                            active={route === '#admin'}
onClick={() => onNavigate('#admin')}
                    </nav>
                </div>
            )}
        </div>
    );
};

const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <span className="material-icons-round text-2xl mb-0.5">{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);
