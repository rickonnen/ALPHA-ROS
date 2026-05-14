import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type TipoEvento =
  | 'view'
  | 'hover'
  | 'click'
  | 'detalle'
  | 'contacto'
  | 'favorito'
  | 'compartir'
  | 'ignorar'
  | 'descartar';

export interface TrackEventPayload {
  id_usuario: string;
  id_publicacion: number;
  tipo_evento: TipoEvento;
  duracion_ms?: number;
  scroll_depth_pct?: number;
  posicion_card?: number;
  dispositivo?: 'desktop' | 'mobile' | 'tablet';
  pagina_origen?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackEventPayload;

    // Validate required fields
    if (!body.id_usuario || !body.id_publicacion || !body.tipo_evento) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: id_usuario, id_publicacion, tipo_evento' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('InteraccionEvento').insert({
      id_usuario: body.id_usuario,
      session_id: body.id_usuario,
      id_publicacion: body.id_publicacion,
      tipo_evento: body.tipo_evento,
      duracion_ms: body.duracion_ms ?? null,
      scroll_depth_pct: body.scroll_depth_pct ?? null,
      posicion_card: body.posicion_card ?? null,
      dispositivo: body.dispositivo ?? null,
      pagina_origen: body.pagina_origen ?? null,
    });

    if (error) {
      console.error('[tracking/event] Supabase error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[tracking/event] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
