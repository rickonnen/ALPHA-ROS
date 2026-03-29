"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, CheckCheck } from "lucide-react";
import AuthModal from "@/app/frontend/auth/AuthModal";
import ProtectedFeatureModal from "@/app/frontend/auth/ProtectedFeatureModal";
import { useAuth } from "@/app/frontend/auth/AuthContext";
import NotificationsPanel from "@/app/frontend/notifications/NotificationsPanel";

export default function TestAuthPage() {
  const { user, logout, isLoading } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Función para cerrar el panel de notificaciones
  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // 🔥 Fetch desde API
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Función para marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Función para marcar una notificación como leída
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: "markAsRead", 
          notificationId 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔢 Contador dinámico
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">

      {/* NAV */}
      <nav className="p-4 flex justify-between items-center w-full bg-white rounded-lg shadow-sm mb-10">
        <h1 className="font-bold text-lg">Binary Brain - Test</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* 🔔 NOTIFICACIONES */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-600 hover:text-[#B47B65] transition-colors"
                >
                  <Bell size={24} />

                  {/* Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panel de notificaciones con todas las props necesarias */}
                <NotificationsPanel
                  isOpen={showNotifications}
                  notifications={notifications}
                  onClose={closeNotifications}
                  onMarkAllAsRead={markAllAsRead}
                  onNotificationClick={markNotificationAsRead}
                />
              </div>

              {/* USER */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <span className="text-gray-700 font-medium">{user.name}</span>

                <button
                  onClick={() => {
                    logout();
                    setShowAuth(false);
                  }}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowProtected(true)}
                className="text-gray-600 hover:text-[#B47B65]"
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

      {/* BODY */}
      <div className="p-10 text-center text-gray-400 italic">
        {isLoading ? (
          <p>Cargando...</p>
        ) : user ? (
          <p>¡Bienvenido, {user.name}! Estás autenticado.</p>
        ) : (
          <p>(Este fondo representa el HOME)</p>
        )}
      </div>

      {/* MODALES */}
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