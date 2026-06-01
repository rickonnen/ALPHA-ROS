import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { searchPublicaciones } from "@/features/filter_search_page/services";

export const dynamic = "force-dynamic";

type GlobalLocationRequest = {
  latitud?: number | null;
  longitud?: number | null;
  zona?: string | null;
  limit?: number;
};

type LocalTrend = {
  id_publicacion: number;
  score: number;
};

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const RECENT_ACTIVITY_DAYS = 45;

const EVENT_WEIGHTS: Record<string, number> = {
  favorito: 10,
  contacto: 8,
  detalle: 5,
  click: 4,
  compartir: 3,
  hover: 1,
  view: 1,
  ignorar: -2,
  descartar: -5,
};

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return null;
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeZone(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function getLatestSessionCoordinates(userId: string | null) {
  if (!userId) return null;

  const session = await prisma.sesion.findFirst({
    where: {
      id_usuario: userId,
      latitud: { not: null },
      longitud: { not: null },
    },
    orderBy: { fecha_hora_sesion: "desc" },
    select: { latitud: true, longitud: true },
  });

  if (!session?.latitud || !session.longitud) return null;

  return {
    latitud: Number(session.latitud),
    longitud: Number(session.longitud),
  };
}

async function resolveNearestZone(latitud: number | null, longitud: number | null) {
  if (latitud === null || longitud === null) return null;

  const candidates = await prisma.publicacion.findMany({
    where: {
      id_estado: 1,
      Ubicacion: {
        is: {
          zona: { not: null },
          latitud: { not: null },
          longitud: { not: null },
        },
      },
    },
    take: 300,
    select: {
      Ubicacion: {
        select: {
          zona: true,
          latitud: true,
          longitud: true,
        },
      },
    },
  });

  let bestZone: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const location = candidate.Ubicacion;
    if (!location?.zona || !location.latitud || !location.longitud) continue;

    const latDistance = Number(location.latitud) - latitud;
    const lngDistance = Number(location.longitud) - longitud;
    const distance = latDistance * latDistance + lngDistance * lngDistance;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestZone = location.zona;
    }
  }

  return normalizeZone(bestZone);
}

async function getLocalTrends(zone: string | null, limit: number): Promise<LocalTrend[]> {
  const publicationWhere = zone
    ? {
        id_estado: 1,
        Ubicacion: {
          is: {
            zona: {
              equals: zone,
              mode: "insensitive" as const,
            },
          },
        },
      }
    : { id_estado: 1 };

  const candidates = await prisma.publicacion.findMany({
    where: publicationWhere,
    take: 350,
    orderBy: [{ prioridad: "desc" }, { fecha_creacion: "desc" }],
    select: {
      id_publicacion: true,
      prioridad: true,
      fecha_creacion: true,
    },
  });

  if (candidates.length === 0 && zone) {
    return getLocalTrends(null, limit);
  }

  const candidateIds = candidates.map((candidate) => candidate.id_publicacion);
  const since = new Date(Date.now() - RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const events = candidateIds.length
    ? await prisma.interaccionEvento.findMany({
        where: {
          id_publicacion: { in: candidateIds },
          creado_en: { gte: since },
        },
        select: {
          id_publicacion: true,
          tipo_evento: true,
          duracion_ms: true,
        },
      })
    : [];

  const scoreByPublication = new Map<number, number>();

  for (const event of events) {
    const base = EVENT_WEIGHTS[event.tipo_evento] ?? 0;
    const durationBoost =
      event.tipo_evento === "hover" && event.duracion_ms
        ? Math.min(2, event.duracion_ms / 3000)
        : 0;
    scoreByPublication.set(
      event.id_publicacion,
      (scoreByPublication.get(event.id_publicacion) ?? 0) + base + durationBoost,
    );
  }

  const now = Date.now();
  const scored = candidates.map((candidate) => {
    const activityScore = scoreByPublication.get(candidate.id_publicacion) ?? 0;
    const promotedScore = candidate.prioridad ? 2 : 0;
    const createdAt = candidate.fecha_creacion?.getTime() ?? 0;
    const recencyScore =
      createdAt > 0 ? Math.max(0, 1 - (now - createdAt) / (90 * 24 * 60 * 60 * 1000)) : 0;

    return {
      id_publicacion: candidate.id_publicacion,
      score: activityScore + promotedScore + recencyScore,
    };
  });

  return scored
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return second.id_publicacion - first.id_publicacion;
    })
    .slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as GlobalLocationRequest;
    const limit = Math.min(Math.max(Number(body.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const userId = getUserIdFromToken(request);

    const explicitLatitud = toFiniteNumber(body.latitud);
    const explicitLongitud = toFiniteNumber(body.longitud);
    const sessionCoordinates =
      explicitLatitud === null || explicitLongitud === null
        ? await getLatestSessionCoordinates(userId)
        : null;

    const latitud = explicitLatitud ?? sessionCoordinates?.latitud ?? null;
    const longitud = explicitLongitud ?? sessionCoordinates?.longitud ?? null;
    const zone = normalizeZone(body.zona) ?? (await resolveNearestZone(latitud, longitud));

    const trends = await getLocalTrends(zone, limit);
    const orderedIds = trends.map((trend) => trend.id_publicacion);

    if (orderedIds.length === 0) {
      return NextResponse.json({
        success: true,
        zone,
        publications: [],
        total: 0,
      });
    }

    const publications = await searchPublicaciones({});
    const publicationById = new Map(
      publications.map((publication) => [publication.id_publicacion, publication]),
    );
    const orderedPublications = orderedIds
      .map((id) => publicationById.get(id))
      .filter((publication): publication is NonNullable<typeof publication> => Boolean(publication));

    return NextResponse.json({
      success: true,
      zone,
      publications: orderedPublications,
      total: orderedPublications.length,
    });
  } catch (error) {
    console.error("[recommendations/global-location] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "No se pudieron consultar las recomendaciones globales",
      },
      { status: 500 },
    );
  }
}
