"use client";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState, useEffect } from "react";
// Importamos X de lucide-react para un icono de cierre limpio
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  // Estado para alternar entre Login y Registro dentro del panel
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  // Actualizar el estado cuando initialMode cambia
  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  if (!isOpen) return null;

  return (
    // Contenedor principal fixed que ocupa toda la pantalla
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Fondo desenfocado (Backdrop) - Cierra al hacer clic */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Panel Lateral Deslizable (Color de fondo de tu diseño: #EAE3D9) */}
      <div className="relative w-full max-w-[480px] h-full bg-[#EAE3D9] shadow-2xl p-10 flex flex-col">
        
        {/* Botón de cierre superior (Volver al inicio) */}
        <button 
          onClick={onClose} 
          className="self-end text-[#B47B65] font-bold text-sm flex items-center gap-1 hover:underline"
        >
          <X size={16} /> Volver al inicio
        </button>
        
        {/* Tabs de Selección */}
        <div className="flex gap-4 mt-12 mb-8 justify-center bg-white p-1 rounded-full shadow-sm">
          <button 
            onClick={() => setIsLogin(true)}
            className={`px-8 py-2 rounded-full font-bold transition ${isLogin ? 'bg-[#0F172A] text-white' : 'text-gray-400'}`}
          >
            Iniciar sesión
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`px-8 py-2 rounded-full font-bold transition ${!isLogin ? 'bg-[#0F172A] text-white' : 'text-gray-400'}`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Que formulario mostrar */}
        <div className="overflow-y-auto pr-2">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} onClose={onClose} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}