import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
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
  id_publicacion: number;
  tipo_evento: TipoEvento;
  duracion_ms?: number;
  scroll_depth_pct?: number;
  posicion_card?: number;
  dispositivo?: 'desktop' | 'mobile' | 'tablet';
  pagina_origen?: string;
}

function getSessionIdOrCreate(request: NextRequest): { sessionId: string; isNew: boolean } {
  const existing = request.cookies.get('session_id')?.value;
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: crypto.randomUUID(), isNew: true };
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
    const body = (await request.json()) as TrackEventPayload;
    const { sessionId: session_id, isNew } = getSessionIdOrCreate(request);
    const id_usuario = getUserIdFromToken(request);

    if (!body.id_publicacion || !body.tipo_evento) {
      return NextResponse.json({ success: false, message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('InteraccionEvento').insert({
      id_usuario: id_usuario ?? null,
      session_id,
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

    if (id_usuario && session_id) {
      await supabaseAdmin.rpc('migrar_eventos_sesion', {
        p_session_id: session_id,
        p_id_usuario: id_usuario,
      });
    }

    const response = NextResponse.json({ success: true });
    if (isNew) {
      response.cookies.set('session_id', session_id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    console.error('[tracking/event] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
