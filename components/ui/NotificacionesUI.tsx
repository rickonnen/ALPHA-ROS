"use client";

type NotificacionToast = {
  id: string | number;
  title: string;
  message: string;
};

export default function NotificacionesUI({ notificaciones }: { notificaciones: NotificacionToast[] }) {
  return (
    <div className="fixed top-5 right-5 space-y-2 z-50">
      {notificaciones.slice(0, 3).map((n) => (
        <div
          key={n.id}
          className="bg-white text-[#2E2E2E] px-4 py-3 rounded-lg shadow-md w-72 border [@media(prefers-color-scheme:dark)]:bg-[#333333] [@media(prefers-color-scheme:dark)]:text-[#EBEBEB] [@media(prefers-color-scheme:dark)]:border-[#1F1F1F]"
        >
          <p className="font-semibold text-sm">{n.title}</p>
          <p className="text-xs text-gray-600 [@media(prefers-color-scheme:dark)]:text-[#A3A3A3]">{n.message}</p>
        </div>
      ))}
    </div>
  );
}
