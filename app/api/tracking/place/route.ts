import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TrackPlacePayload {
  id_usuario: string;
  mapbox_id: string;
  name: string;
  full_name?: string;
  icon_url?: string;
  place_type?: string;
  id_ciudad?: number;
  id_zona?: number;
  id_busqueda_log?: number;
  cant_resultados?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackPlacePayload;

    // Validate required fields
    if (!body.id_usuario || !body.mapbox_id || !body.name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: id_usuario, mapbox_id, name' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('HistorialBusqueda').insert({
      id_usuario: body.id_usuario,
      session_id: body.id_usuario,
      mapbox_id: body.mapbox_id,
      name: body.name,
      full_name: body.full_name ?? null,
      icon_url: body.icon_url ?? null,
      place_type: body.place_type ?? null,
      id_ciudad: body.id_ciudad ?? null,
      id_zona: body.id_zona ?? null,
      id_busqueda_log: body.id_busqueda_log ?? null,
      cant_resultados: body.cant_resultados ?? null,
      hubo_click: false,
    });

    if (error) {
      console.error('[tracking/place] Supabase error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[tracking/place] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
