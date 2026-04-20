import { NextResponse } from "next/server";

type NotificationType = "gmail" | "whatsapp" | "general";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}

interface UserSettings {
  gmailEnabled: boolean;
  whatsappEnabled: boolean;
  gmailEmail: string;
  whatsappNumber: string;
}

let userSettings: UserSettings = {
  gmailEnabled: true,
  whatsappEnabled: true,
  gmailEmail: "usuario@gmail.com",
  whatsappNumber: "+591 73678412"
};

let notifications: Notification[] = [
  {
    id: 8,
    title: "COMPRA EXITOSA",
    message: "Adquiriste el plan profesional exitosamente!!",
    read: false,
    type: "gmail",
    createdAt: "2026-04-07T19:30:00Z"
  },
  {
    id: 7,
    title: "Nuevo mensaje",
    message: "Un agente quiere contactarse contigo acerca de una nueva propiedad de tu interés",
    read: false,
    type: "whatsapp",
    createdAt: "2026-04-07T13:10:00Z"
  },
  {
    id: 6,
    title: "Recordatorio",
    message: "Tienes una nueva cita agendada para mañana, a las 8am en el centro de la ciudad",
    read: false,
    type: "general",
    createdAt: "2026-04-07T09:30:00Z"
  },
  {
    id: 5,
    title: "Mensaje inmobiliario",
    message: "Nueva propiedad disponible en tu zona",
    read: false,
    type: "general",
    createdAt: "2026-04-06T18:00:00Z"
  },
  {
    id: 4,
    title: "Pago recibido",
    message: "Se ha recibido un pago exitosamente por un monto de Bs. 900. El dinero ya se encuentra disponible.",
    read: false,
    type: "gmail",
    createdAt: "2026-04-06T12:00:00Z"
  },
  {
    id: 3,
    title: "Nuevo favorito",
    message: "*Agente:* Roberto C Anuncio:Propiedad registrada exitosamente _2026-04-05 11:10_ ",
    read: false,
    type: "whatsapp",
    createdAt: "2026-04-05T20:00:00Z"
  },
  {
    id: 2,
    title: "Mensaje inmobiliario",
    message: "Un agente ha actualizado los detalles de una propiedad que tienes guardada",
    read: false,
    type: "general",
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: 1,
    title: "Bienvenido",
    message: "Tu cuenta ha sido creada exitosamente. ¡Bienvenido a la plataforma!",
    read: false,
    type: "general",
    createdAt: "2026-04-01T08:00:00Z"
  }
];

interface ApiResponse {
  notifications: Notification[];
  settings?: UserSettings;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeSettings = searchParams.get("settings") === "true";
  
  const response: ApiResponse = { notifications };
  
  if (includeSettings) {
    response.settings = userSettings;
  }
  
  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId, settings } = body;
    
    if (action === "updateSettings" && settings) {
      userSettings = {
        ...userSettings,
        ...settings
      };
      return NextResponse.json({ success: true, settings: userSettings });
    }
    
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
    console.error("Error en PATCH:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }
    
    const notificationId = parseInt(id);
    notifications = notifications.filter(n => n.id !== notificationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });


  }

}