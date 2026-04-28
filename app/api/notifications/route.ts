import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type NotificationType = "gmail" | "whatsapp" | "general";

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

export async function GET(request: Request) {
  console.log("📡 API GET /api/notifications - Iniciando...");
  
  const { searchParams } = new URL(request.url);
  const includeSettings = searchParams.get("settings") === "true";
  const userId = searchParams.get("userId");
  
  try {
    if (!supabase) {
      console.error("❌ Supabase no está inicializado");
      return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
    }

    console.log("Consultando tabla: notificacion_campana");
    
    let query = supabase
      .from('notificacion_campana')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: notifications, error } = await query;

    if (error) {
      console.error("❌ Error de Supabase:", error);
      return NextResponse.json({ 
        error: "Error al cargar notificaciones",
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Notificaciones obtenidas: ${notifications?.length || 0}`);

    const response: any = { notifications: notifications || [] };
    
    if (includeSettings) {
      response.settings = userSettings;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error inesperado en GET:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  console.log("📡 API PATCH /api/notifications - Iniciando...");
  
  try {
    const body = await request.json();
    console.log("Body recibido:", body);
    
    const { action, notificationId, settings, userId } = body;
    
    if (action === "updateSettings" && settings) {
      userSettings = {
        ...userSettings,
        ...settings
      };
      console.log("Settings actualizados:", userSettings);
      return NextResponse.json({ success: true, settings: userSettings });
    }
    
    if (action === "markAllAsRead") {
      console.log("Marcando todas como leídas...");
      
      let query = supabase
        .from('notificacion_campana')
        .update({ read: true })
        .eq('read', false);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.select();

      if (error) {
        console.error("Error marcando todas como leídas:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`✅ Marcadas como leídas: ${data?.length || 0} notificaciones`);
      return NextResponse.json({ success: true });
    }
    
    if (action === "markAsRead" && notificationId) {
      console.log(`Marcando notificación ${notificationId} como leída...`);
      
      let query = supabase
        .from('notificacion_campana')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.select();

      if (error) {
        console.error(`Error marcando notificación ${notificationId}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`✅ Notificación ${notificationId} marcada como leída`);
      return NextResponse.json({ success: true });
    }
    
    console.log("Acción no válida:", action);
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("❌ Error en PATCH:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  console.log("📡 API DELETE /api/notifications - Iniciando...");
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    
    if (!id) {
      console.log("❌ ID no proporcionado");
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }
    
    const notificationId = parseInt(id);
    console.log(`Eliminando notificación ${notificationId}...`);
    
    let query = supabase
      .from('notificacion_campana')
      .delete()
      .eq('id', notificationId);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.select();

    if (error) {
      console.error(`Error eliminando notificación ${notificationId}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`✅ Notificación ${notificationId} eliminada`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en DELETE:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("📡 API POST /api/notifications - Iniciando...");
  
  try {
    const body = await request.json();
    console.log("Body recibido:", body);
    
    const { title, message, type, userId } = body;
    
    const insertData: any = {
      title,
      message,
      read: false,
      type,
      created_at: new Date().toISOString()
    };
    
    if (userId) {
      insertData.user_id = userId;
    }
    
    const { data, error } = await supabase
      .from('notificacion_campana')
      .insert([insertData])
      .select();

    if (error) {
      console.error("Error creando notificación:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Notificación creada:", data?.[0]);
    return NextResponse.json({ success: true, notification: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error("❌ Error en POST:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}