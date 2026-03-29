/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 29/03/2026
 * Funcionalidad: Hook personalizado que centraliza la lógica del formulario
 *                de Características del Inmueble. Maneja estados, validaciones
 *                e imágenes.
 *                Persiste los valores en sessionStorage para
 *                conservarlos al navegar de vuelta desde la sección 2 a la 1.
 * @return {object} Estados y handlers necesarios para el formulario
 */

import { useState, useCallback, useRef, useEffect, startTransition } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Departamento =
  | 'beni'
  | 'chuquisaca'
  | 'cochabamba'
  | 'la_paz'
  | 'oruro'
  | 'pando'
  | 'potosi'
  | 'santa_cruz'
  | 'tarija'
  | '';

export interface CaracteristicasFormValues {
  // Tarea 2.1.1
  direccion:    string;
  superficie:   string;
  departamento: Departamento;
  zona:         string;
  // Tarea 2.1.2
  habitaciones: string;
  banios:       string;
  plantas:      string;
  garajes:      string;
  imagenes:     File[];
}

export interface CaracteristicasFormErrors {
  // Tarea 2.1.1
  direccion?:    string;
  superficie?:   string;
  departamento?: string;
  zona?:         string;
  // Tarea 2.1.2
  habitaciones?: string;
  banios?:       string;
  plantas?:      string;
  garajes?:      string;
  imagenes?:     string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const DEPARTAMENTOS: { label: string; value: Departamento }[] = [
  { label: 'Beni',       value: 'beni'       },
  { label: 'Chuquisaca', value: 'chuquisaca' },
  { label: 'Cochabamba', value: 'cochabamba' },
  { label: 'La Paz',     value: 'la_paz'     },
  { label: 'Oruro',      value: 'oruro'      },
  { label: 'Pando',      value: 'pando'      },
  { label: 'Potosí',     value: 'potosi'     },
  { label: 'Santa Cruz', value: 'santa_cruz' },
  { label: 'Tarija',     value: 'tarija'     },
];

export const TIPOS_IMAGEN_PERMITIDOS  = ['image/jpeg', 'image/png'];
export const TAMANO_MAXIMO_IMAGEN_MB  = 10;
export const MIN_IMAGENES             = 1;
export const MAX_IMAGENES             = 5;
export const MAX_CARACTERES_ZONA      = 100;
export const MAX_VALOR_NUMERICO       = 50;
export const MIN_RESOLUCION_ANCHO     = 1280;
export const MIN_RESOLUCION_ALTO      = 720;

// Tarea 2.9: clave de sessionStorage para los datos del paso 2
const SESSION_KEY = 'caracteristicasInmueble';

const INITIAL_VALUES: CaracteristicasFormValues = {
  direccion:    '',
  superficie:   '',
  departamento: '',
  zona:         '',
  habitaciones: '',
  banios:       '',
  plantas:      '',
  garajes:      '',
  imagenes:     [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esNumeroEnteroValido(valor: string): boolean {
  return /^\d+$/.test(valor) && parseInt(valor, 10) > 0 && parseInt(valor, 10) <= MAX_VALOR_NUMERICO;
}

function esNumeroDecimalPositivo(valor: string): boolean {
  const limpio = valor.replace(/\./g, '')
  return /^\d+$/.test(limpio) && parseInt(limpio, 10) > 0;
}

// Tarea 2.9: leer valores guardados del sessionStorage (sin imágenes, no serializables)
function leerSesion(): Partial<Omit<CaracteristicasFormValues, 'imagenes'>> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Tarea 2.9: guardar valores en sessionStorage (sin imágenes)
function guardarSesion(values: CaracteristicasFormValues): void {
  try {
    const { imagenes: _, ...rest } = values
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(rest))
  } catch {
    // sessionStorage no disponible (SSR), ignorar
  }
}

// ─── Validación ───────────────────────────────────────────────────────────────

function validate(values: CaracteristicasFormValues): CaracteristicasFormErrors {
  const errors: CaracteristicasFormErrors = {};

  // ── 2.1.1 ──

  if (!values.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria.';
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

  // ── 2.1.2 ──

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCaracteristicasForm() {

  // Tarea 2.9: arrancar siempre con INITIAL_VALUES para que servidor y cliente
  // rendericen lo mismo. Tras el montaje, un useEffect restaura desde sessionStorage
  // usando startTransition para que React no lo trate como render síncrono urgente.
  const [values, setValues]   = useState<CaracteristicasFormValues>(INITIAL_VALUES);
  const [errors, setErrors]   = useState<CaracteristicasFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CaracteristicasFormValues, boolean>>>({});
  const valuesRef = useRef(values);

  useEffect(() => {
    const saved = leerSesion()
    if (Object.keys(saved).length === 0) return
    const restored = { ...INITIAL_VALUES, ...saved }
    startTransition(() => {
      valuesRef.current = restored
      setValues(restored)
    })
  }, [])

  // Tarea 2.9: guardar en sessionStorage cada vez que cambian los valores
  useEffect(() => {
    guardarSesion(valuesRef.current)
  }, [values])

  // Actualiza campos de texto/select
  const handleChange = useCallback(
    (field: keyof Omit<CaracteristicasFormValues, 'imagenes'>, value: string) => {
      const updated = { ...valuesRef.current, [field]: value };
      valuesRef.current = updated;
      setValues(updated);

      if (touched[field] && field !== 'superficie') {
        setErrors(prev => ({
          ...prev,
          [field]: validate(updated)[field],
        }));
      }
    },
    [touched],
  );

  // Agrega imágenes a la lista
  const handleAgregarImagenes = useCallback(
    (nuevasImagenes: File[]) => {
      const actualizadas = [...valuesRef.current.imagenes, ...nuevasImagenes].slice(0, MAX_IMAGENES);
      const updated = { ...valuesRef.current, imagenes: actualizadas };
      valuesRef.current = updated;
      setValues(updated);

      if (touched.imagenes) {
        setErrors(prev => ({
          ...prev,
          imagenes: validate(updated).imagenes,
        }));
      }
    },
    [touched],
  );

  // Elimina una imagen por índice
  const handleEliminarImagen = useCallback(
    (indice: number) => {
      const actualizadas = valuesRef.current.imagenes.filter((_, i) => i !== indice);
      const updated = { ...valuesRef.current, imagenes: actualizadas };
      valuesRef.current = updated;
      setValues(updated);

      if (touched.imagenes) {
        setErrors(prev => ({
          ...prev,
          imagenes: validate(updated).imagenes,
        }));
      }
    },
    [touched],
  );

  // Marca el campo como tocado al salir y muestra su error (validación inline)
  const handleBlur = useCallback(
    (field: keyof CaracteristicasFormValues) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      setErrors(prev => ({
        ...prev,
        [field]: validate(valuesRef.current)[field],
      }));
    },
    [],
  );

  // Valida todo al enviar (validación client-side)
  const handleSubmit = useCallback(
    (onSuccess: (values: CaracteristicasFormValues) => void) => {
      const allTouched = Object.keys(INITIAL_VALUES).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof CaracteristicasFormValues, boolean>,
      );
      setTouched(allTouched);

      const validationErrors = validate(valuesRef.current);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        onSuccess(valuesRef.current);
      }
    },
    [],
  );

  // Resetea todo al estado inicial y limpia sessionStorage
  const handleReset = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
  }, []);

  const isValid         = Object.keys(validate(values)).length === 0;
  const puedeAgregarMas = values.imagenes.length < MAX_IMAGENES;

  return {
    values,
    errors,
    touched,
    isValid,
    puedeAgregarMas,
    handleChange,
    handleAgregarImagenes,
    handleEliminarImagen,
    handleBlur,
    handleSubmit,
    handleReset,
  };
}