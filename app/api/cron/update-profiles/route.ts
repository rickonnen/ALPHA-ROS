import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    console.log('[cron/update-profiles] Iniciando recálculo de perfiles...');
    const start = Date.now();

    const { error } = await supabaseAdmin.rpc('calcular_perfiles_preferencias');

    if (error) {
      console.error('[cron/update-profiles] Error en RPC:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const duration = Date.now() - start;
    console.log(`[cron/update-profiles] Completado en ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/update-profiles] Error inesperado:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}