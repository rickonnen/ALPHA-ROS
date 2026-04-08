import {
  CaracteristicasFormValues,
  CaracteristicasFormErrors,
  MAX_VALOR_NUMERICO,
  MAX_CARACTERES_ZONA,
  MIN_IMAGENES,
  MAX_IMAGENES,
  TIPOS_IMAGEN_PERMITIDOS,
  TAMANO_MAXIMO_IMAGEN_MB,
  MIN_CARACTERES_DIRECCION,
} from './useCaracteristicasTypes'

function esNumeroEnteroValido(valor: string): boolean {
  return /^\d+$/.test(valor) && parseInt(valor, 10) > 0 && parseInt(valor, 10) <= MAX_VALOR_NUMERICO;
}

function esNumeroDecimalPositivo(valor: string): boolean {
  const limpio = valor.replace(/\./g, '')
  return /^\d+$/.test(limpio) && parseInt(limpio, 10) > 0;
}

export function validate(values: CaracteristicasFormValues): CaracteristicasFormErrors {
  const errors: CaracteristicasFormErrors = {};

  if (!values.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria.';
  } else if (values.direccion.trim().length < MIN_CARACTERES_DIRECCION) {
    errors.direccion = `La dirección debe tener al menos ${MIN_CARACTERES_DIRECCION} caracteres.`;
  }

  if (!values.superficie) {
    errors.superficie = 'La superficie es obligatoria.';
  } else if (!esNumeroDecimalPositivo(values.superficie)) {
    errors.superficie = 'La superficie debe ser un número mayor a 0.';
  }

  if (!values.departamento) {
    errors.departamento = 'Selecciona un departamento.';
  }

  if (!values.zona.trim()) {
    errors.zona = 'La zona es obligatoria.';
  } else if (values.zona.length > MAX_CARACTERES_ZONA) {
    errors.zona = `La zona no puede superar ${MAX_CARACTERES_ZONA} caracteres.`;
  }

  if (!values.habitaciones) {
    errors.habitaciones = 'El número de habitaciones es obligatorio.';
  } else if (!esNumeroEnteroValido(values.habitaciones)) {
    errors.habitaciones = `Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`;
  }

  if (!values.banios) {
    errors.banios = 'El número de baños es obligatorio.';
  } else if (!esNumeroEnteroValido(values.banios)) {
    errors.banios = `Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`;
  }

  if (!values.plantas) {
    errors.plantas = 'El número de plantas es obligatorio.';
  } else if (!esNumeroEnteroValido(values.plantas)) {
    errors.plantas = `Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`;
  }

  if (!values.garajes) {
    errors.garajes = 'El número de garajes es obligatorio.';
  } else if (!esNumeroEnteroValido(values.garajes)) {
    errors.garajes = `Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`;
  }

  if (values.imagenes.length < MIN_IMAGENES) {
    errors.imagenes = `Debes subir al menos ${MIN_IMAGENES} imagen.`;
  } else if (values.imagenes.length > MAX_IMAGENES) {
    errors.imagenes = `No puedes subir más de ${MAX_IMAGENES} imágenes.`;
  } else {
    for (const imagen of values.imagenes) {
      if (!TIPOS_IMAGEN_PERMITIDOS.includes(imagen.type)) {
        errors.imagenes = 'Solo se permiten imágenes JPG y PNG.';
        break;
      }
      if (imagen.size > TAMANO_MAXIMO_IMAGEN_MB * 1024 * 1024) {
        errors.imagenes = `Cada imagen no debe superar ${TAMANO_MAXIMO_IMAGEN_MB}MB.`;
        break;
      }
    }
  }

  return errors;
}