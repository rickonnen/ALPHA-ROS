import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  console.log("🧪 Testing Supabase connection...");
  
  try {
    // Primero, probar la conexión básica
    console.log("📡 Probando conexión a Supabase...");
    
    // Intentar obtener el conteo real sin 'head'
    const { data: allData, error: countError, count } = await supabase
      .from('notificacion_campana')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error("❌ Error de conexión:", countError);
      return NextResponse.json({
        success: false,
        error: countError.message,
        details: countError,
      });
    }

    console.log(`✅ Conexión exitosa! Total de registros: ${count}`);
    console.log(`📊 Datos obtenidos: ${allData?.length || 0} registros`);
    
    // Mostrar primeros 3 registros como muestra
    const sampleData = allData?.slice(0, 3) || [];

    return NextResponse.json({
      success: true,
      message: "Conexión a Supabase exitosa",
      totalRecords: count,
      sampleData: sampleData,
      allData: allData, // Opcional: enviar todos los datos para debug
    });
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}