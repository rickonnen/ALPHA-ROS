"use client";

export default function NotificacionesUI({ notificaciones }: { notificaciones: any[] }) {
  return (
    <div className="fixed top-5 right-5 space-y-2 z-50">
      {notificaciones.slice(0, 3).map((n) => (
        <div
          key={n.id}
          className="bg-white text-[#2E2E2E] px-4 py-3 rounded-lg shadow-md w-72 border"
        >
          <p className="font-semibold text-sm">{n.title}</p>
          <p className="text-xs text-gray-600">{n.message}</p>
        </div>
      ))}
    </div>
  );
}