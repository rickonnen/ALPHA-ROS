import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseHome } from "@/lib/supabaseHome";

/**
 * @Dev: Rodrigo Chalco
 * GET /api/home/top-cities?operacion=venta|alquiler|anticretico
 *
 * Cache: ISR de 24 horas por tipo de operación.
 * La primera visita del día ejecuta las queries y guarda el resultado.
 * Las siguientes 24 horas devuelven el resultado cacheado sin tocar las bases.
 * Pasadas las 24 horas, la siguiente visita actualiza el cache.
 */

type OperationType = "venta" | "alquiler" | "anticretico";

interface CityImage {
  id:          number;
  city_name:   string;
  image_url:   string;
  alt_text:    string;
  order:       number;
  is_active:   boolean;
  public_id:   string;
  description: string;
}

interface ReporteRow {
  id:           number;
  departamento: string;
  alquiler:     number;
  venta:        number;
  anticretico:  number;
}

const getTopCities = unstable_cache(
  async (strOperacion: OperationType) => {
    const arrReporte = await prisma.$queryRawUnsafe<ReporteRow[]>(
      `SELECT id, departamento, alquiler, venta, anticretico 
       FROM "ReporteInmuebles" 
       ORDER BY "${strOperacion}" DESC`,
    );

    if (!arrReporte || arrReporte.length === 0) return [];

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
        intContador:     objRow[strOperacion],
        strDescription:  (arrImages as CityImage[])[0]?.description ?? "",
        arrImagenes: (arrImages as CityImage[]).map((objImg) => ({
          strUrl:      objImg.image_url,
          strAlt:      objImg.alt_text,
          strPublicId: objImg.public_id,
        })),
      });
    }

    return arrResult;
  },
  ["top-cities"], // clave base del cache
  { revalidate: 86400 } // 24 horas
);

export async function GET(objRequest: NextRequest) {
  try {
    const strOperacion =
      (objRequest.nextUrl.searchParams.get("operacion") as OperationType) ?? "venta";

    const arrValidOps: OperationType[] = ["venta", "alquiler", "anticretico"];
    if (!arrValidOps.includes(strOperacion)) {
      return NextResponse.json({ error: "Operación no válida" }, { status: 400 });
    }

    // Llama a la función cacheada — Next.js maneja el cache automáticamente
    const arrResult = await getTopCities(strOperacion);

    return NextResponse.json(arrResult);
  } catch (objError) {
    console.error("[top-cities] Error detallado:", objError);
    return NextResponse.json(
      { error: "Error al obtener las ciudades más buscadas" },
      { status: 500 },
    );
  }
}