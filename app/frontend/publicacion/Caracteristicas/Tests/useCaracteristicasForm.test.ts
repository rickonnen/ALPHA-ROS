import { renderHook, act } from '@testing-library/react';
import {
  useCaracteristicasForm,
  MAX_IMAGENES,
  MIN_IMAGENES,
  MAX_VALOR_NUMERICO,
  MAX_CARACTERES_ZONA,
  TAMANO_MAXIMO_IMAGEN_MB,
} from '../Hooks/useCaracteristicasForm';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const crearImagen = (nombre: string, tipo = 'image/jpeg', tamanioMB = 1) =>
  new File([new ArrayBuffer(tamanioMB * 1024 * 1024)], nombre, { type: tipo });

const valoresValidos = {
  direccion:    'Av. Blanco Galindo 123',
  superficie:   '150.5',
  departamento: 'cochabamba' as const,
  zona:         'Norte',
  habitaciones: '3',
  banios:       '2',
  plantas:      '1',
  garajes:      '1',
  imagenes:     [crearImagen('foto.jpg')],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCaracteristicasForm', () => {

  // ── Estado inicial ──────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('debe tener todos los campos de texto vacíos', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      expect(result.current.values.direccion).toBe('');
      expect(result.current.values.superficie).toBe('');
      expect(result.current.values.departamento).toBe('');
      expect(result.current.values.zona).toBe('');
      expect(result.current.values.habitaciones).toBe('');
      expect(result.current.values.banios).toBe('');
      expect(result.current.values.plantas).toBe('');
      expect(result.current.values.garajes).toBe('');
    });

    it('debe tener el array de imágenes vacío', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      expect(result.current.values.imagenes).toEqual([]);
    });

    it('no debe tener errores al inicio', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      expect(result.current.errors).toEqual({});
    });

    it('isValid debe ser false al inicio', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      expect(result.current.isValid).toBe(false);
    });

    it('puedeAgregarMas debe ser true al inicio', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      expect(result.current.puedeAgregarMas).toBe(true);
    });
  });

  // ── handleChange ────────────────────────────────────────────────────────────

  describe('handleChange', () => {
    it('debe actualizar direccion', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('direccion', 'Av. América 456'); });
      expect(result.current.values.direccion).toBe('Av. América 456');
    });

    it('debe actualizar superficie', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('superficie', '200.5'); });
      expect(result.current.values.superficie).toBe('200.5');
    });

    it('debe actualizar departamento', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('departamento', 'santa_cruz'); });
      expect(result.current.values.departamento).toBe('santa_cruz');
    });

    it('debe actualizar zona', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('zona', 'Sur'); });
      expect(result.current.values.zona).toBe('Sur');
    });

    it('debe actualizar habitaciones', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('habitaciones', '4'); });
      expect(result.current.values.habitaciones).toBe('4');
    });

    it('debe actualizar banios', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('banios', '2'); });
      expect(result.current.values.banios).toBe('2');
    });

    it('debe actualizar plantas', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('plantas', '3'); });
      expect(result.current.values.plantas).toBe('3');
    });

    it('debe actualizar garajes', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleChange('garajes', '1'); });
      expect(result.current.values.garajes).toBe('1');
    });
  });

  // ── handleAgregarImagenes ────────────────────────────────────────────────────

  describe('handleAgregarImagenes', () => {
    it('debe agregar una imagen válida', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      const imagen = crearImagen('foto.jpg');

      act(() => { result.current.handleAgregarImagenes([imagen]); });

      expect(result.current.values.imagenes).toHaveLength(1);
    });

    it('debe agregar múltiples imágenes', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleAgregarImagenes([
          crearImagen('foto1.jpg'),
          crearImagen('foto2.jpg'),
          crearImagen('foto3.jpg'),
        ]);
      });

      expect(result.current.values.imagenes).toHaveLength(3);
    });

    it('no debe superar el máximo de 5 imágenes', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleAgregarImagenes([
          crearImagen('foto1.jpg'),
          crearImagen('foto2.jpg'),
          crearImagen('foto3.jpg'),
          crearImagen('foto4.jpg'),
          crearImagen('foto5.jpg'),
          crearImagen('foto6.jpg'),
        ]);
      });

      expect(result.current.values.imagenes).toHaveLength(MAX_IMAGENES);
    });

    it('puedeAgregarMas debe ser false cuando hay 5 imágenes', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleAgregarImagenes(
          Array.from({ length: MAX_IMAGENES }, (_, i) => crearImagen(`foto${i}.jpg`))
        );
      });

      expect(result.current.puedeAgregarMas).toBe(false);
    });
  });

  // ── handleEliminarImagen ─────────────────────────────────────────────────────

  describe('handleEliminarImagen', () => {
    it('debe eliminar la imagen en el índice indicado', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      const imagen1 = crearImagen('foto1.jpg');
      const imagen2 = crearImagen('foto2.jpg');

      act(() => { result.current.handleAgregarImagenes([imagen1, imagen2]); });
      act(() => { result.current.handleEliminarImagen(0); });

      expect(result.current.values.imagenes).toHaveLength(1);
      expect(result.current.values.imagenes[0]).toBe(imagen2);
    });

    it('puedeAgregarMas debe ser true después de eliminar una imagen del máximo', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleAgregarImagenes(
          Array.from({ length: MAX_IMAGENES }, (_, i) => crearImagen(`foto${i}.jpg`))
        );
      });
      act(() => { result.current.handleEliminarImagen(0); });

      expect(result.current.puedeAgregarMas).toBe(true);
    });
  });

  // ── handleBlur — validaciones inline ────────────────────────────────────────

  describe('handleBlur (validaciones inline)', () => {

    // Tarea 2.1.1
    it('debe mostrar error si direccion está vacía', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('direccion'); });
      expect(result.current.errors.direccion).toBe('La dirección es obligatoria.');
    });

    it('debe mostrar error si superficie está vacía', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('superficie'); });
      expect(result.current.errors.superficie).toBe('La superficie es obligatoria.');
    });

    it('debe mostrar error si superficie no es número válido', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleChange('superficie', 'abc');
        result.current.handleBlur('superficie');
      });
      expect(result.current.errors.superficie).toBe('La superficie debe ser un número mayor a 0.');
    });

    it('debe mostrar error si superficie es negativa', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleChange('superficie', '-10');
        result.current.handleBlur('superficie');
      });
      expect(result.current.errors.superficie).toBe('La superficie debe ser un número mayor a 0.');
    });

    it('debe mostrar error si departamento no fue seleccionado', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('departamento'); });
      expect(result.current.errors.departamento).toBe('Selecciona un departamento.');
    });

    it('debe mostrar error si zona está vacía', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('zona'); });
      expect(result.current.errors.zona).toBe('La zona es obligatoria.');
    });

    it(`debe mostrar error si zona supera ${MAX_CARACTERES_ZONA} caracteres`, () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleChange('zona', 'a'.repeat(MAX_CARACTERES_ZONA + 1));
        result.current.handleBlur('zona');
      });
      expect(result.current.errors.zona).toBe(`La zona no puede superar ${MAX_CARACTERES_ZONA} caracteres.`);
    });

    // Tarea 2.1.2
    it('debe mostrar error si habitaciones está vacío', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('habitaciones'); });
      expect(result.current.errors.habitaciones).toBe('El número de habitaciones es obligatorio.');
    });

    it(`debe mostrar error si habitaciones supera ${MAX_VALOR_NUMERICO}`, () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleChange('habitaciones', '51');
        result.current.handleBlur('habitaciones');
      });
      expect(result.current.errors.habitaciones).toBe(`Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`);
    });

    it('debe mostrar error si banios está vacío', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('banios'); });
      expect(result.current.errors.banios).toBe('El número de baños es obligatorio.');
    });

    it('debe mostrar error si plantas está vacío', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('plantas'); });
      expect(result.current.errors.plantas).toBe('El número de plantas es obligatorio.');
    });

    it('debe mostrar error si garajes está vacío', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('garajes'); });
      expect(result.current.errors.garajes).toBe('El número de garajes es obligatorio.');
    });

    it(`debe mostrar error si no hay imágenes`, () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => { result.current.handleBlur('imagenes'); });
      expect(result.current.errors.imagenes).toBe(`Debes subir al menos ${MIN_IMAGENES} imagen.`);
    });

    it('debe mostrar error si la imagen no es JPG o PNG', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleAgregarImagenes([crearImagen('doc.pdf', 'application/pdf')]);
        result.current.handleBlur('imagenes');
      });
      expect(result.current.errors.imagenes).toBe('Solo se permiten imágenes JPG y PNG.');
    });

    it(`debe mostrar error si la imagen supera ${TAMANO_MAXIMO_IMAGEN_MB}MB`, () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      act(() => {
        result.current.handleAgregarImagenes([crearImagen('grande.jpg', 'image/jpeg', TAMANO_MAXIMO_IMAGEN_MB + 1)]);
        result.current.handleBlur('imagenes');
      });
      expect(result.current.errors.imagenes).toBe(`Cada imagen no debe superar ${TAMANO_MAXIMO_IMAGEN_MB}MB.`);
    });
  });

  // ── handleSubmit — validaciones client-side ──────────────────────────────────

  describe('handleSubmit (validaciones client-side)', () => {
    it('no debe llamar onSuccess si hay campos vacíos', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      const onSuccess = jest.fn();

      act(() => { result.current.handleSubmit(onSuccess); });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('debe mostrar todos los errores al enviar con campos vacíos', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => { result.current.handleSubmit(jest.fn()); });

      expect(result.current.errors.direccion).toBeDefined();
      expect(result.current.errors.superficie).toBeDefined();
      expect(result.current.errors.departamento).toBeDefined();
      expect(result.current.errors.zona).toBeDefined();
      expect(result.current.errors.habitaciones).toBeDefined();
      expect(result.current.errors.banios).toBeDefined();
      expect(result.current.errors.plantas).toBeDefined();
      expect(result.current.errors.garajes).toBeDefined();
      expect(result.current.errors.imagenes).toBeDefined();
    });

    it('debe llamar onSuccess con valores correctos si todo es válido', () => {
      const { result } = renderHook(() => useCaracteristicasForm());
      const onSuccess = jest.fn();

      act(() => {
        result.current.handleChange('direccion',    valoresValidos.direccion);
        result.current.handleChange('superficie',   valoresValidos.superficie);
        result.current.handleChange('departamento', valoresValidos.departamento);
        result.current.handleChange('zona',         valoresValidos.zona);
        result.current.handleChange('habitaciones', valoresValidos.habitaciones);
        result.current.handleChange('banios',       valoresValidos.banios);
        result.current.handleChange('plantas',      valoresValidos.plantas);
        result.current.handleChange('garajes',      valoresValidos.garajes);
        result.current.handleAgregarImagenes(valoresValidos.imagenes);
      });

      act(() => { result.current.handleSubmit(onSuccess); });

      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        direccion:    valoresValidos.direccion,
        superficie:   valoresValidos.superficie,
        departamento: valoresValidos.departamento,
        zona:         valoresValidos.zona,
        habitaciones: valoresValidos.habitaciones,
        banios:       valoresValidos.banios,
        plantas:      valoresValidos.plantas,
        garajes:      valoresValidos.garajes,
      }));
    });
  });

  // ── handleReset ─────────────────────────────────────────────────────────────

  describe('handleReset', () => {
    it('debe limpiar todos los valores', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleChange('direccion', 'Av. Test 123');
        result.current.handleChange('habitaciones', '3');
        result.current.handleAgregarImagenes([crearImagen('foto.jpg')]);
        result.current.handleReset();
      });

      expect(result.current.values.direccion).toBe('');
      expect(result.current.values.habitaciones).toBe('');
      expect(result.current.values.imagenes).toEqual([]);
    });

    it('debe limpiar los errores', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleSubmit(jest.fn());
        result.current.handleReset();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  // ── isValid ─────────────────────────────────────────────────────────────────

  describe('isValid', () => {
    it('debe ser true cuando todos los campos son válidos', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleChange('direccion',    valoresValidos.direccion);
        result.current.handleChange('superficie',   valoresValidos.superficie);
        result.current.handleChange('departamento', valoresValidos.departamento);
        result.current.handleChange('zona',         valoresValidos.zona);
        result.current.handleChange('habitaciones', valoresValidos.habitaciones);
        result.current.handleChange('banios',       valoresValidos.banios);
        result.current.handleChange('plantas',      valoresValidos.plantas);
        result.current.handleChange('garajes',      valoresValidos.garajes);
        result.current.handleAgregarImagenes(valoresValidos.imagenes);
      });

      expect(result.current.isValid).toBe(true);
    });

    it('debe ser false si falta al menos un campo', () => {
      const { result } = renderHook(() => useCaracteristicasForm());

      act(() => {
        result.current.handleChange('direccion', 'Av. Test 123');
      });

      expect(result.current.isValid).toBe(false);
    });
  });

});