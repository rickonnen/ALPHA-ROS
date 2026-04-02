"use server" // Importante: Esto le dice a Next que es backend

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getPublicacionesOrdenadas = async (criterio: string) => {
  let columna: any = 'id_publicacion'
  let direccion: 'asc' | 'desc' = 'desc'

  // Mapeamos  opciones del botón con la base de datos
  switch (criterio) {
    case 'precio-asc': columna = 'precio'; direccion = 'asc'; break;
    case 'precio-des': columna = 'precio'; direccion = 'desc'; break;
    case 'fecha-reciente': columna = 'id_publicacion'; direccion = 'desc'; break;
    case 'fecha-antigua': columna = 'id_publicacion'; direccion = 'asc'; break;
    case 'm2-mayor': columna = 'superficie'; direccion = 'desc'; break;
    case 'm2-menor': columna = 'superficie'; direccion = 'asc'; break;
  }

  try {
    // Aquí Prisma va a Supabase y trae todo ordenado
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: { [columna]: direccion },
    })
    return publicaciones
  } catch (error) {
    console.error("Error al ordenar:", error)
    return []
  }
}