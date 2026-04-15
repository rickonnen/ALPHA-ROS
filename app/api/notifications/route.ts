import { NextResponse } from "next/server";

let notifications =
 [
  {
    id: 8,
    title: "COMPRA EXITOSA",
    message: "Adquiriste el plan profesional exitosamente!!",
    read: false,
    createdAt: "2026-04-07T19:30:00Z"
  },
  {
    id: 7,
    title: "Nuevo mensaje",
    message: "Un agente quiere contactarse contigo acerca de una nueva propiedad de tu interés",
    read: false,
    createdAt: "2026-04-07T13:10:00Z"
  },
  {
    id: 6,
    title: "Recordatorio",
    message: "Tienes una nueva cita agendada para mañana, a las 8am en el centro de la ciudad",
    read: false,
    createdAt: "2026-04-07T09:30:00Z"
  },
  {
    id: 5,
    title: "Mensaje inmobiliario",
    message: "Nueva propiedad disponible en tu zona",
    read: false,
    createdAt: "2026-04-06T18:00:00Z"
  },
  {
    id: 4,
    title: "Pago recibido",
    message: "Se ha recibido un pago exitosamente por un monto de Bs. 900. El dinero ya se encuentra disponible.",
    read: false,
    createdAt: "2026-04-06T12:00:00Z"
  },
  {
    id: 3,
    title: "Nuevo favorito",
    message: "Alguien guardó tu propiedad",
    read: false,
    createdAt: "2026-04-05T20:00:00Z"
  },
  {
    id: 2,
    title: "Mensaje inmobiliario",
    message: "Un agente ha actualizado los detalles de una propiedad que tienes guardada",
    read: false,
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: 1,
    title: "Bienvenido",
    message: "Tu cuenta ha sido creada exitosamente. ¡Bienvenido a la plataforma!",
    read: false,
    createdAt: "2026-04-01T08:00:00Z"
  }
]

export async function GET() {
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;
    
    if (action === "markAllAsRead") {
      notifications = notifications.map(n => ({ ...n, read: true }));
      return NextResponse.json({ success: true, notifications });
    }
    
    if (action === "markAsRead" && notificationId) {
      notifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      return NextResponse.json({ success: true, notifications });
    }
    
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}