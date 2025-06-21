// src/components/Modal.tsx
import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-full p-4 bg-white rounded shadow-lg">
        <button className="absolute text-xl top-2 right-3" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
