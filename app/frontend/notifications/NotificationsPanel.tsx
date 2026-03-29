"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Circle, CheckCircle2, Clock, X, CheckCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  notifications: any[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notificationId: number) => void;
}

export default function NotificationsPanel({ 
  isOpen, 
  notifications, 
  onClose,
  onMarkAllAsRead,
  onNotificationClick
}: Props) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Cerrar con la tecla ESC
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      setIsAnimating(true);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Prevenir scroll del body cuando el panel está abierto en móvil
      document.body.style.overflow = 'hidden';
      
      // Remover la animación después de que termine
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset scroll position when filter changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [filter]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => !n.read);

  return (
    <>
      {/* Overlay para móvil */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Panel - Responsive con animación desde arriba */}
      <div 
        ref={panelRef}
        className={`
          fixed md:absolute 
          z-50 
          bg-white shadow-2xl 
          overflow-hidden
          
          /* Móvil (full screen desde arriba) */
          inset-x-0 top-0 bottom-auto md:inset-auto
          rounded-b-2xl md:rounded-2xl
          h-auto max-h-[90vh] md:max-h-[80vh]
          w-full md:w-96
          md:right-0 md:mt-3
          md:origin-top
          
          /* Animaciones */
          transition-all duration-300 ease-out
          
          /* Flex column para estructura correcta */
          flex flex-col
        `}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header con gradiente más pronunciado */}
        <div className="flex-shrink-0 sticky top-0 bg-gradient-to-r from-[#B47B65] to-[#9a5f4c] px-4 md:px-5 py-4 border-b border-white/20 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-white" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-in fade-in zoom-in duration-200 ring-2 ring-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Notificaciones</h3>
                <p className="text-xs text-white/80 mt-0.5 hidden sm:block">
                  {unreadCount === 0 
                    ? "No tienes notificaciones sin leer" 
                    : `Tienes ${unreadCount} notificacion${unreadCount !== 1 ? 'es' : ''} sin leer`}
                </p>
              </div>
            </div>
            
            {/* Botón para marcar todas como leídas */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-colors"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar todas</span>
              </button>
            )}
            
            {/* Botón cerrar solo en móvil */}
            <button
              onClick={onClose}
              className="md:hidden p-2 -mr-2 text-white/80 hover:text-white active:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Subtítulo solo en móvil */}
          <p className="text-xs text-white/80 mt-2 sm:hidden">
            {unreadCount === 0 
              ? "No tienes notificaciones sin leer" 
              : `Tienes ${unreadCount} notificacion${unreadCount !== 1 ? 'es' : ''} sin leer`}
          </p>
        </div>

        {/* Filtros con fondo más notorio */}
        <div className="flex-shrink-0 sticky top-[73px] md:top-[73px] bg-gray-50 z-10 px-4 md:px-5 pt-4 pb-3 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`relative flex-1 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === "all"
                  ? "bg-[#B47B65] text-white shadow-md shadow-[#B47B65]/30"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-1">
                Todas
                <span className="text-xs opacity-80">({notifications.length})</span>
              </span>
              {filter === "all" && (
                <span className="absolute inset-0 bg-[#B47B65] rounded-xl animate-in fade-in duration-200" />
              )}
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`relative flex-1 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                filter === "unread"
                  ? "bg-[#B47B65] text-white shadow-md shadow-[#B47B65]/30"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>No leídas</span>
              {unreadCount > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold transition-colors ${
                  filter === "unread" 
                    ? "bg-white text-[#B47B65]" 
                    : "bg-red-500 text-white"
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Lista de notificaciones - Scroll container corregido */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto min-h-0"
        >
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[300px]">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Bell className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-600 text-center font-medium">
                No hay notificaciones {filter === "unread" ? "sin leer" : ""}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {filter === "unread" 
                  ? "Todas tus notificaciones están leídas" 
                  : "Las nuevas notificaciones aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((n, index) => (
                <div
                  key={n.id}
                  onClick={() => onNotificationClick(n.id)}
                  className={`group relative flex items-start gap-3 px-4 md:px-5 py-4 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 cursor-pointer ${
                    n.read 
                      ? "bg-white" 
                      : "bg-amber-50/50 border-l-4 border-l-amber-400"
                  }`}
                  style={{
                    animation: `slideDownItem 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`
                  }}
                >
                  {/* Icono lateral izquierdo más visible */}
                  <div className="flex-shrink-0 mt-0.5">
                    {!n.read ? (
                      <div className="relative">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Contenido con mejor contraste */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${
                        n.read ? "text-gray-700" : "text-gray-900"
                      }`}>
                        {n.title}
                      </p>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${
                      n.read ? "text-gray-600" : "text-gray-800"
                    }`}>
                      {n.message}
                    </p>
                  </div>

                  {/* Efecto hover más notorio */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/0 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes slideDownItem {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoomIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: fadeIn 0.2s ease-out, zoomIn 0.2s ease-out;
        }
        
        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        .zoom-in {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}