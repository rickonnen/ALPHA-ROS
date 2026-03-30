import { z } from 'zod'

export const DEPARTAMENTO_CIUDAD: Record<string, number> = {
  beni:       1,
  chuquisaca: 2,
  cochabamba: 3,
  la_paz:     4,
  oruro:      5,
  pando:      6,
  potosi:     7,
  santa_cruz: 8,
  tarija:     9,
}

export const caracteristicasSchema = z.object({
  direccion:    z.string().min(1, 'La dirección es obligatoria.'),
  superficie:   z.number().positive('La superficie debe ser mayor a 0.'),
  departamento: z.enum([
    'beni', 'chuquisaca', 'cochabamba', 'la_paz',
    'oruro', 'pando', 'potosi', 'santa_cruz', 'tarija',
  ], { message: 'Selecciona un departamento válido.' }),
  zona:         z.string().min(1, 'La zona es obligatoria.').max(100, 'La zona no puede superar 100 caracteres.'),
  habitaciones: z.number().int().min(1).max(50, 'Debe ser un número entre 1 y 50.'),
  banios:       z.number().int().min(1).max(50, 'Debe ser un número entre 1 y 50.'),
  plantas:      z.number().int().min(1).max(50, 'Debe ser un número entre 1 y 50.'),
  garajes:      z.number().int().min(1).max(50, 'Debe ser un número entre 1 y 50.'),
  imagenesUrl:  z.array(z.string().url()).min(1, 'Debes subir al menos 1 imagen.').max(5, 'Máximo 5 imágenes.'),
})

export type CaracteristicasInput = z.infer<typeof caracteristicasSchema>