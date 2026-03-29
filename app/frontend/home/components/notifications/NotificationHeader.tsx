"use client";

interface Props {
  total: number;
}

export function NotificationHeader({ total }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#2C4A5A] text-white rounded-t-md ">
      
      {/* Título */}
      <h4 className="text-[20px] font-normal leading-[120%] tracking-normal">
        Notificaciones
      </h4>

      {/* Contador */}
      <span className="text-xs font-medium bg-blue-500 px-2 py-0.5 rounded">
        {total}
      </span>

    </div>
  );
}