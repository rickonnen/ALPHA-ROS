import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/features/filter_search_page/prismaClient';
import type { SearchPublicationResult } from '@/features/filter_search_page/services';
import { Prisma } from '@prisma/client';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === 'number' ? value : value.toNumber();
}

async function fetchPublicacionesByIds(
  ids: number[]
): Promise<SearchPublicationResult[]> {
  if (ids.length === 0) return [];

  const publications = await prisma.publicacion.findMany({
    where: { id_publicacion: { in: ids }, id_estado: 1 },
    include: {
      TipoInmueble: true,
      TipoOperacion: true,
      EstadoConstruccion: true,
      EstadoPublicacion: true,
      Moneda: true,
      Ubicacion: {
        include: { Ciudad: true, Pais: true },
      },
      Imagen: { orderBy: { id_imagen: 'asc' } },
      PublicacionCaracteristica: {
        include: { Caracteristica: true },
      },
    },
  });

  const indexMap = new Map(ids.map((id, i) => [id, i]));
  const sorted = [...publications].sort(
    (a, b) =>
      (indexMap.get(a.id_publicacion) ?? 999) -
      (indexMap.get(b.id_publicacion) ?? 999)
  );

  return sorted.map((p) => ({
    id_publicacion: p.id_publicacion,
    titulo: p.titulo,
    descripcion: p.descripcion,
    precio: toNumber(p.precio),
    superficie: toNumber(p.superficie),
    habitaciones: p.habitaciones,
    banos: p.banos,
    garajes: p.garajes,
    plantas: p.plantas,
    tipo_inmueble: p.TipoInmueble?.nombre_inmueble ?? null,
    tipo_operacion: p.TipoOperacion?.nombre_operacion ?? null,
    estado_construccion: p.EstadoConstruccion?.nombre_estado_construccion ?? null,
    estado_publicacion: p.EstadoPublicacion?.nombre_estado ?? null,
    moneda_nombre: p.Moneda?.nombre ?? null,
    moneda_simbolo: p.Moneda?.simbolo ?? null,
    moneda_tasa_cambio: toNumber(p.Moneda?.tasa_cambio),
    ubicacion: p.Ubicacion
      ? {
          direccion: p.Ubicacion.direccion,
          zona: p.Ubicacion.zona,
          ciudad: p.Ubicacion.Ciudad?.nombre_ciudad ?? null,
          pais: p.Ubicacion.Pais?.nombre_pais ?? null,
          latitud: toNumber(p.Ubicacion.latitud),
          longitud: toNumber(p.Ubicacion.longitud),
        }
      : null,
    imagenes: p.Imagen.map((img) => img.url_imagen).filter(
      (url): url is string => Boolean(url)
    ),
    caracteristicas: p.PublicacionCaracteristica.map(
      (pc) => pc.Caracteristica?.nombre_caracteristica
    ).filter((n): n is string => Boolean(n)),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset = Number(searchParams.get('offset') ?? 0);

    const id_usuario = getUserIdFromToken(request);

    if (!id_usuario) {
      const { data: globalRecs, error } = await supabaseAdmin.rpc(
        'get_recomendaciones_globales',
        { p_limit: limit, p_offset: offset }
      );

      if (error) throw error;

      const ids = (globalRecs as { id_publicacion: number }[]).map(
        (r) => r.id_publicacion
      );
      const publications = await fetchPublicacionesByIds(ids);

      return NextResponse.json({
        success: true,
        type: 'global',
        publications,
        total: publications.length,
      });
    }

    const { data: personalRecs, error } = await supabaseAdmin.rpc(
      'get_recomendaciones_personales',
      {
        p_id_usuario: id_usuario,
        p_limit: limit,
        p_offset: offset,
      }
    );

    if (error) throw error;

    if (!personalRecs || personalRecs.length === 0) {
      const { data: globalRecs, error: globalError } = await supabaseAdmin.rpc(
        'get_recomendaciones_globales',
        { p_limit: limit, p_offset: offset }
      );

      if (globalError) throw globalError;

      const ids = (globalRecs as { id_publicacion: number }[]).map(
        (r) => r.id_publicacion
      );
      const publications = await fetchPublicacionesByIds(ids);

      return NextResponse.json({
        success: true,
        type: 'global_fallback',
        publications,
        total: publications.length,
      });
    }

    const ids = (personalRecs as { id_publicacion: number; score: number }[]).map(
      (r) => r.id_publicacion
    );
    const publications = await fetchPublicacionesByIds(ids);

    return NextResponse.json({
      success: true,
      type: 'personal',
      publications,
      total: publications.length,
    });
  } catch (error) {
    console.error('[recommendations/personal] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener recomendaciones' },
      { status: 500 }
    );
  }
}