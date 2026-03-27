import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartamentoSelect } from '../Components/DepartamentoSelect';
import { DEPARTAMENTOS } from '../Hooks/useCaracteristicasForm';

const defaultProps = {
  value:    '' as const,
  error:    undefined,
  touched:  false,
  onChange: jest.fn(),
  onBlur:   jest.fn(),
};

describe('DepartamentoSelect', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render', () => {
    it('debe renderizar el label Departamento', () => {
      render(<DepartamentoSelect {...defaultProps} />);
      expect(screen.getByText(/departamento/i)).toBeInTheDocument();
    });

    it('debe mostrar el placeholder "Seleccione una opción"', () => {
      render(<DepartamentoSelect {...defaultProps} />);
      expect(screen.getByText('Seleccione una opción')).toBeInTheDocument();
    });

    it('debe renderizar exactamente 9 opciones al abrir', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(9);
    });

    it('debe mostrar los 9 departamentos de Bolivia', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      DEPARTAMENTOS.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('debe mostrar Beni como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Beni')).toBeInTheDocument();
    });

    it('debe mostrar Chuquisaca como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Chuquisaca')).toBeInTheDocument();
    });

    it('debe mostrar Cochabamba como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Cochabamba')).toBeInTheDocument();
    });

    it('debe mostrar La Paz como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('La Paz')).toBeInTheDocument();
    });

    it('debe mostrar Oruro como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Oruro')).toBeInTheDocument();
    });

    it('debe mostrar Pando como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Pando')).toBeInTheDocument();
    });

    it('debe mostrar Potosí como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Potosí')).toBeInTheDocument();
    });

    it('debe mostrar Santa Cruz como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Santa Cruz')).toBeInTheDocument();
    });

    it('debe mostrar Tarija como opción', async () => {
      render(<DepartamentoSelect {...defaultProps} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Tarija')).toBeInTheDocument();
    });
  });

  describe('valor seleccionado', () => {
    it('debe mostrar valor vacío cuando no hay selección', () => {
      render(<DepartamentoSelect {...defaultProps} />);
      expect(screen.getByText('Seleccione una opción')).toBeInTheDocument();
    });

    it('debe reflejar cochabamba como valor seleccionado', () => {
      render(<DepartamentoSelect {...defaultProps} value="cochabamba" />);
      expect(screen.getByText('Cochabamba')).toBeInTheDocument();
    });

    it('debe reflejar santa_cruz como valor seleccionado', () => {
      render(<DepartamentoSelect {...defaultProps} value="santa_cruz" />);
      expect(screen.getByText('Santa Cruz')).toBeInTheDocument();
    });

    it('debe reflejar la_paz como valor seleccionado', () => {
      render(<DepartamentoSelect {...defaultProps} value="la_paz" />);
      expect(screen.getByText('La Paz')).toBeInTheDocument();
    });
  });

  describe('interacción', () => {
    it('debe llamar onChange con ("departamento", "cochabamba") al seleccionar Cochabamba', async () => {
      const onChange = jest.fn();
      render(<DepartamentoSelect {...defaultProps} onChange={onChange} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Cochabamba'));
      expect(onChange).toHaveBeenCalledWith('departamento', 'cochabamba');
    });

    it('debe llamar onChange con ("departamento", "santa_cruz") al seleccionar Santa Cruz', async () => {
      const onChange = jest.fn();
      render(<DepartamentoSelect {...defaultProps} onChange={onChange} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Santa Cruz'));
      expect(onChange).toHaveBeenCalledWith('departamento', 'santa_cruz');
    });

    it('debe llamar onChange exactamente una vez al seleccionar un departamento', async () => {
      const onChange = jest.fn();
      render(<DepartamentoSelect {...defaultProps} onChange={onChange} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Beni'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onBlur con "departamento" al salir del selector', async () => {
      const onBlur = jest.fn();
      render(<DepartamentoSelect {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledWith('departamento');
    });

    it('debe llamar onBlur exactamente una vez al salir del selector', async () => {
      const onBlur = jest.fn();
      render(<DepartamentoSelect {...defaultProps} onBlur={onBlur} />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('errores inline', () => {
    it('debe mostrar el error cuando existe y el campo fue tocado', () => {
      render(
        <DepartamentoSelect
          {...defaultProps}
          error="Selecciona un departamento."
          touched={true}
        />
      );
      expect(screen.getByText('Selecciona un departamento.')).toBeInTheDocument();
    });

    it('NO debe mostrar error si el campo no fue tocado', () => {
      render(
        <DepartamentoSelect
          {...defaultProps}
          error="Selecciona un departamento."
          touched={false}
        />
      );
      expect(screen.queryByText('Selecciona un departamento.')).not.toBeInTheDocument();
    });

    it('NO debe mostrar error si no existe error aunque el campo fue tocado', () => {
      render(
        <DepartamentoSelect
          {...defaultProps}
          error={undefined}
          touched={true}
        />
      );
      expect(screen.queryByText(/selecciona un departamento/i)).not.toBeInTheDocument();
    });
  });

});