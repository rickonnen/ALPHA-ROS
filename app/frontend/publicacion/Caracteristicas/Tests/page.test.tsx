import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CaracteristicasPage from '../page'

describe('CaracteristicasPage', () => {

  describe('render', () => {
    it('debe mostrar el título "CARACTERISTICAS DEL INMUEBLE"', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByText(/caracteristicas del inmueble/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Dirección', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Superficie', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/superficie/i)).toBeInTheDocument()
    })

    it('debe mostrar el selector Departamento', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Zona', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/zona/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Nro de Habitaciones', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/nro de habitaciones/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Nro de Baños', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/nro de baños/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Nro de Garajes', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/nro de garajes/i)).toBeInTheDocument()
    })

    it('debe mostrar el campo Nro de Plantas', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByLabelText(/nro de plantas/i)).toBeInTheDocument()
    })

    it('debe mostrar el botón Regresar', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByRole('button', { name: /regresar/i })).toBeInTheDocument()
    })

    it('debe mostrar el botón Publicar', () => {
      render(<CaracteristicasPage />)
      expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
    })

    it('el botón Regresar debe aparecer antes que el botón Publicar', () => {
      render(<CaracteristicasPage />)
      const buttons = screen.getAllByRole('button')
      const backIndex    = buttons.findIndex(b => /regresar/i.test(b.textContent ?? ''))
      const submitIndex  = buttons.findIndex(b => /publicar/i.test(b.textContent ?? ''))
      expect(backIndex).toBeLessThan(submitIndex)
    })
  })

  describe('validaciones al presionar Publicar con campos vacíos', () => {
    it('debe mostrar error de dirección', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/la dirección es obligatoria/i)).toBeInTheDocument()
    })

    it('debe mostrar error de superficie', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/la superficie es obligatoria/i)).toBeInTheDocument()
    })

    it('debe mostrar error de departamento', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/selecciona un departamento/i)).toBeInTheDocument()
    })

    it('debe mostrar error de zona', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/la zona es obligatoria/i)).toBeInTheDocument()
    })

    it('debe mostrar error de habitaciones', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/el número de habitaciones es obligatorio/i)).toBeInTheDocument()
    })

    it('debe mostrar error de baños', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/el número de baños es obligatorio/i)).toBeInTheDocument()
    })

    it('debe mostrar error de garajes', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/el número de garajes es obligatorio/i)).toBeInTheDocument()
    })

    it('debe mostrar error de plantas', async () => {
      render(<CaracteristicasPage />)
      await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
      expect(screen.getByText(/el número de plantas es obligatorio/i)).toBeInTheDocument()
    })
  })

  describe('bugs estáticos', () => {
    it('no debe haber campos duplicados en el formulario', () => {
      render(<CaracteristicasPage />)
      const habitacionesFields = screen.getAllByLabelText(/nro de habitaciones/i)
      expect(habitacionesFields).toHaveLength(1)
    })

    it('todos los inputs deben tener un id único', () => {
      render(<CaracteristicasPage />)
      const inputs = document.querySelectorAll('input')
      const ids = Array.from(inputs).map(i => i.id).filter(Boolean)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('todos los labels deben estar asociados a un input', () => {
      render(<CaracteristicasPage />)
      const labels = document.querySelectorAll('label')
      labels.forEach(label => {
        const forAttr = label.getAttribute('for')
        if (forAttr) {
          expect(document.getElementById(forAttr)).not.toBeNull()
        }
      })
    })

    it('los botones Regresar y Publicar deben estar alineados a la derecha', () => {
      render(<CaracteristicasPage />)
      const actionsContainer = screen.getByTestId('form-actions')
      expect(actionsContainer).toHaveClass('justify-end')
    })
  })

})