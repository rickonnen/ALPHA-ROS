"use client";

interface Props {
  total: number;
}

export function NotificationHeader({ total }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#2C4A5A] text-white rounded-t-md">
      <h4 className="text-[20px] font-normal leading-[120%] tracking-normal">
        Notificaciones
      </h4>
      <span className="text-sm font-medium">
        {total}
      </span>
    </div>
  );
}