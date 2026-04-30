import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseHome } from "@/lib/supabaseHome";
import { VALID_OPERATIONS, TOP_CITIES_LIMIT } from "@/components/homeComponents/top-cities/constants";
import type { OperationType, CityImage, ReporteRow } from "@/components/homeComponents/top-cities/types";
 
/**
 * @Dev: Rodrigo Chalco
 */
 
export const revalidate = 86_400; // ISR: revalidar cada 24h
 
// Map estático de columnas → evita interpolación dinámica en SQL
const COLUMN_MAP: Record<OperationType, keyof ReporteRow> = {
  venta:        "venta",
  alquiler:     "alquiler",
  anticretico:  "anticretico",
};
 
export async function GET(objRequest: NextRequest) {
  const strOperacion =
    (objRequest.nextUrl.searchParams.get("operacion") as OperationType) ?? "venta";
 
  if (!VALID_OPERATIONS.includes(strOperacion)) {
    return NextResponse.json({ error: "Operación no válida" }, { status: 400 });
  }
 
  try {
  
    const arrReporte = await prisma.$queryRawUnsafe<ReporteRow[]>(
      `SELECT id, departamento, alquiler, venta, anticretico
       FROM "ReporteInmuebles"
       ORDER BY "${strOperacion}" DESC
       LIMIT ${TOP_CITIES_LIMIT * 3}`,
      // traemos más filas por si las primeras no tienen imágenes en Supabase
    );
 
    if (!arrReporte || arrReporte.length === 0) {
      return NextResponse.json([]);
    }
 
    // ── 2. UNA sola query a Supabase con todas las ciudades del ranking 
    const arrCityNames = arrReporte.map((r) => r.departamento);
 
    const { data: arrAllImages, error } = await supabaseHome
      .from("city_images")
      .select("*")
      .in("city_name", arrCityNames)
      .eq("is_active", true)
      .order("order", { ascending: true });
 
    if (error) {
      console.error("[top-cities] Error al obtener imágenes:", error.message);
      return NextResponse.json([]);
    }
 
    // 3. Agrupar imágenes por ciudad en memoria 
    const imagesByCity = (arrAllImages as CityImage[]).reduce<
      Record<string, CityImage[]>
    >((acc, img) => {
      if (!acc[img.city_name]) acc[img.city_name] = [];
      acc[img.city_name].push(img);
      return acc;
    }, {});
 
    // ── 4. Primeras 3 ciudades que tengan imágenes ───────────────────────────
    const arrResult = arrReporte
      .filter((row) => (imagesByCity[row.departamento]?.length ?? 0) > 0)
      .slice(0, TOP_CITIES_LIMIT)
      .map((row) => ({
        strDepartamento: row.departamento,
        intContador:     row[COLUMN_MAP[strOperacion]] as number,
        arrImagenes:     imagesByCity[row.departamento].map((img) => ({
          strUrl:      img.image_url,
          strAlt:      img.alt_text,
          strPublicId: img.public_id,
        })),
      }));
 
    return NextResponse.json(arrResult, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (objError) {
    console.error("[top-cities] Error inesperado:", objError);
    return NextResponse.json(
      { error: "Error al obtener las ciudades más buscadas" },
      { status: 500 },
    );
  }
}