'use server'

import { prisma } from '@/lib/prisma'

const TIPO_INMUEBLE: Record<number, string> = {
  1: 'Casa', 2: 'Departamento', 3: 'Terreno', 4: 'Local Comercial', 5: 'Oficina',
}
const TIPO_OPERACION: Record<number, string> = {
  1: 'Venta', 2: 'Alquiler', 3: 'Anticrético',
}
const ESTADO_CONSTRUCCION: Record<number, string> = {
  1: 'En Planos', 2: 'En Construccion', 3: 'Entrega Inmediata',
}
const MONEDA: Record<number, 'USD' | 'Bs'> = {
  1: 'Bs', 2: 'USD',
}
const CIUDAD_DEPARTAMENTO: Record<number, string> = {
  1: 'Cochabamba', 2: 'La Paz', 3: 'Santa Cruz', 4: 'Oruro',
  5: 'Potosí', 6: 'Chuquisaca', 7: 'Beni', 8: 'Pando', 9: 'Tarija',
}

// Tipo de característica extra tal como viene de BD y se guarda en sessionStorage
export interface CaracteristicaExtraEdit {
  id_caracteristica: number
  titulo:            string
  detalle:           string
}

export type PublicacionEditData = {
  titulo:          string
  tipoOperacion:   string
  precio:          string
  tipoMoneda:      'USD' | 'Bs'
  tipoPropiedad:   string
  estadoPropiedad: string
  direccion:       string
  departamento:    string
  zona:            string
  lat:             number | null
  lng:             number | null
  habitaciones:    string
  banios:          string
  garajes:         string
  plantas:         string
  superficie:      string
  imagenesUrl:     string[]
  videoUrl:        string
  descripcion:     string
  // ← NUEVO: características extras para pre-poblar el paso 6
  caracteristicasExtras: CaracteristicaExtraEdit[]
}

export async function getPublicacionById(id: number): Promise<PublicacionEditData | null> {
  try {
    const pub = await prisma.publicacion.findUnique({
      where:   { id_publicacion: id },
      include: {
        Ubicacion:                true,
        Imagen:                   true,
        Video:                    true,
        Moneda:                   true,
        // Incluir la tabla pivote con la característica para obtener nombre
        PublicacionCaracteristica: {
          include: { Caracteristica: true },
        },
      },
    })

    if (!pub) return null

    // Mapear características extras a formato de sessionStorage
    const caracteristicasExtras: CaracteristicaExtraEdit[] =
      pub.PublicacionCaracteristica.map(pc => ({
        id_caracteristica: pc.id_caracteristica,
        titulo:            pc.Caracteristica.nombre_caracteristica ?? '',
        detalle:           pc.detalle_caracteristica ?? '',
      }))

    return {
      titulo:          pub.titulo        ?? '',
      tipoOperacion:   TIPO_OPERACION[pub.id_tipo_operacion ?? 0]          ?? '',
      precio:          pub.precio        ? String(pub.precio) : '',
      tipoMoneda:      MONEDA[pub.id_moneda ?? 1]                          ?? 'Bs',
      tipoPropiedad:   TIPO_INMUEBLE[pub.id_tipo_inmueble ?? 0]            ?? '',
      estadoPropiedad: ESTADO_CONSTRUCCION[pub.id_estado_construccion ?? 0] ?? '',
      direccion:       pub.Ubicacion?.direccion ?? '',
      departamento:    CIUDAD_DEPARTAMENTO[pub.Ubicacion?.id_ciudad ?? 0]  ?? '',
      zona:            pub.Ubicacion?.zona      ?? '',
      lat:             pub.Ubicacion?.latitud   ? Number(pub.Ubicacion.latitud)  : null,
      lng:             pub.Ubicacion?.longitud  ? Number(pub.Ubicacion.longitud) : null,
      habitaciones:    String(pub.habitaciones ?? 1),
      banios:          String(pub.banos        ?? 1),
      garajes:         String(pub.garajes      ?? 0),
      plantas:         String(pub.plantas      ?? 1),
      superficie:      pub.superficie ? String(pub.superficie) : '',
      imagenesUrl:     pub.Imagen.map(i => i.url_imagen ?? '').filter(Boolean),
      videoUrl:        pub.Video[0]?.url_video ?? '',
      descripcion:     pub.descripcion ?? '',
      caracteristicasExtras,
    }
  } catch (err) {
    console.error('[getPublicacionById]', err)
    return null
  }
}