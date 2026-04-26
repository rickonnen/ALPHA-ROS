'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPublicacionById } from '@/features/publicacion/BackendEditarPublicacion/getPublicacion'
import {
  SESSION_KEYS_TO_CLEAN,
  leerPaso, guardarPaso,
  leerCompletados, guardarCompletados,
  STEPS,
} from './Sessionutils'
import { limpiarImagenes } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/imagenesDB'

export function useFormularioState() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const idEditar      = searchParams.get('editar')
  const modoEdicion   = idEditar !== null
  const idPublicacion = idEditar ? parseInt(idEditar, 10) : null

  const imagenesRef      = useRef<File[]>([])
  const urlsQueQuedanRef = useRef<string[]>([])
  const urlsABorrarRef   = useRef<string[]>([])
  const pendingStepRef   = useRef<number | null>(null)

  const [currentStep,       setCurrentStep]       = useState<number>(0)
  const [completedSteps,    setCompletedSteps]    = useState<Set<number>>(new Set())
  const [hydrated,          setHydrated]          = useState(false)
  const [blockMsg,          setBlockMsg]          = useState<string | null>(null)
  const [isPublishing,      setIsPublishing]      = useState(false)
  const [publishError,      setPublishError]      = useState<string | null>(null)
  const [bolShowSumario,    setBolShowSumario]    = useState(false)
  const [isMobile,          setIsMobile]          = useState(false)
  const [datosListos,       setDatosListos]       = useState(!modoEdicion)
  const [imagenesIniciales, setImagenesIniciales] = useState<string[]>([])
  const [sessionKey,        setSessionKey]        = useState<string>('')

  // Detectar mobile
  useEffect(() => {
    const mq      = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Carga inicial
  useEffect(() => {
    imagenesRef.current      = []
    urlsQueQuedanRef.current = []
    urlsABorrarRef.current   = []

    if (!modoEdicion || !idPublicacion) {
      const keyEnStorage = sessionStorage.getItem('publicacion_sessionKey')

      let key: string

      if (keyEnStorage) {
        // F5/recarga: ya había key en sessionStorage → misma sesión → restaurar todo
        key = keyEnStorage
      } else {
        // Sin key → sesión nueva (vino de otra página) → limpiar todo
        SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
        limpiarImagenes()
        key = `session-${Date.now()}`
        sessionStorage.setItem('publicacion_sessionKey', key)
      }

      setSessionKey(key)

      const paso        = leerPaso()
      const completados = leerCompletados()
      setCurrentStep(paso)
      setCompletedSteps(completados)
      setHydrated(true)
      setDatosListos(true)

      return () => {
        // Al desmontar (salir del form) → borrar todo para próxima entrada limpia
        sessionStorage.removeItem('publicacion_sessionKey')
        SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
        limpiarImagenes()
      }
    }

    // Modo edición: siempre sesión nueva
    SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
    limpiarImagenes()
    const nuevaKey = `session-${Date.now()}`
    sessionStorage.setItem('publicacion_sessionKey', nuevaKey)
    setSessionKey(nuevaKey)

    getPublicacionById(idPublicacion).then(pub => {
      if (!pub) {
        router.replace('/publicacion/FormularioDinamico')
        return
      }

      urlsQueQuedanRef.current = pub.imagenesUrl
      urlsABorrarRef.current   = []
      setImagenesIniciales(pub.imagenesUrl)
      try { sessionStorage.setItem('imagenesIniciales', JSON.stringify(pub.imagenesUrl)) } catch { }

      try {
        sessionStorage.setItem('datosAviso', JSON.stringify({
          titulo:        pub.titulo,
          tipoOperacion: pub.tipoOperacion,
          precio:        pub.precio,
          tipoMoneda:    pub.tipoMoneda,
        }))
        sessionStorage.setItem('categoriaYEstado', JSON.stringify({
          tipoPropiedad:   pub.tipoPropiedad,
          estadoPropiedad: pub.estadoPropiedad,
        }))
        sessionStorage.setItem('ubicacion', JSON.stringify({
          direccion:    pub.direccion,
          departamento: pub.departamento,
          zona:         pub.zona,
          lat:          pub.lat,
          lng:          pub.lng,
        }))
        sessionStorage.setItem('caracteristicasDetalle', JSON.stringify({
          habitaciones: pub.habitaciones,
          banios:       pub.banios,
          garajes:      pub.garajes,
          plantas:      pub.plantas,
          superficie:   pub.superficie,
        }))
        sessionStorage.setItem('videoPropiedad', JSON.stringify({
          url: pub.videoUrl,
        }))
        sessionStorage.setItem('descripcionPropiedad', JSON.stringify({
          descripcion:     pub.descripcion,
          caracteristicas: pub.caracteristicasExtras ?? [],
        }))

        const todosCompletos = new Set([0, 1, 2, 3, 4, 5, 6])
        guardarCompletados(todosCompletos)
        setCompletedSteps(todosCompletos)
      } catch { }

      setCurrentStep(0)
      setHydrated(true)
      setDatosListos(true)
    })

    return () => {
      sessionStorage.removeItem('publicacion_sessionKey')
      SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
      limpiarImagenes()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persistir paso y completados (solo modo creación)
  useEffect(() => { if (hydrated && !modoEdicion) guardarPaso(currentStep) },           [currentStep,    hydrated, modoEdicion])
  useEffect(() => { if (hydrated && !modoEdicion) guardarCompletados(completedSteps) }, [completedSteps, hydrated, modoEdicion])

  const isFirstStep = currentStep === 0
  const isLastStep  = currentStep === STEPS.length - 1

  return {
    // router / params
    router,
    modoEdicion,
    idPublicacion,
    // refs
    imagenesRef,
    urlsQueQuedanRef,
    urlsABorrarRef,
    pendingStepRef,
    // state
    currentStep,      setCurrentStep,
    completedSteps,   setCompletedSteps,
    hydrated,
    blockMsg,         setBlockMsg,
    isPublishing,     setIsPublishing,
    publishError,     setPublishError,
    bolShowSumario,   setBolShowSumario,
    isMobile,
    datosListos,
    imagenesIniciales,
    sessionKey,
    // derivados
    isFirstStep,
    isLastStep,
  }
}