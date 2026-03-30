"use client";
import { Mail, Trash2 } from "lucide-react";

type Props = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  onDelete: (id: number) => void;
  onRead: (id: number) => void;
};

export function NotificationItem({
  id,
  title,
  description,
  read,
  time = "ahora",
  onDelete,
  onRead,
}: Props) {
  return (
    <div
      onClick={() => onRead(id)}
      className={`rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors group relative
        ${read ? "bg-[#9EA5AE]/20" : "bg-blue-50 border border-blue-100"}`}
    >
      {/* Ícono mail */}
      <div
        className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full
          ${read ? "text-gray-400 bg-gray-100" : "text-blue-600 bg-blue-100"}`}
      >
        <Mail size={16} />
      </div>

      {/* Texto */}
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`text-[15px] leading-[120%] truncate
            ${read ? "font-medium text-gray-600" : "font-black text-black"}`}
        >
          {title}
        </span>
        <span className="text-gray-500 text-[13px] font-medium leading-5 truncate">
          {description}
        </span>
        <span className="text-gray-400 text-xs mt-0.5">{time}</span>
      </div>

      {/* Botón eliminar — basurero */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
          w-7 h-7 flex items-center justify-center rounded-full
          text-gray-400 hover:text-red-500 hover:bg-red-50"
        title="Eliminar notificación"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}