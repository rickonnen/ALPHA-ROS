"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, RotateCcw } from "lucide-react";
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

  switch (typeStr) {
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
  onRead,
  isInTrash = false,
  onRestore,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [description]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(id);
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
      } finally {
        setIsMarkingRead(false);
      }
    }
  };

  const handleItemClick = async () => {
    if (read || isMarkingRead) return;

    setIsMarkingRead(true);

    try {
      onRead(id);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const typeColor = getTypeColor(type);
  const typeIcon = getTypeIcon(type);
  const typeStr = getTypeString(type);
  const isWhatsApp = typeStr === "whatsapp";

  return (
    <div
      data-notification-item
      onClick={handleItemClick}
      className={`rounded-lg p-3 flex items-start gap-3 max-w-[99%] mx-auto cursor-pointer transition-all duration-200 group relative border
        ${read
          ? "bg-white border-gray-100 shadow-sm"
          : "bg-gray-100 border-gray-200"
        }`}
    >
      {/* ICON */}
      <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full ${typeColor} text-white`}>
        {typeIcon}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-[15px] leading-[120%] truncate
          ${read ? "font-medium text-gray-600" : "font-black text-black"}`}>
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

      {/* ACTIONS */}
<div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  {isInTrash ? (
    <button
      onClick={(e) => { e.stopPropagation(); onRestore?.(id); }}
      className="w-7 h-7 flex items-center justify-center rounded-full text-green-500 hover:bg-green-50 transition-colors"
      title="Restaurar notificación"
    >
      <RotateCcw size={15} />
    </button>
  ) : (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Eliminar notificación"
    >
      <Trash2 size={15} />
    </button>
  )}
</div>
    </div>
  );
}