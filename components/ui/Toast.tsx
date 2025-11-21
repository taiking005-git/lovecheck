import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 5000,
}) => {
    const [show, setShow] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            // Small timeout to ensure render happens before animation class is applied
            const showTimer = setTimeout(() => setShow(true), 10);

            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300);
            }, duration);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(timer);
            };
        } else {
            setShow(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!shouldRender) return null;

    const baseStyles = "fixed top-5 right-5 z-50 flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 transition-all duration-300 ease-in-out transform";
    const activeStyles = show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    return (
        <div className={`${baseStyles} ${activeStyles}`} role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
                {icons[type]}
            </div>
            <div className="ml-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => {
                    setShow(false);
                    setTimeout(onClose, 300);
                }}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
