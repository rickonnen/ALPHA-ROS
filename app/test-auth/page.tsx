"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import AuthModal from "@/app/frontend/auth/AuthModal";

export default function TestAuthPage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
      <nav className="p-4 flex justify-between items-center w-full bg-white rounded-lg shadow-sm mb-10">
        <h1 className="font-bold text-lg">Binary Brain - Test</h1>
        <div className="flex items-center gap-4">
          <button 
            title="Notificaciones"
            aria-label="Notificaciones"
            className="text-gray-600 hover:text-[#B47B65] transition-colors"
          >
            <Bell size={24} />
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="bg-[#B47B65] text-white px-6 py-2 rounded-full font-bold"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      <div className="p-10 text-center text-gray-400 italic">
        (Este fondo representa el HOME que está haciendo el otro grupo)
      </div>

      {/* Aquí inyectamos el Sidebar modular */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}