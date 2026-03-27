/**
 * TDD – ImageUploader
 *
 * Criterios cubiertos:
 *  CA-8   Abre explorador de archivos al hacer clic en el ícono
 *  CA-9   Muestra vista previa tras carga válida
 *  CA-10  Deshabilita carga y avisa al llegar a 5 imágenes
 *  CA-21  Solo acepta JPG y PNG
 *  CA-22  Mínimo 1, máximo 5 imágenes
 *  CA-23  Rechaza imágenes con resolución < 1280×720
 *  CA-24  Solo acepta relación de aspecto 4:3 o 16:9
 *  CA-25  Rechaza archivos > 10 MB
 *
 * Escenarios negativos: 6, 7, 8, 9, 10
 * Escenarios positivos: 6, 7
 */

import React from 'react'
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react'
import { ImageUploader } from '../Components/ImageUploader'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeFile(name: string, type: string, sizeBytes = 1_000_000): File {
  const blob = new Blob([new ArrayBuffer(sizeBytes)], { type })
  return new File([blob], name, { type })
}

function mockImageDimensions(width: number, height: number) {
  const OriginalImage = global.Image

  // @ts-expect-error — reemplazamos Image globalmente solo en tests
  global.Image = class {
    width  = 0
    height = 0
    onload: (() => void) | null = null
    private _src = ''

    get src(): string { return this._src }

    set src(value: string) {
      this._src = value
      setTimeout(() => {
        this.width  = width
        this.height = height
        this.onload?.()
      }, 0)
    }
  }

  return () => { global.Image = OriginalImage }
}

// ─── suite principal ──────────────────────────────────────────────────────────

describe('ImageUploader', () => {

  beforeEach(() => {
    // jsdom no tiene estas propiedades — hay que definirlas antes de espiarlas
    let counter = 0
    global.URL.createObjectURL = jest.fn(() => `blob:fake-url-${++counter}`)
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ── CA-8 ─────────────────────────────────────────────────────────────────

  it('renderiza el área de carga con un input de tipo file oculto', () => {
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.accept).toMatch(/image\/jpeg/)
    expect(input.accept).toMatch(/image\/png/)
  })

  it('el botón/ícono de carga activa el input de archivo (CA-8)', () => {
    render(<ImageUploader />)
    const input    = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = jest.spyOn(input, 'click')
    fireEvent.click(screen.getByRole('button', { name: 'Subir imagen' }))
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  // ── CA-21 ────────────────────────────────────────────────────────────────

  it('rechaza un archivo con formato no soportado (CA-21 / Neg-6)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('doc.pdf', 'application/pdf')] } })
    })

    expect(
      await screen.findByText(/solo se aceptan.*jpg.*png|formato.*no.*permitido/i),
    ).toBeInTheDocument()
    restore()
  })

  // ── CA-25 ────────────────────────────────────────────────────────────────

  it('rechaza imagen que supera 10 MB (CA-25 / Neg-7)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile('grande.jpg', 'image/jpeg', 11 * 1024 * 1024)] },
      })
    })

    expect(
      await screen.findByText(/peso máximo.*10\s*mb|supera.*10\s*mb/i),
    ).toBeInTheDocument()
    restore()
  })

  // ── CA-23 ────────────────────────────────────────────────────────────────

  it('rechaza imagen con resolución menor a 1280×720 (CA-23 / Neg-8)', async () => {
    const restore = mockImageDimensions(800, 600)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('baja_res.jpg', 'image/jpeg')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(
      await screen.findByText(/resolución mínima.*1280.*720/i),
    ).toBeInTheDocument()
    restore()
  })

  // ── CA-24 ────────────────────────────────────────────────────────────────

  it('rechaza imagen con relación de aspecto incorrecta (CA-24)', async () => {
    const restore = mockImageDimensions(1500, 800) // ratio ≈ 1.875, ni 4:3 ni 16:9
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('raro.jpg', 'image/jpeg')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(
      await screen.findByText(/relación de aspecto.*4:3.*16:9|proporción.*no.*aceptada/i),
    ).toBeInTheDocument()
    restore()
  })

  it('acepta imagen con relación de aspecto 16:9 sin mostrar error (CA-24 / Pos-6)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('foto.jpg', 'image/jpeg')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(
      screen.queryByText(/relación de aspecto|proporción.*no.*aceptada/i),
    ).not.toBeInTheDocument()
    restore()
  })

  it('acepta imagen con relación de aspecto 4:3 sin mostrar error (CA-24 / Pos-6)', async () => {
    const restore = mockImageDimensions(1280, 960)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('foto43.png', 'image/png')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(
      screen.queryByText(/relación de aspecto|proporción.*no.*aceptada/i),
    ).not.toBeInTheDocument()
    restore()
  })

  // ── CA-9 ─────────────────────────────────────────────────────────────────

  it('muestra vista previa de imagen válida (CA-9 / Pos-6)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('inmueble.jpg', 'image/jpeg')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    const preview = await screen.findByRole('img', { name: 'Vista previa 1' })
    expect(preview).toBeInTheDocument()
    expect(preview.getAttribute('src')).toMatch(/^blob:fake-url-/)
    restore()
  })

  // ── CA-10 / CA-22 ────────────────────────────────────────────────────────

  it('deshabilita el botón y muestra aviso al cargar 5 imágenes (CA-10 / CA-22 / Neg-9)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        fireEvent.change(input, {
          target: { files: [makeFile(`img${i}.jpg`, 'image/jpeg')] },
        })
        await new Promise((r) => setTimeout(r, 50))
      })
    }

    expect(
      screen.getByRole('button', { name: 'Subir imagen' }),
    ).toBeDisabled()

    expect(
      screen.getByText(/límite.*5.*imágenes|máximo.*alcanzado/i),
    ).toBeInTheDocument()
    restore()
  })

  it('muestra 5 vistas previas al cargar el máximo permitido (Pos-7)', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        fireEvent.change(input, {
          target: { files: [makeFile(`img${i}.jpg`, 'image/jpeg')] },
        })
        await new Promise((r) => setTimeout(r, 50))
      })
    }

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('img', { name: `Vista previa ${i}` })).toBeInTheDocument()
    }
    restore()
  })

  // ── Neg-10 ───────────────────────────────────────────────────────────────

  it('muestra error externo cuando touched=true y no hay imágenes (CA-22 / Neg-10)', () => {
    render(<ImageUploader error="Se requiere mínimo una imagen" touched />)
    expect(screen.getByText(/se requiere mínimo una imagen/i)).toBeInTheDocument()
  })

  // ── Eliminación ──────────────────────────────────────────────────────────

  it('permite eliminar una imagen y re-habilita el botón de carga', async () => {
    const restore = mockImageDimensions(1920, 1080)
    render(<ImageUploader />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        fireEvent.change(input, {
          target: { files: [makeFile(`img${i}.jpg`, 'image/jpeg')] },
        })
        await new Promise((r) => setTimeout(r, 50))
      })
    }

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Eliminar imagen 1' }))
    })

    expect(screen.getAllByRole('img', { name: /vista previa/i })).toHaveLength(4)
    expect(
      screen.getByRole('button', { name: 'Subir imagen' }),
    ).not.toBeDisabled()
    restore()
  })

  // ── onChange ─────────────────────────────────────────────────────────────

  it('llama a onChange con la lista de archivos tras una carga válida', async () => {
    const restore  = mockImageDimensions(1920, 1080)
    const onChange = jest.fn()
    render(<ImageUploader onChange={onChange} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('casa.jpg', 'image/jpeg')] } })
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(File)]),
    )
    restore()
  })
})