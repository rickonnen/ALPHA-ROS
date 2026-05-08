import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TrackPlacePayload {
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

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackPlacePayload;
    const id_usuario = getUserIdFromToken(request);

    if (!id_usuario) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    if (!body.mapbox_id || !body.name) {
      return NextResponse.json({ success: false, message: 'mapbox_id y name son requeridos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('HistorialBusqueda').insert({
      id_usuario,
      session_id: id_usuario,
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
