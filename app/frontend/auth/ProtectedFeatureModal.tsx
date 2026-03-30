"use client";
import { X } from "lucide-react";

interface ProtectedFeatureModalProps {
  isOpen: boolean;
  featureName?: string;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function ProtectedFeatureModal({
  isOpen,
  featureName = "esta función",
  onClose,
  onLoginClick,
  onRegisterClick,
}: ProtectedFeatureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Fondo desenfocado */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Botón de cierre */}

        <button
  type="button"
  onClick={onClose}
  aria-label="Cerrar"
  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
>
  <X size={24} />
</button>

        {/* Contenido */}
        <div className="text-center">
          {/* Icono decorativo */}
          <div className="mb-4 flex justify-center">
            <div className="bg-[#FEE2E2] rounded-full p-4">
              <svg
                className="w-8 h-8 text-[#B47B65]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Encabezado */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso restringido
          </h2>

          {/* Mensaje */}
          <p className="text-gray-600 mb-6">
            Para acceder a {featureName}, crea una cuenta gratis
          </p>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRegisterClick}
              className="w-full bg-[#B47B65] text-white font-bold py-3 rounded-lg hover:bg-[#A66C57] transition"
            >
              Crear una cuenta
            </button>
            <button
              onClick={onLoginClick}
              className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
            >
              Iniciar sesión
            </button>
          </div>

          {/* Pie de página */}
          <p className="text-xs text-gray-400 mt-4">
            Es rápido, seguro y gratis
          </p>
        </div>
      </div>
    </div>
  );
}
