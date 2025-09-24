// components/Toast.js
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    console.log('Toast mounted with message:', message); // Debug log
    
    const timer = setTimeout(() => {
      console.log('Toast timer expired'); // Debug log
      onClose();
    }, duration);

    return () => {
      console.log('Toast cleanup'); // Debug log
      clearTimeout(timer);
    };
  }, [onClose, duration, message]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? (
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  ) : (
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  );

  return (
    <div className={`fixed top-6 right-6 z-[100] ${bgColor} text-white px-8 py-4 rounded-xl shadow-2xl flex items-center animate-fade-in text-lg font-semibold min-w-[300px]`}>
      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        {icon}
      </svg>
      <span className="flex-grow">{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;