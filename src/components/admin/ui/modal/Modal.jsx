// src/components/admin/ui/modal/Modal.jsx

import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-[#fff8f2] rounded-2xl p-6 shadow-xl max-w-lg w-full relative border border-red-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-red-600" />
        </button>
        {title && (
          <h2 className="text-xl font-bold text-red-700 mb-6 border-b pb-3 border-red-200">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}