import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitacionesForm } from '../Components/HabitacionesForm';
import { MAX_VALOR_NUMERICO } from '../Hooks/useCaracteristicasForm';

const defaultProps = {
  bedroomsValue:  '',
  bathroomsValue: '',
  floorsValue:    '',
  garagesValue:   '',
  errors: {
    habitaciones: undefined as string | undefined,
    banios:       undefined as string | undefined,
    plantas:      undefined as string | undefined,
    garajes:      undefined as string | undefined,
  },
  touched: {
    habitaciones: false,
    banios:       false,
    plantas:      false,
    garajes:      false,
  },
  onChange: jest.fn(),
  onBlur:   jest.fn(),
};

describe('HabitacionesForm', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render', () => {
    it('debe renderizar el label "Nro de Habitaciones"', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de habitaciones/i)).toBeInTheDocument();
    });

    it('debe renderizar el label "Nro de Baños"', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de baños/i)).toBeInTheDocument();
    });

    it('debe renderizar el label "Nro de Garajes"', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de garajes/i)).toBeInTheDocument();
    });

    it('debe renderizar el label "Nro de Plantas"', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de plantas/i)).toBeInTheDocument();
    });

    it('todos los campos deben ser de tipo texto con inputMode numérico', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de habitaciones/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/nro de habitaciones/i)).toHaveAttribute('inputMode', 'numeric');
      expect(screen.getByLabelText(/nro de baños/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/nro de baños/i)).toHaveAttribute('inputMode', 'numeric');
      expect(screen.getByLabelText(/nro de garajes/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/nro de garajes/i)).toHaveAttribute('inputMode', 'numeric');
      expect(screen.getByLabelText(/nro de plantas/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/nro de plantas/i)).toHaveAttribute('inputMode', 'numeric');
    });

    it('debe mostrar los campos vacíos por defecto', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.getByLabelText(/nro de habitaciones/i)).toHaveValue('');
      expect(screen.getByLabelText(/nro de baños/i)).toHaveValue('');
      expect(screen.getByLabelText(/nro de garajes/i)).toHaveValue('');
      expect(screen.getByLabelText(/nro de plantas/i)).toHaveValue('');
    });

    it('debe reflejar los valores recibidos como props', () => {
      render(<HabitacionesForm {...defaultProps} bedroomsValue="3" bathroomsValue="2" garagesValue="1" floorsValue="2" />);
      expect(screen.getByLabelText(/nro de habitaciones/i)).toHaveValue('3');
      expect(screen.getByLabelText(/nro de baños/i)).toHaveValue('2');
      expect(screen.getByLabelText(/nro de garajes/i)).toHaveValue('1');
      expect(screen.getByLabelText(/nro de plantas/i)).toHaveValue('2');
    });
  });

  describe('interacción', () => {
    it('debe llamar onChange con ("habitaciones", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), '3');
      expect(onChange).toHaveBeenCalledWith('habitaciones', expect.stringContaining('3'));
    });

    it('debe llamar onChange con ("banios", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de baños/i), '2');
      expect(onChange).toHaveBeenCalledWith('banios', expect.stringContaining('2'));
    });

    it('debe llamar onChange con ("garajes", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de garajes/i), '1');
      expect(onChange).toHaveBeenCalledWith('garajes', expect.stringContaining('1'));
    });

    it('debe llamar onChange con ("plantas", valor) al escribir', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de plantas/i), '2');
      expect(onChange).toHaveBeenCalledWith('plantas', expect.stringContaining('2'));
    });

    it('debe llamar onBlur con "habitaciones" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<HabitacionesForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/nro de habitaciones/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('habitaciones');
    });

    it('debe llamar onBlur con "banios" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<HabitacionesForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/nro de baños/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('banios');
    });

    it('debe llamar onBlur con "garajes" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<HabitacionesForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/nro de garajes/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('garajes');
    });

    it('debe llamar onBlur con "plantas" al salir del campo', async () => {
      const onBlur = jest.fn();
      render(<HabitacionesForm {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText(/nro de plantas/i));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('plantas');
    });
  });

  describe('filtrado de entrada', () => {
    it('debe ignorar letras al escribir en habitaciones', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), 'abc');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).toMatch(/^[0-9]*$/);
      });
    });

    it('debe ignorar el signo negativo en habitaciones', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), '-3');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('-');
      });
    });

    it('debe ignorar el punto decimal en habitaciones', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), '1.5');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('.');
      });
    });

    it('debe ignorar la letra e en habitaciones', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), '1e5');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('e');
      });
    });

    it('debe ignorar letras al escribir en baños', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de baños/i), 'abc');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).toMatch(/^[0-9]*$/);
      });
    });

    it('debe ignorar el signo negativo en baños', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de baños/i), '-2');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('-');
      });
    });

    it('debe ignorar letras al escribir en garajes', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de garajes/i), 'xyz');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).toMatch(/^[0-9]*$/);
      });
    });

    it('debe ignorar el punto decimal en garajes', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de garajes/i), '1.5');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('.');
      });
    });

    it('debe ignorar la letra e en garajes', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de garajes/i), '1e5');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('e');
      });
    });

    it('debe ignorar letras al escribir en plantas', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de plantas/i), 'abc');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).toMatch(/^[0-9]*$/);
      });
    });

    it('debe ignorar el signo negativo en plantas', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de plantas/i), '-2');
      onChange.mock.calls.forEach(([, valor]) => {
        expect(valor).not.toContain('-');
      });
    });

    it('debe permitir dígitos válidos en todos los campos', async () => {
      const onChange = jest.fn();
      render(<HabitacionesForm {...defaultProps} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText(/nro de habitaciones/i), '3');
      await userEvent.type(screen.getByLabelText(/nro de baños/i), '2');
      await userEvent.type(screen.getByLabelText(/nro de garajes/i), '1');
      await userEvent.type(screen.getByLabelText(/nro de plantas/i), '2');
      expect(onChange).toHaveBeenCalledWith('habitaciones', '3');
      expect(onChange).toHaveBeenCalledWith('banios', '2');
      expect(onChange).toHaveBeenCalledWith('garajes', '1');
      expect(onChange).toHaveBeenCalledWith('plantas', '2');
    });
  });

  describe('errores inline', () => {
    it('debe mostrar error de habitaciones cuando existe y fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, habitaciones: 'El número de habitaciones es obligatorio.' }} touched={{ ...defaultProps.touched, habitaciones: true }} />);
      expect(screen.getByText('El número de habitaciones es obligatorio.')).toBeInTheDocument();
    });

    it('NO debe mostrar error de habitaciones si no fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, habitaciones: 'El número de habitaciones es obligatorio.' }} touched={{ ...defaultProps.touched, habitaciones: false }} />);
      expect(screen.queryByText('El número de habitaciones es obligatorio.')).not.toBeInTheDocument();
    });

    it(`debe mostrar error cuando habitaciones supera ${MAX_VALOR_NUMERICO}`, () => {
      const errorMsg = `Debe ser un número entero entre 1 y ${MAX_VALOR_NUMERICO}.`;
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, habitaciones: errorMsg }} touched={{ ...defaultProps.touched, habitaciones: true }} />);
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('debe mostrar error de baños cuando existe y fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, banios: 'El número de baños es obligatorio.' }} touched={{ ...defaultProps.touched, banios: true }} />);
      expect(screen.getByText('El número de baños es obligatorio.')).toBeInTheDocument();
    });

    it('NO debe mostrar error de baños si no fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, banios: 'El número de baños es obligatorio.' }} touched={{ ...defaultProps.touched, banios: false }} />);
      expect(screen.queryByText('El número de baños es obligatorio.')).not.toBeInTheDocument();
    });

    it('debe mostrar error de garajes cuando existe y fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, garajes: 'El número de garajes es obligatorio.' }} touched={{ ...defaultProps.touched, garajes: true }} />);
      expect(screen.getByText('El número de garajes es obligatorio.')).toBeInTheDocument();
    });

    it('NO debe mostrar error de garajes si no fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, garajes: 'El número de garajes es obligatorio.' }} touched={{ ...defaultProps.touched, garajes: false }} />);
      expect(screen.queryByText('El número de garajes es obligatorio.')).not.toBeInTheDocument();
    });

    it('debe mostrar error de plantas cuando existe y fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, plantas: 'El número de plantas es obligatorio.' }} touched={{ ...defaultProps.touched, plantas: true }} />);
      expect(screen.getByText('El número de plantas es obligatorio.')).toBeInTheDocument();
    });

    it('NO debe mostrar error de plantas si no fue tocado', () => {
      render(<HabitacionesForm {...defaultProps} errors={{ ...defaultProps.errors, plantas: 'El número de plantas es obligatorio.' }} touched={{ ...defaultProps.touched, plantas: false }} />);
      expect(screen.queryByText('El número de plantas es obligatorio.')).not.toBeInTheDocument();
    });

    it('NO debe mostrar ningún error cuando todos los campos son válidos', () => {
      render(<HabitacionesForm {...defaultProps} />);
      expect(screen.queryByText(/obligatorio/i)).not.toBeInTheDocument();
    });
  });

});