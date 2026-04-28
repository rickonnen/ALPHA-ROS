"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import Image from "next/image";
import { triggerNotificationUpdate } from "@/components/hooks/useNotificationUpdates";

type Props = {
  id: string;  // ← ahora
  title: string;
  description: string;
  read: boolean;
  time?: string;

  type?: string | number;
  onDelete: (id: number) => void;
  onRead: (id: number) => void;
};

function getTypeString(type: string | number | undefined): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'number') {
    switch(type) {
      case 1: return "gmail";
      case 2: return "whatsapp";
      case 3: return "general";
      default: return "general";
    }
  }
  return "general";
}

function getTypeIcon(type: string | number | undefined) {
  const typeStr = getTypeString(type);
  
  switch(typeStr) {
    case "gmail":
      return (
        <Image
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg"
          alt="Gmail"
          width={18}
          height={18}
          className="brightness-0 invert"
        />
      );
    case "whatsapp":
      return (
        <Image
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
          alt="WhatsApp"
          width={18}
          height={18}
          className="brightness-0 invert"
        />
      );
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function getTypeColor(type: string | number | undefined) {
  const typeStr = getTypeString(type);
  
  switch(typeStr) {
    case "gmail": return "bg-red-500";
    case "whatsapp": return "bg-green-500";
    case "general": return "bg-blue-500";
    default: return "bg-gray-500";
  }
}

export function NotificationItem({ 
  id, 
  title, 
  description, 
  read, 
  time = "ahora", 
  type = "general",
  onDelete, 
  onRead 
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [description]);

  // Función para obtener el número de teléfono del usuario
  const getUserPhoneNumber = (): string | null => {
    // Primero intentar obtener del localStorage
    const savedPhone = localStorage.getItem("user_whatsapp_number");
    if (savedPhone) return savedPhone;
    
    // Si no hay, usar un número de prueba (reemplaza con tu número)
    // Formato: código de país + número (ej: +59171234567)
    const testPhone = process.env.NEXT_PUBLIC_TEST_WHATSAPP_NUMBER;
    if (testPhone) return testPhone;
    
    // Número por defecto para pruebas (CAMBIA ESTO POR TU NÚMERO)
    return "+59170000000"; // <-- CAMBIA ESTE NÚMERO POR EL TUYO
  };

  // Función para enviar mensaje de WhatsApp
  const sendWhatsAppMessage = async () => {
    if (isSendingWhatsApp) return;
    
    setIsSendingWhatsApp(true);
    try {
      const userPhone = getUserPhoneNumber();
      
      if (!userPhone) {
        console.error("No se encontró número de teléfono del usuario");
        alert("Por favor, configura tu número de teléfono en la configuración");
        return;
      }

      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userPhone,
          message: `📢 *${title}*\n\n${description}\n\nPara más información, ingresa a la plataforma.`,
          notificationId: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Mensaje de WhatsApp enviado exitosamente:", data);
        alert("✅ Mensaje de WhatsApp enviado correctamente");
      } else {
        console.error("Error al enviar mensaje de WhatsApp:", data.error);
        alert(`❌ Error: ${data.error || "No se pudo enviar el mensaje"}`);
      }
    } catch (error) {
      console.error("Error en sendWhatsAppMessage:", error);
      alert("❌ Error de conexión al enviar mensaje de WhatsApp");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(id);
      triggerNotificationUpdate();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!read && !isMarkingRead) {
      setIsMarkingRead(true);
      try {
        await onRead(id);
        triggerNotificationUpdate();
      } finally {
        setIsMarkingRead(false);
      }
    }
  };

  const handleItemClick = async () => {
    // Solo procesar si no está leída
    if (!read && !isMarkingRead) {
      setIsMarkingRead(true);
      try {
        // Primero marcar como leída
        await onRead(id);
        
        // Si es de tipo WhatsApp, enviar mensaje
        const typeStr = getTypeString(type);
        if (typeStr === "whatsapp") {
          await sendWhatsAppMessage();
        }
        
        triggerNotificationUpdate();
      } catch (error) {
        console.error("Error en handleItemClick:", error);
      } finally {
        setIsMarkingRead(false);
      }
    }
  };

  const typeColor = getTypeColor(type);
  const typeIcon = getTypeIcon(type);
  const typeStr = getTypeString(type);
  const isWhatsApp = typeStr === "whatsapp";

  return (
    <div 
      onClick={handleItemClick}
      className={`rounded-lg p-3 flex items-start gap-3 max-w-[99%] mx-auto cursor-pointer transition-colors group relative
        ${read ? "bg-[#9EA5AE]/20" : "bg-blue-50 border border-blue-100"}`}
    >
      <div
        className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full ${typeColor} text-white`}
      >
        {typeIcon}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`text-[15px] leading-[120%] truncate
            ${read ? "font-medium text-gray-600" : "font-black text-black"}`}
        >
          {title}
          {isWhatsApp && !read && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              WhatsApp
            </span>
          )}
        </span>

        <p
          ref={textRef}
          className={`text-gray-500 text-[13px] font-medium leading-5 break-words ${!expanded ? "line-clamp-1" : ""}`}
        >
          {description}
        </p>

        {isTruncated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="text-blue-500 text-[12px] font-medium text-left hover:underline w-fit mt-0.5"
          >
            {expanded ? "Ocultar" : "Ver más"}
          </button>
        )}

        <span className="text-gray-400 text-xs mt-1">{time}</span>
      </div>

      <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!read && (
          <button
            onClick={handleRead}
            disabled={isMarkingRead || isSendingWhatsApp}
            className="w-7 h-7 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
            title="Marcar como leída"
          >
            <CheckCheck size={15} />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Eliminar notificación"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Indicador de envío de WhatsApp */}
      {isWhatsApp && !read && isSendingWhatsApp && (
        <div className="absolute bottom-1 right-1">
          <div className="text-xs text-green-600 animate-pulse bg-white px-2 py-1 rounded-full shadow">
            Enviando WhatsApp...
          </div>
        </div>
      )}
    </div>
  );
}
    
