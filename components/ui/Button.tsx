import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    isLoading?: boolean;
    icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, icon, className = '', disabled, ...props }) => {
    const baseStyles = "relative flex items-center justify-center w-full px-4 py-3 rounded-xl font-medium transition-all active:scale-[0.98]";
    
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
        secondary: "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
            {...props}
        >
            {isLoading && (
                <span className="absolute left-4 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {icon && <span className="material-icons text-xl ml-2">{icon}</span>}
            {children}
        </button>
    );
};
