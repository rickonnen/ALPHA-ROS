// src/components/ModalExito.tsx
import React from 'react';

interface Props {
  onClose: () => void;
}

export default function ModalExito({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm border-t-4 border-green-500 animate-in fade-in zoom-in duration-300">
        <div className="mb-4 text-green-500 bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Confirmado!</h2>
        <p className="text-gray-600 mb-6">
          Tu transacción en TRX ha sido procesada con éxito. Ya puedes disfrutar de tu servicio.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}