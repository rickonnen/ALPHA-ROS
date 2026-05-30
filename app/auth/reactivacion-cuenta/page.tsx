"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Mail, Send, X } from "lucide-react"

export default function ReactivacionCuentaPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "success">("form")
  const [email, setEmail] = useState("")
  const [motivo, setMotivo] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  function validateEmail(value: string): string {
    if (!value.trim()) return "El correo electrónico es obligatorio."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Ingresa un correo electrónico válido."
    return ""
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (emailError) setEmailError(validateEmail(value))
    if (apiError) setApiError("")
  }

  function isFormValid(): boolean {
    return email.trim() !== "" && !emailError && !loading
  }

  async function handleSubmit() {
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError("")
    setApiError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/solicitar-reactivacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          motivo: motivo.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStep("success")
      } else {
        setApiError(data.error || "Error al enviar la solicitud. Intenta nuevamente.")
      }
    } catch {
      setApiError("Error de conexión. Verifica tu internet e intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => router.push("/")} />

      <div className="relative w-full max-w-[480px] h-full bg-[#EAE3D9] dark:bg-[#2b2b2b] shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-[#B47B65] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <ArrowLeft size={16} /> Login
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-[#B47B65] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <X size={16} /> Volver al inicio
          </button>
        </div>

        <div className="overflow-y-auto pr-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1F3A4D22] dark:bg-slate-600/40">
              <Clock size={20} className="text-[#1F3A4D] dark:text-slate-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {step === "success" ? "Solicitud Enviada" : "Reactivación de cuenta"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reactiva tu cuenta.</p>
            </div>
          </div>

          <hr className="border-t border-slate-200 dark:border-slate-600 mb-4 mt-4" />

          {step === "success" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="bg-[#1F3A4D] text-white rounded-full px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5">
                  <Clock size={13} />
                  En revisión — máx. 24 horas
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#3a3a3a] rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="mb-2">Tu solicitud fue recibida por nuestro equipo de soporte.</p>
                <p className="mb-2">
                  Recibirás un correo de confirmación en{" "}
                  <strong className="text-[#1F3A4D] dark:text-slate-100">{email}</strong> y otro cuando tu cuenta sea reactivada.
                </p>
                <p>Si no recibes respuesta en 24 horas, puedes reenviar la solicitud.</p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-lg border border-[#1F3A4D44] bg-transparent text-[#1F3A4D] dark:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ← Volver al inicio
              </button>
            </div>
          )}

          {step === "form" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Para reactivar tu cuenta, completa el formulario. Se procesará tu solicitud en un plazo máximo de <strong>24 horas</strong>.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Email de la cuenta desactivada
                </label>
                <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border ${emailError ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-[#3a3a3a]"}`}>
                  <Mail size={16} className={emailError ? "text-red-500" : "text-slate-400"} />
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => setEmailError(validateEmail(email))}
                    className="w-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent outline-none border-0"
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs">{emailError}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Motivo de la desactivación{" "}
                  <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setMotivo(e.target.value)
                  }}
                  placeholder="Ej: Solicité la desactivación por error..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#3a3a3a] px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
                  {500 - motivo.length} caracteres restantes
                </p>
              </div>

              {apiError && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-3 text-sm text-red-600 dark:text-red-300">
                  {apiError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="w-full py-3 rounded-lg border-none text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                style={{
                  backgroundColor: !isFormValid() ? "#8B4A3D" : "#C26E5A",
                  cursor: !isFormValid() ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Enviar Email
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}