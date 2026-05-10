/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 12/04/2026
 * Funcionalidad: Componente aislado para el botón y panel de notificaciones
 * @param objUser Objeto del usuario autenticado para validar permisos
 * @param unreadCount Número entero con la cantidad de notificaciones sin leer
 * @param onRequireAuth Función callback que se ejecuta si un usuario anónimo intenta abrir las notificaciones
 * @param strButtonClasses Cadena de clases de Tailwind para estilizar el botón
 * @return Elemento JSX que contiene el botón interactivo y el panel desplegable de notificaciones
 */
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { NotificationBadge } from "@/app/home/components/notifications/NotificationBadge";
import { NotificationPanel } from "@/app/home/components/notifications/NotificationPanel";
import { useClickOutside } from "../../hooks/useClickOutside"; // Ajusta la ruta relativa a tus hooks
import { TodasNotificacionesView } from "@/app/notification/views/todas-notificaciones-view";

interface NotificationButtonProps {
  objUser: any;
  unreadCount: number;
  onRequireAuth: () => void;
  strButtonClasses: string;
}

export const NotificationButton = ({
  objUser,
  unreadCount,
  onRequireAuth,
  strButtonClasses,
}: NotificationButtonProps) => {
  const [bolShowNotifications, setBolShowNotifications] = useState(false);
  const [showTodasNotif, setShowTodasNotif] = useState(false);
  const refContainer = useRef<HTMLDivElement | null>(null);

  useClickOutside(
    [refContainer],
    () => setBolShowNotifications(false),
    { enabled:bolShowNotifications }
  );

  const handleToggleNotifications = () => {
    // si hay usuario logueado alternamos el panel, sino mostramos el modal de Auth
    if (objUser) {
      setBolShowNotifications((prev) => !prev);
    } else {
      onRequireAuth();
    }
  };

  return (
    <div className="relative" ref={refContainer}>
      <button
        aria-label="Notificaciones"
        onClick={handleToggleNotifications}
        className={strButtonClasses}
      >
        <Image
          src="/bell_icon.svg"
          alt="Notificaciones"
          width={24}
          height={24}
          className="w-6 h-6 object-contain svg-theme-invert"
        />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* renderizado condicional del panel solo si está abierto y hay sesión */}
      {objUser && bolShowNotifications && (
        <div className="absolute right-[-15px] top-full mt-0 z-50">
          <NotificationPanel 
            onClose={() => setBolShowNotifications(false)}
            onVerTodas={() => {
              setBolShowNotifications(false);
              setShowTodasNotif(true);
            }}
          />
        </div>
      )}
      {showTodasNotif && (
        <TodasNotificacionesView onClose={() => setShowTodasNotif(false)} />
      )}
    </div>
  );
};