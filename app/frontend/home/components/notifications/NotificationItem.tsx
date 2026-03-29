"use client";

import { Mail } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export function NotificationItem({ title, description }: Props) {
  return (
    <div className="bg-[#9EA5AE]/30 rounded-lg p-3 flex items-center gap-3">

      {/* Icono */}
      <div className="w-8 h-8 flex items-center justify-center text-black">
        <Mail size={18} />
      </div>

      {/* Texto */}
      <div className="flex flex-col">

        {/* TÍTULO */}
        <span className="text-black text-[16px] font-black leading-[120%]">
          {title}
        </span>

        {/* DESCRIPCIÓN */}
        <span className="text-gray-700 text-[14px] font-medium leading-5">
          {description}
        </span>

        {/* TIEMPO */}
        <span className="text-gray-500 text-xs">
          ahora
        </span>

      </div>

    </div>
  );
}