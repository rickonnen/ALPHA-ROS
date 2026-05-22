"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, RotateCcw, Check } from "lucide-react";
import Image from "next/image";

type Props = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  type?: string | number;
  onDelete: (id: string) => void;
  onRead: (id: string) => void;
  isInTrash?: boolean;
  onRestore?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
  hideCheckbox?: boolean;
};

function getTypeString(type: string | number | undefined): string {
  if (typeof type === "string") return type;
  if (typeof type === "number") {
    switch (type) {
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
  switch (typeStr) {
    case "gmail":
      return (
        <Image
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg"
          alt="Gmail" width={18} height={18}
          className="brightness-0 invert"
        />
      );
    case "whatsapp":
      return (
        <Image
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
          alt="WhatsApp" width={18} height={18}
          className="brightness-0 invert"
        />
      );
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function getTypeColor(type: string | number | undefined) {
  const typeStr = getTypeString(type);
  switch (typeStr) {
    case "gmail":    return "bg-red-500";
    case "whatsapp": return "bg-green-500";
    case "general":  return "bg-[#2C4A5A]";
    default:         return "bg-gray-500";
  }
}

export function NotificationItem({
  id, title, description, read,
  time = "ahora", type = "general",
  onDelete, onRead,
  isInTrash = false, onRestore,
  isSelected = false,
  onToggleSelect,
  selectionMode = false,
  hideCheckbox = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [description]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try { await onDelete(id); } finally { setIsDeleting(false); }
  };

  const handleItemClick = async () => {
    if (selectionMode) {
      onToggleSelect?.(id);
      return;
    }
    if (read || isMarkingRead) return;
    setIsMarkingRead(true);
    try { onRead(id); } finally { setIsMarkingRead(false); }
  };

  const typeColor = getTypeColor(type);
  const typeIcon = getTypeIcon(type);
  const typeStr = getTypeString(type);
  const isWhatsApp = typeStr === "whatsapp";

  return (
    <div
      data-notification-item
      onClick={handleItemClick}
      className={`rounded-lg p-2 md:p-3 flex items-start gap-2 md:gap-3 cursor-pointer transition-all duration-200 group relative border
        ${isSelected
          ? "bg-[#2C4A5A]/10 border-[#2C4A5A]/40 ring-1 ring-[#2C4A5A]/20"
          : read
            ? "bg-white border-gray-100 shadow-sm"
            : "bg-gray-100 border-gray-200"
        }`}
    >
      {/* ICON + selector debajo */}
      <div className="flex flex-col items-center gap-0.5 md:gap-1 shrink-0">
        <div className={`w-6 md:w-8 h-6 md:h-8 flex items-center justify-center rounded-full ${typeColor} text-white`}>
          {typeIcon}
        </div>
        {!hideCheckbox && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(id); }}
            className={`w-4 md:w-5 h-4 md:h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${isSelected
                ? "bg-[#2C4A5A] border-[#2C4A5A]"
                : "border-gray-300 bg-white hover:border-[#2C4A5A]"
              }`}
            title={isSelected ? "Deseleccionar" : "Seleccionar"}
          >
            {isSelected && <Check size={8} className="text-white" strokeWidth={3} />}
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-[13px] md:text-[15px] leading-[120%] truncate
          ${read ? "font-medium text-gray-600" : "font-black text-black"}`}>
          {title}
          {isWhatsApp && !read && (
            <span className="ml-1 md:ml-2 text-xs bg-green-100 text-green-700 px-1.5 md:px-2 py-0.5 rounded-full">
              WhatsApp
            </span>
          )}
        </span>

        <p
          ref={textRef}
          className={`text-gray-500 text-[11px] md:text-[13px] font-medium leading-4 md:leading-5 wrap-break-word ${!expanded ? "line-clamp-1" : ""}`}
        >
          {description}
        </p>

        {isTruncated && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev); }}
            className="text-[#2C4A5A] text-[10px] md:text-[12px] font-medium text-left hover:underline w-fit mt-0.5"
          >
            {expanded ? "Ocultar" : "Ver más"}
          </button>
        )}

        <span className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1">{time}</span>
      </div>

      {/* ACTIONS */}
      {!selectionMode && (
        <div className="shrink-0 flex gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isInTrash ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRestore?.(id); }}
              className="w-6 md:w-7 h-6 md:h-7 flex items-center justify-center rounded-full text-green-500 hover:bg-green-50 transition-colors"
              title="Restaurar notificación"
            >
              <RotateCcw size={13} className="md:w-4 md:h-4" />
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-6 md:w-7 h-6 md:h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Eliminar notificación"
            >
              <Trash2 size={13} className="md:w-4 md:h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}