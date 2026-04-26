'use client'

import { useCallback } from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { publicarInmueble } from '@/features/publicacion/BackendFormulario/actions'
import { actualizarPublicacion } from '@/features/publicacion/BackendEditarPublicacion/updatePublicacion'
import { SESSION_KEYS_TO_CLEAN, STEPS, ESTADO_IDS, parseIntNullableClient } from './Sessionutils'

type TriggerRef = React.MutableRefObject<(() => void) | null>

interface UsePublicarParams {
  router:                   AppRouterInstance
  modoEdicion:              boolean
  idPublicacion:            number | null
  currentStep:              number
  completedSteps:           Set<number>
  isFirstStep:              boolean
  isLastStep:               boolean
  setCurrentStep:           (fn: number | ((p: number) => number)) => void
  setCompletedSteps:        (fn: (p: Set<number>) => Set<number>) => void
  setBlockMsg:              (msg: string | null) => void
  setPublishError:          (err: string | null) => void
  setIsPublishing:          (v: boolean) => void
  setBolShowSumario:        (v: boolean) => void
  // ── Modales de límite ──────────────────────────────────────
  setBolShowFreeModal:      (v: boolean) => void   // HU5: límite gratuito
  setBolShowPlanLimitModal: (v: boolean) => void   // HU7: límite plan de pago
  // ──────────────────────────────────────────────────────────
  imagenesRef:              React.MutableRefObject<File[]>
  urlsQueQuedanRef:         React.MutableRefObject<string[]>
  urlsABorrarRef:           React.MutableRefObject<string[]>
  pendingStepRef:           React.MutableRefObject<number | null>
  triggerRefs:              Record<number, TriggerRef>
}

export function usePublicar({
  router, modoEdicion, idPublicacion,
  currentStep, completedSteps, isFirstStep, isLastStep,
  setCurrentStep, setCompletedSteps,
  setBlockMsg, setPublishError, setIsPublishing, setBolShowSumario,
  setBolShowFreeModal, setBolShowPlanLimitModal,
  imagenesRef, urlsQueQuedanRef, urlsABorrarRef, pendingStepRef,
  triggerRefs,
}: UsePublicarParams) {

  const advanceDirect = useCallback(() => {
    if (isLastStep) return
    setBlockMsg(null)
    setCompletedSteps(prev => { const next = new Set(prev); next.add(currentStep); return next })
    const target = pendingStepRef.current
    pendingStepRef.current = null
    setCurrentStep(target !== null ? target : prev => prev + 1)
  }, [isLastStep, currentStep, setBlockMsg, setCompletedSteps, setCurrentStep, pendingStepRef])

  const handleUrlsChange = useCallback((quedan: string[], aBorrar: string[]) => {
    urlsQueQuedanRef.current = quedan
    urlsABorrarRef.current   = aBorrar
  }, [urlsQueQuedanRef, urlsABorrarRef])

  const handlePublicar = useCallback(async () => {
    setPublishError(null)
    setIsPublishing(true)
    try {
      const datosAviso      = JSON.parse(sessionStorage.getItem('datosAviso')             ?? '{}')
      const categoria       = JSON.parse(sessionStorage.getItem('categoriaYEstado')       ?? '{}')
      const ubicacion       = JSON.parse(sessionStorage.getItem('ubicacion')              ?? '{}')
      const caracteristicas = JSON.parse(sessionStorage.getItem('caracteristicasDetalle') ?? '{}')
      const video           = JSON.parse(sessionStorage.getItem('videoPropiedad')         ?? '{}')
      const descripcion     = JSON.parse(sessionStorage.getItem('descripcionPropiedad')   ?? '{}')

      const esTerreno = categoria.tipoPropiedad === 'Terreno'

      const formData = new FormData()
      formData.append('titulo',             datosAviso.titulo              ?? '')
      formData.append('tipoOperacion',      datosAviso.tipoOperacion       ?? '')
      formData.append('precio',             String(datosAviso.precio       ?? '0'))
      formData.append('tipoMoneda',         datosAviso.tipoMoneda          ?? 'USD')
      formData.append('tipoInmueble',       categoria.tipoPropiedad        ?? '')
      formData.append('estadoConstruccion', String(ESTADO_IDS[categoria.estadoPropiedad as string] ?? 1))
      formData.append('direccion',          ubicacion.direccion            ?? '')
      formData.append('departamento',       ubicacion.departamento         ?? '')
      formData.append('zona',               ubicacion.zona                 ?? '')
      if (ubicacion.lat) formData.append('lat', String(ubicacion.lat))
      if (ubicacion.lng) formData.append('lng', String(ubicacion.lng))

      const toNullableStr = (val: string | undefined | null): string => {
        if (esTerreno) return 'null'
        const n = parseIntNullableClient(val)
        return n === null ? 'null' : String(n)
      }

      formData.append('habitaciones', toNullableStr(caracteristicas.habitaciones))
      formData.append('banios',       toNullableStr(caracteristicas.banios))
      formData.append('garajes',      toNullableStr(caracteristicas.garajes))
      formData.append('plantas',      toNullableStr(caracteristicas.plantas))
      formData.append('superficie',   String(caracteristicas.superficie ?? '0'))
      formData.append('videoUrl',     video.url        ?? '')
      formData.append('descripcion',  descripcion.descripcion ?? '')

      const caracteristicasExtras = (descripcion.caracteristicas ?? []).map(
        (c: { id_caracteristica: number; titulo: string; detalle: string }) => ({
          id_caracteristica: c.id_caracteristica,
          detalle:           c.detalle || null,
        })
      )
      formData.append('caracteristicasExtras', JSON.stringify(caracteristicasExtras))

      if (modoEdicion && idPublicacion) {
        if (imagenesRef.current.length > 0) {
          imagenesRef.current.forEach(f => formData.append('imagenes', f))
        }
        urlsQueQuedanRef.current.forEach(url => formData.append('imagenesViejas',  url))
        urlsABorrarRef.current.forEach(url   => formData.append('imagenesABorrar', url))

        const result = await actualizarPublicacion(idPublicacion, formData)
        if (result.success) {
          SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
          router.push(`/publicacion/Mi_inmueble/${result.idPublicacion}`)
        } else {
          const firstError = Object.values(result.errors ?? {}).flat()[0] as string | undefined
          setPublishError(firstError ?? 'Error al guardar. Intenta de nuevo.')
        }

      } else {
        if (imagenesRef.current.length === 0) {
          setPublishError('Debes subir al menos 1 imagen.')
          setIsPublishing(false)
          return
        }
        imagenesRef.current.forEach(f => formData.append('imagenes', f))

        const result = await publicarInmueble(formData)

        if (result.success) {
          SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
          router.push(`/publicacion/Mi_inmueble/${result.idPublicacion}`)

        } else if (result.reason === 'LIMITE_PLAN_ALCANZADO') {
          // Modal HU7: tiene plan de pago pero agotó sus publicaciones
          setBolShowPlanLimitModal(true)

        } else if (result.reason === 'LIMITE_ALCANZADO') {
          // Modal HU5: agotó sus 2 publicaciones gratuitas
          setBolShowFreeModal(true)

        } else {
          const firstError = Object.values(result.errors ?? {}).flat()[0] as string | undefined
          setPublishError(firstError ?? 'Error al publicar. Intenta de nuevo.')
        }
      }
    } catch (err) {
      setPublishError(`Error inesperado: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    } finally {
      setIsPublishing(false)
    }
  }, [
    router, modoEdicion, idPublicacion,
    imagenesRef, urlsQueQuedanRef, urlsABorrarRef,
    setPublishError, setIsPublishing,
    setBolShowFreeModal, setBolShowPlanLimitModal,
  ])

  const handleNext = useCallback(() => {
    pendingStepRef.current = null
    setBlockMsg(null)
    setPublishError(null)
    if (isLastStep) { triggerRefs[currentStep]?.current?.(); return }
    if (currentStep === 5) { advanceDirect(); return }
    setCompletedSteps(prev => { const next = new Set(prev); next.delete(currentStep); return next })
    triggerRefs[currentStep]?.current?.()
  }, [isLastStep, currentStep, advanceDirect, triggerRefs, pendingStepRef, setBlockMsg, setPublishError, setCompletedSteps])

  const handleBack = useCallback(() => {
    pendingStepRef.current = null
    setBlockMsg(null)
    setPublishError(null)
    if (isFirstStep) router.back()
    else setCurrentStep(prev => prev - 1)
  }, [isFirstStep, router, setCurrentStep, pendingStepRef, setBlockMsg, setPublishError])

  const handleSidebarClick = useCallback((index: number) => {
    setBlockMsg(null)
    setPublishError(null)
    if (index === currentStep) return
    if (index < currentStep) { pendingStepRef.current = null; setCurrentStep(index); return }
    const intermediosCompletos = STEPS
      .slice(0, index)
      .every((step, i) => i === currentStep || step.opcional || completedSteps.has(i))
    if (!intermediosCompletos) {
      setBlockMsg('Debes completar los pasos anteriores antes de avanzar a este.')
      return
    }
    if (currentStep === 5) { setCurrentStep(index); return }
    pendingStepRef.current = index
    setCompletedSteps(prev => { const next = new Set(prev); next.delete(currentStep); return next })
    triggerRefs[currentStep]?.current?.()
  }, [currentStep, completedSteps, triggerRefs, pendingStepRef, setCurrentStep, setCompletedSteps, setBlockMsg, setPublishError])

  return {
    advanceDirect,
    handleUrlsChange,
    handlePublicar,
    handleNext,
    handleBack,
    handleSidebarClick,
  }
}