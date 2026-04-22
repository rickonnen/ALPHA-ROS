import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseHome } from "@/lib/supabaseHome";

/**
 * @Dev: Rodrigo Chalco
 * GET /api/home/top-cities?operacion=venta|alquiler|anticretico
 */
export const dynamic = 'force-dynamic';
export const revalidate = 86400;

type OperationType = "venta" | "alquiler" | "anticretico";

interface CityImage {
  id: number;
  city_name: string;
  image_url: string;
  alt_text: string;
  order: number;
  is_active: boolean;
  public_id: string;
}

interface ReporteRow {
  id: number;
  departamento: string;
  alquiler: number;
  venta: number;
  anticretico: number;
}

export async function GET(objRequest: NextRequest) {
  try {
    const strOperacion =
      (objRequest.nextUrl.searchParams.get("operacion") as OperationType) ??
      "venta";

    const arrValidOps: OperationType[] = ["venta", "alquiler", "anticretico"];
    if (!arrValidOps.includes(strOperacion)) {
      return NextResponse.json(
        { error: "Operación no válida" },
        { status: 400 }
      );
    }

    // ── 1. Top ciudades ordenadas por operación (Arreglado con queryRawUnsafe) ────
    // Usamos queryRawUnsafe porque el nombre de la columna es dinámico
    const arrReporte = await prisma.$queryRawUnsafe<ReporteRow[]>(
      `SELECT id, departamento, alquiler, venta, anticretico 
       FROM "ReporteInmuebles" 
       ORDER BY "${strOperacion}" DESC`
    );

    if (!arrReporte || arrReporte.length === 0) {
      return NextResponse.json([]);
    }

    // ── 2. Para cada ciudad del ranking busca imágenes en Supabase home ───
    const arrResult = [];

    for (const objRow of arrReporte) {
      if (arrResult.length >= 3) break;

      const { data: arrImages, error } = await supabaseHome
        .from("city_images")
        .select("*")
        .eq("city_name", objRow.departamento)
        .eq("is_active", true)
        .order("order", { ascending: true });

      if (error || !arrImages || arrImages.length === 0) {
        continue;
      }

      arrResult.push({
        strDepartamento: objRow.departamento,
        intContador: objRow[strOperacion],
        arrImagenes: (arrImages as CityImage[]).map((objImg) => ({
          strUrl: objImg.image_url,
          strAlt: objImg.alt_text,
          strPublicId: objImg.public_id,
        })),
      });
    }

    return NextResponse.json(arrResult);
  } catch (objError) {
    console.error("[top-cities] Error detallado:", objError);
    return NextResponse.json(
      { error: "Error al obtener las ciudades más buscadas" },
      { status: 500 }
    );
  }
}