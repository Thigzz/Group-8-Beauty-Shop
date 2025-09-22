import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-black text-2xl font-bold">&times;</button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;