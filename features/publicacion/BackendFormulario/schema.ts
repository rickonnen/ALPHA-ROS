import { z } from 'zod'

// Mapeos BD — sincronizados con la tabla TipoOperacion
// y TipoInmueble del schema público
export const TIPO_INMUEBLE_IDS: Record<string, number> = {
  Casa:          1,
  Departamento:  2,
  Terreno:       3,
  Oficina:       4,
}

export const TIPO_OPERACION_IDS: Record<string, number> = {
  Venta:       2,
  Alquiler:    1,
  Anticrético: 3,
}

// Mapeo departamento → id_ciudad (tabla Ciudad)
export const DEPARTAMENTO_CIUDAD: Record<string, number> = {
  Beni:         7,
  Chuquisaca:   6,
  Cochabamba:   1,
  'La Paz':     2,
  Oruro:        4,
  Pando:        8,
  Potosí:       5,
  'Santa Cruz': 3,
  Tarija:       9,
}

// Mapeo moneda → id_moneda (tabla Moneda)
export const MONEDA_IDS: Record<string, number> = {
  USD: 2,
  Bs:  1,
}

// Schema Zod — valida el payload completo antes de tocar la BD
export const publicacionSchema = z.object({

  // Paso 0 — Datos del Aviso
  titulo:        z.string().min(5,  'Título muy corto.')
                           .max(150, 'Título muy largo.'),
  tipoOperacion: z.string().min(1,  'Selecciona un tipo de operación.'),
  precio:        z.number().positive('El precio debe ser mayor a 0.'),
  tipoMoneda:    z.enum(['USD', 'Bs']),

  // Paso 1 — Categoría y Estado
  tipoInmueble:       z.string().min(1, 'Selecciona un tipo de inmueble.'),
  estadoConstruccion: z.number().int().min(1),

  // Paso 2 — Ubicación
  direccion:    z.string().min(1,   'La dirección es obligatoria.'),
  departamento: z.string().min(1,   'Selecciona un departamento.'),
  zona:         z.string().min(5,   'La zona debe tener al menos 5 caracteres.')
                          .max(100, 'La zona no puede superar 100 caracteres.'),
  lat: z.number().optional(),
  lng: z.number().optional(),

  // Paso 3 — Características
  // Nullable: Terreno los envía como null, campo vacío también es null
  habitaciones: z.number().int().min(0).max(50).nullable(),
  banios:       z.number().int().min(0).max(50).nullable(),
  garajes:      z.number().int().min(0).max(50).nullable(),
  plantas:      z.number().int().min(0).max(50).nullable(),
  superficie:   z.number().positive('La superficie debe ser mayor a 0.')
                          .max(1000000, 'Máximo 1.000.000 m².'),

  // Paso 4 — Imágenes (urls ya subidas a Cloudinary)
  imagenesUrl: z.array(z.string().url())
                 .min(1, 'Debes subir al menos 1 imagen.')
                 .max(5, 'Máximo 5 imágenes.'),

  // Paso 5 — Video (opcional)
  videoUrl: z.string().optional().nullable(),

  // Paso 6 — Descripción
  descripcion: z.string().min(10,  'La descripción debe tener al menos 10 caracteres.')
                         .max(500, 'La descripción no puede superar 500 caracteres.'),

  // Paso 6 — Características Extras (opcional, máx 4, IDs de tabla Caracteristica)
  caracteristicasExtras: z.array(
    z.object({
      id_caracteristica: z.number().int().min(1),
      detalle:           z.string().max(100).optional().nullable(),
    })
  ).max(4, 'Máximo 4 características extras.').optional().default([]),

  // ID del usuario autenticado
  id_usuario: z.string().uuid().optional().nullable(),
})

export type PublicacionInput = z.infer<typeof publicacionSchema>

// Claves de sessionStorage usadas por cada paso del formulario
export const SK = {
  paso:            'publicacion_currentStep',
  completados:     'publicacion_completedSteps',
  datosAviso:      'datosAviso',
  categoria:       'categoriaEstado',
  ubicacion:       'ubicacion',
  caracteristicas: 'caracteristicasDetalle',
  imagenes:        'imagenesPropiedad_interacted',
  video:           'videoPropiedad',
  descripcion:     'descripcionPropiedad',
} as const