"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Mail, Send, X } from "lucide-react";
import { isValidEmail, getSuspiciousDomainSuggestion } from "@/lib/utils";
import { sanitizarTextoLibre } from "@/lib/utils";

interface ReactivacionCuentaFormProps {
  onBack: () => void;
  onHome?: () => void;
  // email prellenado desde el LoginForm (si el usuario ya escribió su correo)
  emailPrellenado?: string;
}

type Step = "form" | "success";

const STORAGE_KEY = "reactivacion_solicitud";
const MAX_MOTIVO = 500;

interface SolicitudGuardada {
  email: string;
  timestamp: number;
}

// 24 horas en ms
const VEINTICUATRO_HORAS = 24 * 60 * 60 * 1000;

function getSolicitudGuardada(): SolicitudGuardada | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SolicitudGuardada;
  } catch {
    return null;
  }
}

function guardarSolicitud(email: string) {
  if (typeof window === "undefined") return;
  const data: SolicitudGuardada = { email, timestamp: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function limpiarSolicitud() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function solicitudEsReciente(guardada: SolicitudGuardada): boolean {
  return Date.now() - guardada.timestamp < VEINTICUATRO_HORAS;
}

export default function ReactivacionCuentaForm({
  onBack,
  onHome,
  emailPrellenado = "",
}: ReactivacionCuentaFormProps) {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState(emailPrellenado);
  const [motivo, setMotivo] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [solicitudPendiente, setSolicitudPendiente] = useState(false);
  const [solicitudEmail, setSolicitudEmail] = useState("");

  useEffect(() => {
    const guardada = getSolicitudGuardada();
    if (guardada && solicitudEsReciente(guardada)) {
      setSolicitudPendiente(true);
      setSolicitudEmail(guardada.email);
    } else if (guardada) {
      // Pasaron más de 24h, limpiar para permitir reenvío (CA-15)
      limpiarSolicitud();
    }
  }, []);

  function validateEmail(value: string): string {
    if (!value.trim()) return "El correo electrónico es obligatorio.";
    if (!isValidEmail(value.trim())) {
      const suggestion = getSuspiciousDomainSuggestion(value.trim());
      if (suggestion)
        return `Ingresa un correo electrónico válido. ¿Quisiste escribir ${value.trim().split("@")[0]}@${suggestion}?`;
      return "Ingresa un correo válido (gmail.com, outlook.com, hotmail.com, icloud.com, yahoo.com o .edu).";
    }
    return "";
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(validateEmail(value));
    if (apiError) setApiError("");
  }

  function isFormValid(): boolean {
    return email.trim() !== "" && !emailError && !loading;
  }

  async function handleSubmit() {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError("");
    setApiError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/solicitar-reactivacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          motivo: motivo.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // CA-14: guardar en sessionStorage para detectar solicitud pendiente
        guardarSolicitud(email.trim());
        setStep("success");
      } else {
        setApiError(data.error || "Error al enviar la solicitud. Intenta nuevamente.");
      }
    } catch {
      setApiError("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  // CA-15: reenviar después de 24h
  function handleReenviar() {
    limpiarSolicitud();
    setSolicitudPendiente(false);
    setSolicitudEmail("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Header con breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[13px] font-bold text-[#B47B65] hover:underline"
          style={{ padding: "0" }}
          >
            <ArrowLeft size={15} />
          Login
        </button>
        {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[13px] font-bold text-[#B47B65] hover:underline"
              style={{ padding: "0" }}
            >
              <X size={15} />
              Volver al inicio
            </button>
          )}
        </div>

        {/* Título del panel */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-[#1F3A4D22] dark:bg-slate-600/40"
          >
            <Clock size={18} className="text-[#1F3A4D] dark:text-slate-200" />
          </div>
          <div>
            <h2
              className="text-[20px] font-extrabold text-slate-900 dark:text-slate-100"
              style={{ margin: "0 0 2px 0" }}
            >
              {step === "success" ? "Solicitud Enviada" : "Reactivación de cuenta"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400" style={{ margin: 0 }}>
              Reactiva tu cuenta.
            </p>
          </div>
        </div>

        <hr className="border-t border-slate-200 dark:border-slate-600" style={{ margin: "16px 0 0 0" }} />
      </div>

      {/* ── PANTALLA DE ÉXITO (CA-7, CA-8) ── */}
      {step === "success" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Badge "En revisión" */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                backgroundColor: "#1F3A4D",
                color: "white",
                borderRadius: "20px",
                padding: "6px 18px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Clock size={13} />
              En revisión — máx. 24 horas
            </div>
          </div>

          {/* Mensaje */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "18px",
              fontSize: "13px",
              color: "#444",
              lineHeight: "1.7",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              Tu solicitud fue recibida por nuestro equipo de soporte.
            </p>
            <p style={{ margin: "0 0 8px 0" }}>
              Recibirás un correo de confirmación en{" "}
              <strong style={{ color: "#1F3A4D" }}>{email}</strong> y otro
              cuando tu cuenta sea reactivada.
            </p>
            <p style={{ margin: 0 }}>
              Si no recibes respuesta en 24 horas, puedes reenviar la solicitud.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#C26E5A",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}

      {/* ── FORMULARIO ── */}
      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* CA-14: Aviso solicitud pendiente */}
          {solicitudPendiente && (
            <div
              style={{
                backgroundColor: "#FEF9EC",
                border: "1px solid #F59E0B55",
                borderRadius: "8px",
                padding: "14px 16px",
                fontSize: "13px",
                color: "#92400E",
                lineHeight: "1.6",
              }}
            >
              <p style={{ margin: "0 0 6px 0", fontWeight: "700" }}>
                ⏳ Ya tienes una solicitud en proceso
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                Ya enviaste una solicitud para{" "}
                <strong>{solicitudEmail}</strong>. El equipo de soporte la está
                revisando (máx. 24 horas).
              </p>
              <button
                type="button"
                onClick={handleReenviar}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#92400E",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Reenviar de todas formas →
              </button>
            </div>
          )}

          {/* Instrucciones CA-4 */}
          <p className="text-[13px] text-slate-600 dark:text-slate-300" style={{ margin: 0, lineHeight: "1.6" }}>
            Para reactivar tu cuenta, completa el formulario. Te enviaremos un
            correo de confirmación y nuestro equipo de soporte procesará tu
            solicitud en un plazo máximo de <strong>24 horas</strong>.
          </p>

          {/* Email de la cuenta desactivada CA-5, CA-6 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-700 dark:text-slate-300">
              Email de la cuenta desactivada
            </label>
            <div
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 border ${emailError ? "border-red-500 bg-red-100 dark:bg-red-950/30" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-[#3a3a3a]"}`}
            >
              <Mail size={16} className={emailError ? "text-red-500" : "text-slate-400"} />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setEmailError(validateEmail(email))}
                className="w-full text-[13px] text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400 bg-transparent outline-none border-0"
              />
            </div>
            {/* CA-5: mensaje de error de validación */}
            {emailError && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>
                {emailError}
              </p>
            )}
          </div>

          {/* Motivo (opcional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-700 dark:text-slate-300">
              Motivo de la desactivación{" "}
              <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(sanitizarTextoLibre(e.target.value).slice(0, MAX_MOTIVO))}
              placeholder="Ej: Solicité la desactivación por error..."
              rows={3}
              maxLength={MAX_MOTIVO}
              className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none dark:border-slate-600 dark:bg-[#3a3a3a] dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <p
              style={{
                fontSize: "11px",
                margin: 0,
                textAlign: "right",
                color: motivo.length >= MAX_MOTIVO ? "#ef4444" : motivo.length >= MAX_MOTIVO * 0.9 ? "#F59E0B" : "#94a3b8",
                fontWeight: motivo.length >= MAX_MOTIVO ? "700" : "400",
              }}
            >
              {MAX_MOTIVO - motivo.length} caracteres restantes
            </p>
          </div>

          {/* Error de API */}
          {apiError && (
            <div
              className="rounded-md border border-red-200 bg-red-100 px-3.5 py-3 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              {apiError}
            </div>
          )}

          {/* Botón enviar — CA-6: deshabilitado si email vacío */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                !isFormValid() ? "#8B4A3D" : "#C26E5A",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: !isFormValid() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Enviando...
              </>
            ) : (
              <>
                <Send size={15} />
                Enviar Email
              </>
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}