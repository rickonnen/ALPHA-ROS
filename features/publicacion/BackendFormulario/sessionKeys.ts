
// Claves de sessionStorage usadas por cada paso del formulario
// Centralizado aquí para que el action las conozca y las limpie
// al publicar exitosamente.

export const SK = {
  paso:          'publicacion_currentStep',
  completados:   'publicacion_completedSteps',
  datosAviso:    'datosAviso',
  categoria:     'categoriaEstado',
  ubicacion:     'ubicacion',
  caracteristicas: 'caracteristicasDetalle',
  imagenes:      'imagenesPropiedad_interacted',
  video:         'videoPropiedad',
  descripcion:   'descripcionPropiedad',
} as const