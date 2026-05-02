'use server'

import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { verify }  from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { publicacionSchema, TIPO_INMUEBLE_IDS, TIPO_OPERACION_IDS, DEPARTAMENTO_CIUDAD, MONEDA_IDS } from './schema'
import { subirImagen } from './cloudinary'
import { SK } from './sessionKeys'

type ActionResult =
  | { success: true; idPublicacion: number }
  | { success: false; errors: Record<string, string[]>; reason?: string }

async function getUserIdSeguro(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId?: string; id?: string; sub?: string }
      const id = decoded.userId || decoded.id || decoded.sub;
      if (id) return id;
    }
  } catch (error) {
    console.error("Error JWT:", error);
  }

  const session = await getServerSession();
  if (session?.user?.email) {
    try {
      const usuarioBd = await prisma.usuario.findFirst({
        where: { email: session.user.email as string },
        select: { id_usuario: true }
      });
      if (usuarioBd) return usuarioBd.id_usuario;
    } catch (error) {
      console.error("Error buscando usuario por email:", error);
    }
  }

  return null;
}

function parseIntNullable(raw: FormDataEntryValue | null): number | null {
  if (!raw || raw === 'null' || raw === '') return null
  const n = parseInt(raw as string, 10)
  return isNaN(n) ? null : n
}

// Helper: determina si la publicación es gratuita o de plan
async function determinarGratuito(strUserId: string): Promise<boolean> {
  const objSuscripcion = await prisma.suscripcion.findUnique({
    where: { id_usuario: strUserId },
    select: {
      fecha_fin: true,
      PlanPublicacion: { select: { cant_publicaciones: true } },
    },
  });

  const hoy = new Date();
  const tienePlanActivo =
    objSuscripcion !== null &&
    objSuscripcion.fecha_fin > hoy &&
    objSuscripcion.PlanPublicacion?.cant_publicaciones !== null;

  if (!tienePlanActivo) {
    // Sin plan → siempre gratuita
    return true;
  }

  const intPermitidas = objSuscripcion!.PlanPublicacion!.cant_publicaciones!;
  const intUsadas = await prisma.publicacion.count({
    where: { id_usuario: strUserId, gratuito: false },
  });

  // Si aún tiene cupo en el plan → es de pago (gratuito = false)
  // Si el plan está agotado → usa colchón gratuito (gratuito = true)
  return intUsadas >= intPermitidas;
}

export async function publicarInmueble(formData: FormData): Promise<ActionResult> {

  // 1. Subir imágenes a Cloudinary
  const files = formData.getAll('imagenes') as File[]
  if (!files.length) {
    return { success: false, errors: { imagenes: ['Debes subir al menos 1 imagen.'] } }
  }

  let imagenesUrl: string[]
  try {
    imagenesUrl = await Promise.all(files.map(f => subirImagen(f)))
  } catch (err) {
    console.error('[publicarInmueble] Error Cloudinary:', err)
    return { success: false, errors: { imagenes: ['Error al subir imágenes. Intenta de nuevo.'] } }
  }

  // 2. Parsear características extras
  let caracteristicasExtras: { id_caracteristica: number; detalle?: string | null }[] = []
  try {
    const rawCaract = formData.get('caracteristicasExtras') as string
    if (rawCaract) {
      caracteristicasExtras = JSON.parse(rawCaract)
    }
  } catch {
    caracteristicasExtras = []
  }

  // 3. Armar payload
  const rawIdUsuario = await getUserIdSeguro()

  const payload = {
    titulo: formData.get('titulo') as string,
    tipoOperacion: formData.get('tipoOperacion') as string,
    precio: parseFloat(formData.get('precio') as string),
    tipoMoneda: (formData.get('tipoMoneda') ?? 'USD') as 'USD' | 'Bs',
    tipoInmueble: formData.get('tipoInmueble') as string,
    estadoConstruccion: parseInt(formData.get('estadoConstruccion') as string, 10),
    direccion: formData.get('direccion') as string,
    departamento: formData.get('departamento') as string,
    zona: formData.get('zona') as string,
    lat: formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined,
    lng: formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined,
    habitaciones: parseIntNullable(formData.get('habitaciones')),
    banios: parseIntNullable(formData.get('banios')),
    garajes: parseIntNullable(formData.get('garajes')),
    plantas: parseIntNullable(formData.get('plantas')),
    superficie: parseFloat((formData.get('superficie') as string).replace(/\./g, '')),
    imagenesUrl,
    videoUrl: (formData.get('videoUrl') as string) || null,
    descripcion: formData.get('descripcion') as string,
    caracteristicasExtras,
    id_usuario: rawIdUsuario,
  }

  // 4. Validar con Zod
  const parsed = publicacionSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }
  const d = parsed.data

  if (!d.id_usuario) {
    return { success: false, errors: { general: ['Debes iniciar sesión para publicar.'] } }
  }

  // 5. Verificación de límite + determinar si es gratuita o de plan
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: d.id_usuario },
    select: { cant_publicaciones_restantes: true },
  })

  if (!usuario || (usuario.cant_publicaciones_restantes ?? 0) <= 0) {
    return { success: false, errors: {}, reason: 'LIMITE_ALCANZADO' }
  }

  // Determinar gratuito ANTES del INSERT para pasárselo al trigger
  const bolGratuito = await determinarGratuito(d.id_usuario)

  // 6. Insertar en BD (transacción atómica)
  try {
    const idCiudad  = DEPARTAMENTO_CIUDAD[d.departamento]
    const idMoneda  = MONEDA_IDS[d.tipoMoneda]
    const idTipoInm = TIPO_INMUEBLE_IDS[d.tipoInmueble]
    const idTipoOp  = TIPO_OPERACION_IDS[d.tipoOperacion]

    const resultado = await prisma.$transaction(async (tx) => {

      // 6a. Ubicacion
      const ubicacion = await tx.ubicacion.create({
        data: {
          direccion: d.direccion,
          zona: d.zona,
          latitud: d.lat ?? null,
          longitud: d.lng ?? null,
          id_ciudad: idCiudad,
          id_pais: 1,
        },
      })

      // 6b. Publicacion — ahora incluye gratuito
      const [pub] = d.id_usuario
        ? await tx.$queryRaw<{ id_publicacion: number }[]>`
            INSERT INTO "Publicacion" (
              titulo, descripcion, precio, superficie,
              habitaciones, banos, garajes, plantas,
              id_tipo_inmueble, id_tipo_operacion,
              id_estado_construccion,
              id_ubicacion, id_moneda, id_usuario,
              gratuito
            ) VALUES (
              ${d.titulo},
              ${d.descripcion},
              ${d.precio},
              ${d.superficie},
              ${d.habitaciones},
              ${d.banios},
              ${d.garajes},
              ${d.plantas},
              ${idTipoInm},
              ${idTipoOp},
              ${d.estadoConstruccion},
              ${ubicacion.id_ubicacion},
              ${idMoneda},
              ${d.id_usuario}::uuid,
              ${bolGratuito}
            )
            RETURNING id_publicacion
          `
        : await tx.$queryRaw<{ id_publicacion: number }[]>`
            INSERT INTO "Publicacion" (
              titulo, descripcion, precio, superficie,
              habitaciones, banos, garajes, plantas,
              id_tipo_inmueble, id_tipo_operacion,
              id_estado_construccion,
              id_ubicacion, id_moneda,
              gratuito
            ) VALUES (
              ${d.titulo},
              ${d.descripcion},
              ${d.precio},
              ${d.superficie},
              ${d.habitaciones},
              ${d.banios},
              ${d.garajes},
              ${d.plantas},
              ${idTipoInm},
              ${idTipoOp},
              ${d.estadoConstruccion},
              ${ubicacion.id_ubicacion},
              ${idMoneda},
              ${bolGratuito}
            )
            RETURNING id_publicacion
          `

      // 6c. Imagenes
      for (const url of d.imagenesUrl) {
        await tx.$executeRaw`
          INSERT INTO "Imagen" (id_publicacion, url_imagen)
          VALUES (${pub.id_publicacion}, ${url})
        `
      }

      // 6d. Video (opcional)
      if (d.videoUrl) {
        await tx.$executeRaw`
          INSERT INTO "Video" (id_publicacion, url_video)
          VALUES (${pub.id_publicacion}, ${d.videoUrl})
        `
      }

      // 6e. Características Extras
      if (d.caracteristicasExtras && d.caracteristicasExtras.length > 0) {
        for (const caract of d.caracteristicasExtras) {
          await tx.$executeRaw`
            INSERT INTO "PublicacionCaracteristica" (id_publicacion, id_caracteristica, detalle_caracteristica)
            VALUES (${pub.id_publicacion}, ${caract.id_caracteristica}, ${caract.detalle ?? null})
          `
        }
      }

      // 6f. El descuento de publicaciones restantes y el incremento de
      //     publicaciones_hechas lo maneja el trigger en la base de datos.

      return pub
    })

    return { success: true, idPublicacion: resultado.id_publicacion }

  } catch (err) {
    console.error('[publicarInmueble] Error BD:', err)
    return { success: false, errors: { general: ['Error al guardar. Intenta de nuevo.'] } }
  }
}