"use client";
import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import AuthModal from "@/app/frontend/auth/AuthModal";
import ProtectedFeatureModal from "@/app/frontend/auth/ProtectedFeatureModal";
import { useAuth } from "@/app/frontend/auth/AuthContext";

export default function TestAuthPage() {
  const { user, logout, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
      <nav className="p-4 flex justify-between items-center w-full bg-white rounded-lg shadow-sm mb-10">
        <h1 className="font-bold text-lg">Binary Brain - Test</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => alert("Notificaciones: Próximamente")}
                title="Notificaciones"
                aria-label="Notificaciones"
                className="text-gray-600 hover:text-[#B47B65] transition-colors"
              >
                <Bell size={24} />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setShowAuth(false);
                  }}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowProtected(true)}
                title="Notificaciones"
                aria-label="Notificaciones"
                className="text-gray-600 hover:text-[#B47B65] transition-colors"
              >
                <Bell size={24} />
              </button>
              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
                className="bg-[#B47B65] text-white px-6 py-2 rounded-full font-bold"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="p-10 text-center text-gray-400 italic">
        {isLoading ? (
          <p>Cargando...</p>
        ) : user ? (
          <p>¡Bienvenido, {user.name}! Estás autenticado.</p>
        ) : (
          <p>(Este fondo representa el HOME que está haciendo el otro grupo)</p>
        )}
      </div>

      {/* Aquí inyectamos el Sidebar modular */}
      <ProtectedFeatureModal
        isOpen={showProtected}
        featureName="esta función"
        onClose={() => setShowProtected(false)}
        onLoginClick={() => {
          setShowProtected(false);
          setAuthMode("login");
          setShowAuth(true);
        }}
        onRegisterClick={() => {
          setShowProtected(false);
          setAuthMode("register");
          setShowAuth(true);
        }}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialMode={authMode}
      />
    </div>
  );
}