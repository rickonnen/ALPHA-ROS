import { NextResponse } from "next/server";
import notifications from "@/app/backend/notifications/notifications.json";
import fs from "fs";
import path from "path";

// Ruta al archivo JSON
const notificationsPath = path.join(process.cwd(), "app/backend/notifications/notifications.json");

// Función para leer notificaciones actualizadas
const readNotifications = () => {
  const data = fs.readFileSync(notificationsPath, "utf-8");
  return JSON.parse(data);
};

// Función para escribir notificaciones
const writeNotifications = (data: any) => {
  fs.writeFileSync(notificationsPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const notifications = readNotifications();
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;
    
    let currentNotifications = readNotifications();
    
    if (action === "markAllAsRead") {
      // Marcar todas como leídas
      currentNotifications = currentNotifications.map((notif: any) => ({
        ...notif,
        read: true
      }));
      
      writeNotifications(currentNotifications);
      
      return NextResponse.json({ 
        success: true, 
        notifications: currentNotifications,
        message: "Todas las notificaciones marcadas como leídas"
      });
    }
    
    if (action === "markAsRead" && notificationId) {
      // Marcar una específica como leída
      currentNotifications = currentNotifications.map((notif: any) =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      );
      
      writeNotifications(currentNotifications);
      
      return NextResponse.json({ 
        success: true, 
        notifications: currentNotifications,
        message: "Notificación marcada como leída"
      });
    }
    
    return NextResponse.json(
      { error: "Acción no válida" },
      { status: 400 }
    );
    
  } catch (error) {
    console.error("Error en PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}