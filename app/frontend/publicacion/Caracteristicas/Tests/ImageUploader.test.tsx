import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploader } from '../components/ImageUploader';
import {
  MAX_IMAGENES,
  MIN_IMAGENES,
  TAMANO_MAXIMO_IMAGEN_MB,
  MIN_RESOLUCION_ANCHO,
  MIN_RESOLUCION_ALTO,
} from '../Hooks/useCaracteristicasForm';

// ─── Helper ───────────────────────────────────────────────────────────────────

const createFile = (name: string, type = 'image/jpeg', sizeMB = 1) =>
  new File([new ArrayBuffer(sizeMB * 1024 * 1024)], name, { type });

// ─── Props base ───────────────────────────────────────────────────────────────

const defaultProps = {
  images:     [] as File[],
  error:      undefined as string | undefined,
  touched:    false,
  canAddMore: true,
  onAdd:      jest.fn(),
  onRemove:   jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ImageUploader', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  describe('render', () => {
    it('debe renderizar el label "Insertar imagen de la propiedad"', () => {
      render(<ImageUploader {...defaultProps} />);
      expect(screen.getByText(/insertar imagen de la propiedad/i)).toBeInTheDocument();
    });

    it('debe renderizar un input de tipo file', () => {
      render(<ImageUploader {...defaultProps} />);
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    it('el input file debe aceptar solo JPG y PNG', () => {
      render(<ImageUploader {...defaultProps} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', expect.stringMatching(/image\/jpeg|image\/png|\.jpg|\.png/i));
    });

    it('el input file debe soportar selección múltiple', () => {
      render(<ImageUploader {...defaultProps} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('debe mostrar el ícono de archivo interactivo', () => {
      render(<ImageUploader {...defaultProps} />);
      const fileIcon = screen.getByRole('button', { name: /archivo|subir|imagen|file/i });
      expect(fileIcon).toBeInTheDocument();
    });

    it('el input file debe estar habilitado cuando canAddMore es true', () => {
      render(<ImageUploader {...defaultProps} canAddMore={true} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).not.toBeDisabled();
    });

    it('no debe mostrar miniaturas cuando no hay imágenes cargadas', () => {
      render(<ImageUploader {...defaultProps} />);
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });
  });

  // ── Vista previa ─────────────────────────────────────────────────────────────

  describe('vista previa', () => {
    it('debe mostrar una miniatura al cargar una imagen', () => {
      render(<ImageUploader {...defaultProps} images={[createFile('foto.jpg')]} />);
      expect(screen.getAllByRole('img')).toHaveLength(1);
    });

    it('debe mostrar tres miniaturas al cargar tres imágenes', () => {
      const images = [createFile('foto1.jpg'), createFile('foto2.jpg'), createFile('foto3.jpg')];
      render(<ImageUploader {...defaultProps} images={images} />);
      expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    it(`debe mostrar ${MAX_IMAGENES} miniaturas al llegar al máximo`, () => {
      const images = Array.from({ length: MAX_IMAGENES }, (_, i) => createFile(`foto${i}.jpg`));
      render(<ImageUploader {...defaultProps} images={images} canAddMore={false} />);
      expect(screen.getAllByRole('img')).toHaveLength(MAX_IMAGENES);
    });
  });

  // ── Agregar imágenes ─────────────────────────────────────────────────────────

  describe('agregar imágenes', () => {
    it('debe llamar onAdd con el archivo seleccionado', async () => {
      const onAdd = jest.fn();
      render(<ImageUploader {...defaultProps} onAdd={onAdd} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const image = createFile('foto.jpg');
      await userEvent.upload(fileInput, image);
      expect(onAdd).toHaveBeenCalledWith([image]);
    });

    it('debe llamar onAdd con múltiples archivos seleccionados', async () => {
      const onAdd = jest.fn();
      render(<ImageUploader {...defaultProps} onAdd={onAdd} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const images = [createFile('foto1.jpg'), createFile('foto2.jpg')];
      await userEvent.upload(fileInput, images);
      expect(onAdd).toHaveBeenCalledWith(images);
    });
  });

  // ── Límite de imágenes ───────────────────────────────────────────────────────

  describe('límite de imágenes', () => {
    it('debe deshabilitar el input file cuando canAddMore es false', () => {
      const images = Array.from({ length: MAX_IMAGENES }, (_, i) => createFile(`foto${i}.jpg`));
      render(<ImageUploader {...defaultProps} images={images} canAddMore={false} />);
      expect(document.querySelector('input[type="file"]')).toBeDisabled();
    });

    it(`debe mostrar mensaje de límite alcanzado cuando hay ${MAX_IMAGENES} imágenes`, () => {
      const images = Array.from({ length: MAX_IMAGENES }, (_, i) => createFile(`foto${i}.jpg`));
      render(<ImageUploader {...defaultProps} images={images} canAddMore={false} />);
      expect(screen.getByText(new RegExp(`límite|máximo|${MAX_IMAGENES}`, 'i'))).toBeInTheDocument();
    });

    it('debe mantener el input habilitado con menos del máximo de imágenes', () => {
      const images = Array.from({ length: MAX_IMAGENES - 1 }, (_, i) => createFile(`foto${i}.jpg`));
      render(<ImageUploader {...defaultProps} images={images} canAddMore={true} />);
      expect(document.querySelector('input[type="file"]')).not.toBeDisabled();
    });
  });

  // ── Eliminar imágenes ────────────────────────────────────────────────────────

  describe('eliminar imágenes', () => {
    it('debe mostrar un botón de eliminar por cada imagen cargada', () => {
      const images = [createFile('foto1.jpg'), createFile('foto2.jpg')];
      render(<ImageUploader {...defaultProps} images={images} />);
      const removeButtons = screen.getAllByRole('button', { name: /eliminar|borrar|quitar|remove/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('debe llamar onRemove con índice 0 al eliminar la primera imagen', async () => {
      const onRemove = jest.fn();
      const images = [createFile('foto1.jpg'), createFile('foto2.jpg')];
      render(<ImageUploader {...defaultProps} images={images} onRemove={onRemove} />);
      const removeButtons = screen.getAllByRole('button', { name: /eliminar|borrar|quitar|remove/i });
      await userEvent.click(removeButtons[0]);
      expect(onRemove).toHaveBeenCalledWith(0);
    });

    it('debe llamar onRemove con índice 1 al eliminar la segunda imagen', async () => {
      const onRemove = jest.fn();
      const images = [createFile('foto1.jpg'), createFile('foto2.jpg')];
      render(<ImageUploader {...defaultProps} images={images} onRemove={onRemove} />);
      const removeButtons = screen.getAllByRole('button', { name: /eliminar|borrar|quitar|remove/i });
      await userEvent.click(removeButtons[1]);
      expect(onRemove).toHaveBeenCalledWith(1);
    });

    it('debe llamar onRemove exactamente una vez al hacer click', async () => {
      const onRemove = jest.fn();
      render(<ImageUploader {...defaultProps} images={[createFile('foto.jpg')]} onRemove={onRemove} />);
      await userEvent.click(screen.getByRole('button', { name: /eliminar|borrar|quitar|remove/i }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  // ── Errores inline ───────────────────────────────────────────────────────────

  describe('errores inline', () => {
    it(`debe mostrar error cuando no hay imágenes y el campo fue tocado`, () => {
      render(<ImageUploader {...defaultProps} error={`Debes subir al menos ${MIN_IMAGENES} imagen.`} touched={true} />);
      expect(screen.getByText(`Debes subir al menos ${MIN_IMAGENES} imagen.`)).toBeInTheDocument();
    });

    it('NO debe mostrar error si el campo no fue tocado', () => {
      render(<ImageUploader {...defaultProps} error={`Debes subir al menos ${MIN_IMAGENES} imagen.`} touched={false} />);
      expect(screen.queryByText(`Debes subir al menos ${MIN_IMAGENES} imagen.`)).not.toBeInTheDocument();
    });

    it('debe mostrar error cuando el formato no es JPG ni PNG', () => {
      render(<ImageUploader {...defaultProps} error="Solo se permiten imágenes JPG y PNG." touched={true} />);
      expect(screen.getByText('Solo se permiten imágenes JPG y PNG.')).toBeInTheDocument();
    });

    it(`debe mostrar error cuando la imagen supera ${TAMANO_MAXIMO_IMAGEN_MB}MB`, () => {
      render(<ImageUploader {...defaultProps} error={`Cada imagen no debe superar ${TAMANO_MAXIMO_IMAGEN_MB}MB.`} touched={true} />);
      expect(screen.getByText(`Cada imagen no debe superar ${TAMANO_MAXIMO_IMAGEN_MB}MB.`)).toBeInTheDocument();
    });

    it(`debe mostrar error cuando la resolución es menor a ${MIN_RESOLUCION_ANCHO}x${MIN_RESOLUCION_ALTO}px`, () => {
      render(<ImageUploader {...defaultProps} error={`La resolución mínima es ${MIN_RESOLUCION_ANCHO}x${MIN_RESOLUCION_ALTO}px.`} touched={true} />);
      expect(screen.getByText(`La resolución mínima es ${MIN_RESOLUCION_ANCHO}x${MIN_RESOLUCION_ALTO}px.`)).toBeInTheDocument();
    });

    it('debe mostrar error cuando se superan las 5 imágenes', () => {
      render(<ImageUploader {...defaultProps} error={`No puedes subir más de ${MAX_IMAGENES} imágenes.`} touched={true} />);
      expect(screen.getByText(`No puedes subir más de ${MAX_IMAGENES} imágenes.`)).toBeInTheDocument();
    });

    it('NO debe mostrar error si no existe error aunque el campo fue tocado', () => {
      render(<ImageUploader {...defaultProps} error={undefined} touched={true} />);
      expect(screen.queryByText(/permiten|superar|resolución|mínima/i)).not.toBeInTheDocument();
    });
  });

});
