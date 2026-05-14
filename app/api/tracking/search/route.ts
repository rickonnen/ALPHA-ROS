import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TrackSearchPayload {
  id_usuario: string;
  id_ciudad?: number;
  id_zona?: number;
  texto_calle?: string;
  lat_centro?: number;
  lng_centro?: number;
  radio_km?: number;
  id_tipo_operacion?: number;
  id_tipo_inmueble?: number;
  precio_min?: number;
  precio_max?: number;
  id_moneda?: number;
  superficie_min?: number;
  superficie_max?: number;
  habitaciones?: number;
  banos?: number;
  garajes?: number;
  cant_resultados?: number;
  texto_busqueda?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackSearchPayload;

    // Validate required field
    if (!body.id_usuario) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: id_usuario' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('BusquedaLog').insert({
      id_usuario: body.id_usuario,
      session_id: body.id_usuario,
      id_ciudad: body.id_ciudad ?? null,
      id_zona: body.id_zona ?? null,
      texto_calle: body.texto_calle ?? null,
      lat_centro: body.lat_centro ?? null,
      lng_centro: body.lng_centro ?? null,
      radio_km: body.radio_km ?? null,
      id_tipo_operacion: body.id_tipo_operacion ?? null,
      id_tipo_inmueble: body.id_tipo_inmueble ?? null,
      precio_min: body.precio_min ?? null,
      precio_max: body.precio_max ?? null,
      id_moneda: body.id_moneda ?? null,
      superficie_min: body.superficie_min ?? null,
      superficie_max: body.superficie_max ?? null,
      habitaciones: body.habitaciones ?? null,
      banos: body.banos ?? null,
      garajes: body.garajes ?? null,
      cant_resultados: body.cant_resultados ?? null,
      texto_busqueda: body.texto_busqueda ?? null,
    });

    if (error) {
      console.error('[tracking/search] Supabase error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[tracking/search] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
