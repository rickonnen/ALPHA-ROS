import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DireccionForm } from '../Components/DireccionForm';

const defaultProps = {
  addressValue:   '',
  addressError:   undefined,
  addressTouched: false,
  areaValue:      '',
  areaError:      undefined,
  areaTouched:    false,
  onChange:       jest.fn(),
  onBlur:         jest.fn(),
};

describe('DireccionForm', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render', () => {
    it('debe renderizar el label "Dirección"', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    });

    it('debe renderizar el label "Superficie"', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByLabelText(/superficie/i)).toBeInTheDocument();
    });

    it('el campo Superficie debe tener placeholder "0.00 m²"', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('0.00 m²')).toBeInTheDocument();
    });

    it('debe renderizar el ícono de geolocalización', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /geolocalización|ubicación|location/i })).toBeInTheDocument();
    });

    it('el ícono de geolocalización debe ser interactivo', async () => {
      render(<DireccionForm {...defaultProps} />);
      const geoButton = screen.getByRole('button', { name: /geolocalización|ubicación|location/i });
      await userEvent.click(geoButton);
      expect(geoButton).toBeInTheDocument();
    });

    it('debe mostrar el valor actual en el campo Dirección', () => {
      render(<DireccionForm {...defaultProps} addressValue="Av. América 456" />);
      expect(screen.getByLabelText(/dirección/i)).toHaveValue('Av. América 456');
    });

    it('debe mostrar el valor actual en el campo Superficie', () => {
      render(<DireccionForm {...defaultProps} areaValue="150.5" />);
      expect(screen.getByLabelText(/superficie/i)).toHaveValue(150.5);
    });

    it('el campo Dirección debe estar vacío por defecto', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByLabelText(/dirección/i)).toHaveValue('');
    });

    it('el campo Superficie debe ser de tipo numérico', () => {
      render(<DireccionForm {...defaultProps} />);
      expect(screen.getByLabelText(/superficie/i)).toHaveAttribute('type', 'number');
    });
  });

  describe('interacción — Dirección', () => {
    it('debe llamar onChange con ("direccion", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<DireccionForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/dirección/i), 'A');
      expect(onChange).toHaveBeenCalledWith('direccion', expect.stringContaining('A'));
    });

    it('debe llamar onBlur con "direccion" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<DireccionForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/dirección/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('direccion');
    });

    it('debe llamar onBlur exactamente una vez', async () => {
      const onBlur = jest.fn();
      render(<DireccionForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/dirección/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('debe permitir entrada de texto libre', async () => {
      const onChange = jest.fn();
      render(<DireccionForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/dirección/i), 'Av. Blanco Galindo 123');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('interacción — Superficie', () => {
    it('debe llamar onChange con ("superficie", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<DireccionForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/superficie/i), '1');
      expect(onChange).toHaveBeenCalledWith('superficie', expect.stringContaining('1'));
    });

    it('debe llamar onBlur con "superficie" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<DireccionForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/superficie/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('superficie');
    });

    it('debe llamar onBlur exactamente una vez', async () => {
      const onBlur = jest.fn();
      render(<DireccionForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/superficie/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('errores inline — Dirección', () => {
    it('debe mostrar error cuando existe y el campo fue tocado', () => {
      render(<DireccionForm {...defaultProps} addressError="La dirección es obligatoria." addressTouched={true} />);
      expect(screen.getByText('La dirección es obligatoria.')).toBeInTheDocument();
    });

    it('NO debe mostrar error si el campo no fue tocado', () => {
      render(<DireccionForm {...defaultProps} addressError="La dirección es obligatoria." addressTouched={false} />);
      expect(screen.queryByText('La dirección es obligatoria.')).not.toBeInTheDocument();
    });

    it('NO debe mostrar error si no existe error', () => {
      render(<DireccionForm {...defaultProps} addressError={undefined} addressTouched={true} />);
      expect(screen.queryByText(/dirección es obligatoria/i)).not.toBeInTheDocument();
    });
  });

  describe('errores inline — Superficie', () => {
    it('debe mostrar error cuando existe y el campo fue tocado', () => {
      render(<DireccionForm {...defaultProps} areaError="La superficie es obligatoria." areaTouched={true} />);
      expect(screen.getByText('La superficie es obligatoria.')).toBeInTheDocument();
    });

    it('debe mostrar error cuando la superficie no es mayor a 0', () => {
      render(<DireccionForm {...defaultProps} areaError="La superficie debe ser un número mayor a 0." areaTouched={true} />);
      expect(screen.getByText('La superficie debe ser un número mayor a 0.')).toBeInTheDocument();
    });

    it('NO debe mostrar error si el campo no fue tocado', () => {
      render(<DireccionForm {...defaultProps} areaError="La superficie es obligatoria." areaTouched={false} />);
      expect(screen.queryByText('La superficie es obligatoria.')).not.toBeInTheDocument();
    });

    it('NO debe mostrar error si no existe error', () => {
      render(<DireccionForm {...defaultProps} areaError={undefined} areaTouched={true} />);
      expect(screen.queryByText(/superficie es obligatoria/i)).not.toBeInTheDocument();
    });
  });

});
