import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type TipoEvento =
  | 'view'
  | 'hover'
  | 'click'
  | 'detalle'
  | 'contacto'
  | 'favorito'
  | 'compartir'
  | 'ignorar'
  | 'descartar';

// Tope acumulativo: evita “burbuja” de repetir siempre lo mismo.
// 30 puntos permite que el perfil siga diferenciando preferencias sin saturar tan rÃ¡pido como 20.
const SCORE_CAP = 30;
const ITEM_SCORE_CAP = 12;

const EVENT_WEIGHTS: Record<TipoEvento, number> = {
  // Prioridades acordadas:
  // - favorito: máximo
  // - contacto: muy alto
  // - detalle/click: medio
  // - hover/view: bajo
  // - ignorar/descartar: resta
  favorito: 1.0,
  contacto: 0.9,
  detalle: 0.6,
  click: 0.45,
  compartir: 0.35,
  hover: 0.08,
  view: 0.03,
  ignorar: -0.1,
  descartar: -0.4,
};

function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === 'number' ? value : value.toNumber();
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

function addScore(map: Map<number, number>, key: number | null | undefined, delta: number): void {
  if (key == null) return;
  map.set(key, (map.get(key) ?? 0) + delta);
}

function capValue(value: number, cap: number): number {
  return Math.max(-cap, Math.min(cap, value));
}

function capScores(map: Map<number, number>, cap: number): Map<number, number> {
  const capped = new Map<number, number>();
  for (const [key, value] of map.entries()) {
    const v = capValue(value, cap);
    if (v !== 0) capped.set(key, v);
  }
  return capped;
}

function scaledPreference(map: Map<number, number>, key: number | null | undefined, cap: number): number {
  if (key == null) return 0;
  const raw = map.get(key) ?? 0;
  return raw / cap; // [-1..1]
}

function topKeys(map: Map<number, number>, limit: number): number[] {
  return [...map.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function mapToJson(map: Map<number, number>, limit: number): Record<string, number> {
  const entries = [...map.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => [String(key), Number(value.toFixed(4))] as const);

  return Object.fromEntries(entries);
}

async function loadPreferences(request: NextRequest) {
  const userId = getUserIdFromToken(request);

  if (!userId) {
    return {
      userId: null,
      prefOperacion: new Map<number, number>(),
      prefInmueble: new Map<number, number>(),
      prefCiudad: new Map<number, number>(),
      prefHabitaciones: new Map<number, number>(),
      prefBanos: new Map<number, number>(),
      prefPublicacion: new Map<number, number>(),
      desiredMinPrice: null as number | null,
      desiredMaxPrice: null as number | null,
      totalInteracciones: 0,
    };
  }

  const whereTracking = { id_usuario: userId };

  const [events, searches] = await Promise.all([
    prisma.interaccionEvento.findMany({
      where: whereTracking,
      take: 500,
      orderBy: { creado_en: 'desc' },
      select: {
        tipo_evento: true,
        duracion_ms: true,
        scroll_depth_pct: true,
          Publicacion: {
            select: {
              id_publicacion: true,
              id_tipo_operacion: true,
              id_tipo_inmueble: true,
              habitaciones: true,
              banos: true,
              precio: true,
              Ubicacion: { select: { id_ciudad: true } },
            },
          },
        },
    }),
    prisma.busquedaLog.findMany({
      where: whereTracking,
      take: 200,
      orderBy: { creado_en: 'desc' },
        select: {
          id_ciudad: true,
          id_tipo_operacion: true,
          id_tipo_inmueble: true,
          precio_min: true,
          precio_max: true,
          habitaciones: true,
          banos: true,
        },
      }),
    ]);

  const scoreOperacion = new Map<number, number>();
  const scoreInmueble = new Map<number, number>();
  const scoreCiudad = new Map<number, number>();
  const scoreHabitaciones = new Map<number, number>();
  const scoreBanos = new Map<number, number>();
  const scorePublicacion = new Map<number, number>();

  for (const event of events) {
    const tipo = event.tipo_evento as TipoEvento;
    let base = EVENT_WEIGHTS[tipo] ?? 0;

    if (tipo === 'hover') {
      const duration = event.duracion_ms ?? 0;
      base = duration > 0 && duration < 3000 ? 0.05 : duration >= 3000 ? 0.12 : 0.05;
    }

    const durationBoost =
      event.duracion_ms && event.duracion_ms > 0 ? Math.min(1, event.duracion_ms / 30000) * 0.1 : 0;
    const scrollBoost =
      event.scroll_depth_pct && event.scroll_depth_pct > 0 ? Math.min(1, event.scroll_depth_pct / 100) * 0.15 : 0;

    const delta = base + (tipo === 'hover' ? durationBoost : 0) + (tipo === 'detalle' ? scrollBoost : 0);
    if (delta === 0) continue;

    addScore(scoreOperacion, event.Publicacion.id_tipo_operacion, delta);
    addScore(scoreInmueble, event.Publicacion.id_tipo_inmueble, delta);
    addScore(scoreCiudad, event.Publicacion.Ubicacion?.id_ciudad, delta);
    addScore(scoreHabitaciones, event.Publicacion.habitaciones, delta * 0.5);
    addScore(scoreBanos, event.Publicacion.banos, delta * 0.4);
    addScore(scorePublicacion, event.Publicacion.id_publicacion, delta * 1.1);
  }

  let desiredMinPrice: number | null = null;
  let desiredMaxPrice: number | null = null;

  for (const search of searches) {
    addScore(scoreOperacion, search.id_tipo_operacion, 0.25);
    addScore(scoreInmueble, search.id_tipo_inmueble, 0.25);
    addScore(scoreCiudad, search.id_ciudad, 0.2);
    addScore(scoreHabitaciones, search.habitaciones, 0.1);
    addScore(scoreBanos, search.banos, 0.08);

    if (desiredMinPrice == null && search.precio_min != null) desiredMinPrice = toNumber(search.precio_min);
    if (desiredMaxPrice == null && search.precio_max != null) desiredMaxPrice = toNumber(search.precio_max);

    if (desiredMinPrice != null && desiredMaxPrice != null) break;
  }

  const prefOperacion = capScores(scoreOperacion, SCORE_CAP);
  const prefInmueble = capScores(scoreInmueble, SCORE_CAP);
  const prefCiudad = capScores(scoreCiudad, SCORE_CAP);
  const prefHabitaciones = capScores(scoreHabitaciones, SCORE_CAP);
  const prefBanos = capScores(scoreBanos, SCORE_CAP);
  const prefPublicacion = capScores(scorePublicacion, ITEM_SCORE_CAP);

  const hasSignal =
    prefOperacion.size > 0 ||
    prefInmueble.size > 0 ||
    prefCiudad.size > 0 ||
    prefHabitaciones.size > 0 ||
    prefBanos.size > 0 ||
    prefPublicacion.size > 0 ||
    desiredMinPrice != null ||
    desiredMaxPrice != null;

  return {
    userId: userId ?? null,
    prefOperacion,
    prefInmueble,
    prefCiudad,
    prefHabitaciones,
    prefBanos,
    prefPublicacion,
    desiredMinPrice,
    desiredMaxPrice,
    totalInteracciones: events.length + searches.length,
    hasSignal,
  };
}

async function scoreCandidates(
  candidateIds: number[],
  prefs: Awaited<ReturnType<typeof loadPreferences>>,
) {
  if (candidateIds.length === 0) return [];

  const candidates = await prisma.publicacion.findMany({
    where: { id_publicacion: { in: candidateIds }, id_estado: 1 },
    select: {
      id_publicacion: true,
      id_tipo_operacion: true,
      id_tipo_inmueble: true,
      habitaciones: true,
      banos: true,
      precio: true,
      Ubicacion: { select: { id_ciudad: true } },
      fecha_creacion: true,
    },
  });

  const {
    prefOperacion,
    prefInmueble,
    prefCiudad,
    prefHabitaciones,
    prefBanos,
    prefPublicacion,
    desiredMinPrice,
    desiredMaxPrice,
  } = prefs;

  const recencyMax = candidates.reduce<number>((max, c) => {
    const t = c.fecha_creacion ? c.fecha_creacion.getTime() : 0;
    return t > max ? t : max;
  }, 0);

  const scored = candidates
    .map((candidate) => {
      const opScore = scaledPreference(prefOperacion, candidate.id_tipo_operacion, SCORE_CAP);
      const inScore = scaledPreference(prefInmueble, candidate.id_tipo_inmueble, SCORE_CAP);
      const cityScore = scaledPreference(prefCiudad, candidate.Ubicacion?.id_ciudad ?? null, SCORE_CAP);
      const habScore = scaledPreference(prefHabitaciones, candidate.habitaciones ?? null, SCORE_CAP);
      const banosScore = scaledPreference(prefBanos, candidate.banos ?? null, SCORE_CAP);
      const itemAffinity = scaledPreference(prefPublicacion, candidate.id_publicacion, ITEM_SCORE_CAP);

      // Contenido: suma ponderada (acepta negativo para penalizar).
      // itemAffinity ayuda a que las cards con mÃ¡s interacciÃ³n directa queden arriba (sin crear bloques por operaciÃ³n).
      let score =
        itemAffinity * 1.25 +
        opScore * 0.25 +
        inScore * 0.6 +
        cityScore * 0.35 +
        habScore * 0.22 +
        banosScore * 0.18;

      const price = toNumber(candidate.precio);
      if (price != null && (desiredMinPrice != null || desiredMaxPrice != null)) {
        const min = desiredMinPrice ?? desiredMaxPrice ?? price;
        const max = desiredMaxPrice ?? desiredMinPrice ?? price;
        const center = (min + max) / 2;
        const radius = Math.max(1, (max - min) / 2);
        const distance = Math.min(1, Math.abs(price - center) / radius);
        score += (1 - distance) * 0.25;
      }

      // Recency small tiebreaker (no domina sobre preferencias).
      if (recencyMax > 0 && candidate.fecha_creacion) {
        score += (candidate.fecha_creacion.getTime() / recencyMax) * 0.05;
      }

      return { id_publicacion: candidate.id_publicacion, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ id_publicacion }) => ({ id_publicacion }));

  return scored;
}

export async function GET(request: NextRequest) {
  const prefs = await loadPreferences(request);
  if (!prefs.hasSignal) {
    return NextResponse.json([], { status: 200 });
  }

  const topOperaciones = topKeys(prefs.prefOperacion, 3);
  const topInmuebles = topKeys(prefs.prefInmueble, 3);
  const topCiudades = topKeys(prefs.prefCiudad, 3);

  const wherePublicacion: Prisma.PublicacionWhereInput = { id_estado: 1 };
  const or: Prisma.PublicacionWhereInput[] = [];
  if (topOperaciones.length > 0) or.push({ id_tipo_operacion: { in: topOperaciones } });
  if (topInmuebles.length > 0) or.push({ id_tipo_inmueble: { in: topInmuebles } });
  if (topCiudades.length > 0) or.push({ Ubicacion: { is: { id_ciudad: { in: topCiudades } } } });
  if (or.length > 0) wherePublicacion.OR = or;

  const candidateIds = (
    await prisma.publicacion.findMany({
      where: wherePublicacion,
      take: 350,
      orderBy: { fecha_creacion: 'desc' },
      select: { id_publicacion: true },
    })
  ).map((row) => row.id_publicacion);

  const scored = (await scoreCandidates(candidateIds, prefs)).slice(0, 200);

  if (prefs.userId) {
    await prisma.perfilPreferencias.upsert({
      where: { id_usuario: prefs.userId },
      create: {
        id_usuario: prefs.userId,
        pref_tipo_operacion: mapToJson(prefs.prefOperacion, 10),
        pref_tipo_inmueble: mapToJson(prefs.prefInmueble, 10),
        pref_ciudades: mapToJson(prefs.prefCiudad, 10),
        pref_habitaciones: mapToJson(prefs.prefHabitaciones, 10),
        total_interacciones: prefs.totalInteracciones,
        ultimo_calculo: new Date(),
        actualizado_en: new Date(),
      },
      update: {
        pref_tipo_operacion: mapToJson(prefs.prefOperacion, 10),
        pref_tipo_inmueble: mapToJson(prefs.prefInmueble, 10),
        pref_ciudades: mapToJson(prefs.prefCiudad, 10),
        pref_habitaciones: mapToJson(prefs.prefHabitaciones, 10),
        total_interacciones: prefs.totalInteracciones,
        ultimo_calculo: new Date(),
        actualizado_en: new Date(),
      },
    });
  }

  return NextResponse.json(scored, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { candidate_ids?: number[] };
    const candidateIds = Array.isArray(body.candidate_ids) ? body.candidate_ids : [];

    const prefs = await loadPreferences(request);
    if (!prefs.hasSignal) {
      return NextResponse.json([], { status: 200 });
    }
    const scored = await scoreCandidates(candidateIds, prefs);

    return NextResponse.json(scored, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
