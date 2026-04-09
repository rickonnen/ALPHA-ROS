import { z } from 'zod'

export const DEPARTAMENTO_CIUDAD: Record<string, number> = {
  cochabamba: 1,
  la_paz:     2,
  beni:       3,
  chuquisaca: 4,
  oruro:      7,
  pando:      8,
  potosi:     9,
  santa_cruz: 10,
  tarija:     11,
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