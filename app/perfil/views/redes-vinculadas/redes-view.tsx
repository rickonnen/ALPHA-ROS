/*redes-view.tsx*/
"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ConfirmModal from "@/app/perfil/views/redes-vinculadas/confirmModal"
import {
  DiscordConfirmVincular,
  DiscordSuccessVincular,
  DiscordConfirmDesvincular,
  DiscordSuccessDesvincular,
  DiscordError,
} from "@/app/perfil/views/redes-vinculadas/discordmodal"
import {
  LinkedInConfirmVincular,
  LinkedInSuccessVincular,
  LinkedInConfirmDesvincular,
  LinkedInSuccessDesvincular,
  LinkedInError,
} from "@/app/perfil/views/redes-vinculadas/linkedInmodal"
 
interface RedesViewProps {
  onBack: () => void
}
interface RedVinculada {
  proveedor: string
  cuenta: string | null
  vinculada: boolean
  puedeDesvincular: boolean
}
 
type ModalActivo =
  | "confirm-vincular"
  | "success-vincular"
  | "error"
  | "confirm-desvincular"
  | "success-desvincular"
  | null
 
//  Iconos
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
const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
  linkedin: <LinkedInIcon />,
}
//  Componente 
export default function RedesView({ onBack }: RedesViewProps) {
  const searchParams = useSearchParams()
  const [redes, setRedes]   = useState<RedVinculada[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje]   = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)
  const [showVincularConfirm,    setShowVincularConfirm]    = useState(false)
  const [showDesvincularConfirm, setShowDesvincularConfirm] = useState(false)
  const [redSeleccionada,        setRedSeleccionada]        = useState<string | null>(null)
  const [modalActivo,  setModalActivo]  = useState<ModalActivo>(null)
  const [redNueva,     setRedNueva]     = useState<string | null>(null)
  // 1. Cargar redes desde la API
  const cargarRedes = async () => {
    setCargando(true)
    try {
      const res  = await fetch("/api/redes-vinculadas")
      const data = await res.json()
      if (!res.ok) {
        setMensaje({ texto: data?.error ?? "Error al cargar las redes vinculadas.", tipo: "error" })
        return
      }
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
    if (success === "discord" || success === "linkedin") {
      setRedNueva(success)
      setModalActivo("success-vincular")
    } else if (success) {
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
  // 4. Desvincular Facebook → banner (flujo original sin cambios)
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
      await cargarRedes()
    } catch (err) {
      console.error("Error desvinculando:", err)
      setMensaje({ texto: "Error interno al desvincular.", tipo: "error" })
    }
  }
  // 5. Desvincular Discord / LinkedIn → muestra modal de resultado
  const handleDesvincularNuevo = async (proveedor: string) => {
    try {
      const res = await fetch("/api/desvincular", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ proveedor }),
      })
      if (res.ok) {
        setModalActivo("success-desvincular")
        await cargarRedes()
      } else {
        setModalActivo("error")
      }
    } catch {
      setModalActivo("error")
    }
  }
  const cerrarModalNuevo = () => {
    setModalActivo(null)
    setRedNueva(null)
  }
  const renderModalNuevo = () => {
    if (!modalActivo || !redNueva) return null
 
    if (redNueva === "discord") {
      if (modalActivo === "confirm-vincular")
        return <DiscordConfirmVincular onClose={cerrarModalNuevo} onConfirm={() => { cerrarModalNuevo(); handleVincular("discord") }} />
      if (modalActivo === "success-vincular")
        return <DiscordSuccessVincular onClose={cerrarModalNuevo} />
      if (modalActivo === "confirm-desvincular")
        return <DiscordConfirmDesvincular onClose={cerrarModalNuevo} onConfirm={() => { setModalActivo(null); handleDesvincularNuevo("discord") }} />
      if (modalActivo === "success-desvincular")
        return <DiscordSuccessDesvincular onClose={cerrarModalNuevo} />
      if (modalActivo === "error")
        return <DiscordError onClose={cerrarModalNuevo} />
    }
    if (redNueva === "linkedin") {
      if (modalActivo === "confirm-vincular")
        return <LinkedInConfirmVincular onClose={cerrarModalNuevo} onConfirm={() => { cerrarModalNuevo(); handleVincular("linkedin") }} />
      if (modalActivo === "success-vincular")
        return <LinkedInSuccessVincular onClose={cerrarModalNuevo} />
      if (modalActivo === "confirm-desvincular")
        return <LinkedInConfirmDesvincular onClose={cerrarModalNuevo} onConfirm={() => { setModalActivo(null); handleDesvincularNuevo("linkedin") }} />
      if (modalActivo === "success-desvincular")
        return <LinkedInSuccessDesvincular onClose={cerrarModalNuevo} />
      if (modalActivo === "error")
        return <LinkedInError onClose={cerrarModalNuevo} />
    }
    return null
  }
  const vinculadas  = redes.filter((r) => r.vinculada)
  const disponibles = redes.filter((r) => !r.vinculada)
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-white p-8">

      {/* Botón volver */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-xs uppercase tracking-widest font-bold">Seguridad</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-600/50">
        <div className="bg-white/10 p-2 rounded-full"><LinkIcon /></div>
        <div>
          <h2 className="text-xl font-bold">Redes vinculadas</h2>
          <p className="text-sm text-gray-300">Vincula o desvincula tus cuentas de Facebook, Discord y LinkedIn</p>
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
              <div key={red.proveedor} className="w-full flex justify-between items-center gap-3 bg-white/10 p-5 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                  {iconos[red.proveedor]}
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm capitalize">{red.proveedor}</p>
                    <p className="text-xs text-gray-300 truncate">
                      {red.proveedor === "google" ? red.cuenta : "Vinculado"}
                    </p>
                  </div>
                </div>
                {red.puedeDesvincular && (
                  <button
                    onClick={() => {
                      if (red.proveedor === "facebook") {
                        setRedSeleccionada(red.proveedor)
                        setShowDesvincularConfirm(true)
                      } else {
                        setRedNueva(red.proveedor)
                        setModalActivo("confirm-desvincular")
                      }
                    }}
                    style={{
                      width: "120px",
                      minWidth: "120px",
                      maxWidth: "120px",
                      height: "36px",
                      background: "#FFF",
                      border: "none",
                      borderRadius: "10px",
                      color: "#1E3B4F",
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "14px",
                      fontWeight: 900,
                      lineHeight: "120%",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
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
              <div key={red.proveedor} className="w-full flex justify-between items-center bg-white/10 p-5 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 min-w-0">
                  {iconos[red.proveedor]}
                  <div className="text-left">
                    <p className="font-semibold text-sm capitalize">{red.proveedor}</p>
                    <p className="text-xs text-gray-300">No vinculado</p>
                  </div>
                </div>
                {red.proveedor !== "google" && (
                  <button
                    onClick={() => {
                      if (red.proveedor === "facebook") {
                        setRedSeleccionada(red.proveedor)
                        setShowVincularConfirm(true)
                      } else {
                        setRedNueva(red.proveedor)
                        setModalActivo("confirm-vincular")
                      }
                    }}
                    style={{
                      width: "120px",
                      height: "36px",
                      background: "#1E3B4F",
                      border: "1px solid #5F7382",
                      borderRadius: "10px",
                      color: "#FFF",
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "14px",
                      fontWeight: 900,
                      lineHeight: "120%",
                      cursor: "pointer",
                    }}
                  >
                    Vincular
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
 
      {renderModalNuevo()}
 
      {/* Modal Desvincular Facebook */}
      {showDesvincularConfirm && redSeleccionada && (
        <ConfirmModal
          title="Desvincular?"
          description="Estas a punto de desvincular tu cuenta. Deseas continuar?"
          confirmText="Si, Desvincular"
          cancelText="Cancelar"
          onCancel={() => setShowDesvincularConfirm(false)}
          onConfirm={() => {
            handleDesvincular(redSeleccionada)
            setShowDesvincularConfirm(false)
          }}
        />
      )}
 
      {/* Modal Vincular Facebook */}
      {showVincularConfirm && redSeleccionada && (
        <ConfirmModal
          title={`PROPBOL quiere utilizar ${redSeleccionada} para vincular tu cuenta`}
          description="Esto le permite a la app y al sitio compartir informacion acerca de ti."
          confirmText="Continuar"
          cancelText="Cancelar"
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