/** Archivo: redes-view.tsx
 * Dirección: alpha-ros-deploy1\app\perfil\views\redes-vinculadas\redes-view.tsx
 * Funcionalidad: Vista de Redes Vinculadas - conectada a la API real
 */
"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ConfirmModal from "@/app/perfil/views/redes-vinculadas/confirmModal"

interface RedesViewProps {
  onBack: () => void
}

interface RedVinculada {
  proveedor: string
  cuenta: string | null
  vinculada: boolean
  puedeDesvincular: boolean
}

// ── Iconos ──────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const iconos: Record<string, React.ReactNode> = {
  google:   <GoogleIcon />,
  discord:  <DiscordIcon />,
  facebook: <FacebookIcon />,
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function RedesView({ onBack }: RedesViewProps) {
  const searchParams = useSearchParams()

  const [redes, setRedes]   = useState<RedVinculada[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje]   = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)

  const [showVincularConfirm,    setShowVincularConfirm]    = useState(false)
  const [showDesvincularConfirm, setShowDesvincularConfirm] = useState(false)
  const [redSeleccionada,        setRedSeleccionada]        = useState<string | null>(null)

  // 1. Cargar redes desde la API
  const cargarRedes = async () => {
    setCargando(true)
    try {
      const res  = await fetch("/api/redes-vinculadas")
      const data = await res.json()
      if (data.redes) setRedes(data.redes)
    } catch (err) {
      console.error("Error cargando redes:", err)
      setMensaje({ texto: "Error al cargar las redes vinculadas.", tipo: "error" })
    } finally {
      setCargando(false)
    }
  }

  // 2. Leer params de la URL → success o error al volver del OAuth
  useEffect(() => {
    const success = searchParams.get("success")
    const error   = searchParams.get("error")

    if (success) {
      setMensaje({ texto: `${success} vinculado correctamente.`, tipo: "ok" })
    }
    if (error) {
      setMensaje({ texto: decodeURIComponent(error), tipo: "error" })
    }
  }, [searchParams])

  useEffect(() => {
    cargarRedes()
  }, [])

  // 3. Vincular → redirige al OAuth correspondiente
  const handleVincular = (proveedor: string) => {
    window.location.href = `/api/vincular/${proveedor}`
  }

  // 4. Desvincular → llama al endpoint POST
  const handleDesvincular = async (proveedor: string) => {
    try {
      const res  = await fetch("/api/desvincular", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ proveedor }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMensaje({ texto: data.error ?? "Error al desvincular.", tipo: "error" })
        return
      }

      setMensaje({ texto: `${proveedor} desvinculado correctamente.`, tipo: "ok" })
      await cargarRedes() // Recargar la lista
    } catch (err) {
      console.error("Error desvinculando:", err)
      setMensaje({ texto: "Error interno al desvincular.", tipo: "error" })
    }
  }

  const vinculadas  = redes.filter((r) => r.vinculada)
  const disponibles = redes.filter((r) => !r.vinculada)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-white">

      {/* Botón volver */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span className="text-xs uppercase tracking-widest">Seguridad</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-600/50">
        <div className="bg-white/10 p-2 rounded-full"><LinkIcon /></div>
        <div>
          <h2 className="text-xl font-bold">Redes vinculadas</h2>
          <p className="text-sm text-gray-300">Vincula o desvincula tus cuentas de Facebook y Discord</p>
        </div>
      </div>

      {/* Mensaje success/error */}
      {mensaje && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          mensaje.tipo === "ok"
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "bg-red-500/20 text-red-300 border border-red-500/30"
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Cargando */}
      {cargando && (
        <p className="text-sm text-gray-400 text-center py-8">Cargando redes...</p>
      )}

      {/* Vinculadas */}
      {!cargando && vinculadas.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Vinculadas</p>
          <div className="space-y-3">
            {vinculadas.map((red) => (
              <div key={red.proveedor} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  {iconos[red.proveedor]}
                  <div className="text-left">
                    <p className="font-semibold text-sm capitalize">{red.proveedor}</p>
                    <p className="text-xs text-gray-300">{red.cuenta ?? "Vinculado"}</p>
                  </div>
                </div>
                {/* Botón desvincular → solo si puedeDesvincular viene true desde la API */}
                {red.puedeDesvincular && (
                  <button
                    onClick={() => {
                      setRedSeleccionada(red.proveedor)
                      setShowDesvincularConfirm(true)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    Desvincular
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disponibles para vincular */}
      {!cargando && disponibles.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Disponibles para vincular</p>
          <div className="space-y-3">
            {disponibles.map((red) => (
              <div key={red.proveedor} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  {iconos[red.proveedor]}
                  <div className="text-left">
                    <p className="font-semibold text-sm capitalize">{red.proveedor}</p>
                    <p className="text-xs text-gray-300">No vinculado</p>
                  </div>
                </div>
                {/* Google no se puede vincular desde perfil */}
                {red.proveedor !== "google" && (
                  <button
                    onClick={() => {
                      setRedSeleccionada(red.proveedor)
                      setShowVincularConfirm(true)
                    }}
                    className="text-xs text-white bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-all duration-200 font-medium"
                  >
                    Vincular
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Desvincular */}
      {showDesvincularConfirm && redSeleccionada && (
        <ConfirmModal
          title="¿Desvincular?"
          description="Estás a punto de desvincular tu cuenta. ¿Deseas continuar?"
          confirmText="Sí, Desvincular"
          onCancel={() => setShowDesvincularConfirm(false)}
          onConfirm={() => {
            handleDesvincular(redSeleccionada)
            setShowDesvincularConfirm(false)
          }}
        />
      )}

      {/* Modal Vincular */}
      {showVincularConfirm && redSeleccionada && (
        <ConfirmModal
          title={`PROPBOL quiere utilizar ${redSeleccionada} para vincular tu cuenta`}
          description="Esto le permite a la app y al sitio compartir información acerca de ti."
          confirmText="Continuar"
          onCancel={() => setShowVincularConfirm(false)}
          onConfirm={() => {
            handleVincular(redSeleccionada)
            setShowVincularConfirm(false)
          }}
        />
      )}

    </div>
  )
}