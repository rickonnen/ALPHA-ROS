/* HU-05
   CA-3:  Abrir este panel al presionar "¿Deseas reactivar tu cuenta?"
   CA-4:  Mostrar instrucciones claras para contactar soporte
   CA-5:  Validar email con formato inválido
   CA-6:  Botón deshabilitado si email vacío
   CA-7:  Pantalla de confirmación al enviar correctamente
   CA-8:  Indicar que la respuesta llega en máx. 24 horas
   CA-14: Avisar si ya hay solicitud pendiente (sessionStorage)
   CA-15: Permitir reenvío si pasaron 24h
   CA-16: Botón "← Volver" al login
   CA-17: Soporte para tipo de cuenta Google
*/
"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Mail, Send } from "lucide-react";

interface ReactivacionCuentaFormProps {
  onBack: () => void;
  // email prellenado desde el LoginForm (si el usuario ya escribió su correo)
  emailPrellenado?: string;
}

type Step = "form" | "success";

const STORAGE_KEY = "reactivacion_solicitud";

interface SolicitudGuardada {
  email: string;
  timestamp: number;
}

const TIPOS_CUENTA = [
  "Creada con correo y contraseña",
  "Creada con Google",
  "Creada con Facebook",
  "Creada con Discord",
];

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
  emailPrellenado = "",
}: ReactivacionCuentaFormProps) {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState(emailPrellenado);
  const [tipoCuenta, setTipoCuenta] = useState(TIPOS_CUENTA[0]);
  const [motivo, setMotivo] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  // CA-14: solicitud duplicada
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Ingresa un correo electrónico válido.";
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
          tipoCuenta,
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
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "700",
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            padding: "0",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={13} />
          SEGURIDAD
        </button>

        {/* Título del panel */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#1F3A4D22",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clock size={18} color="#1F3A4D" />
          </div>
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1F3A4D",
                margin: "0 0 2px 0",
              }}
            >
              {step === "success" ? "Solicitud Enviada" : "Reactivación de cuenta"}
            </h2>
            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
              Reactiva tu cuenta.
            </p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "16px 0 0 0" }} />
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
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid #1F3A4D44",
              backgroundColor: "transparent",
              color: "#1F3A4D",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ← Volver al inicio de sesión
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
          <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
            Para reactivar tu cuenta, completa el formulario. Te enviaremos un
            correo de confirmación y nuestro equipo de soporte procesará tu
            solicitud en un plazo máximo de <strong>24 horas</strong>.
          </p>

          {/* Tipo de cuenta CA-17 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Tipo de cuenta
            </label>
            <select
              value={tipoCuenta}
              onChange={(e) => setTipoCuenta(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#333",
                backgroundColor: "white",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {TIPOS_CUENTA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Email de la cuenta desactivada CA-5, CA-6 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email de la cuenta desactivada
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${emailError ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "6px",
                padding: "10px 12px",
                gap: "10px",
                backgroundColor: emailError ? "#fee2e2" : "#1F3A4D",
              }}
            >
              <Mail size={16} color={emailError ? "#ef4444" : "#94a3b8"} />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setEmailError(validateEmail(email))}
                style={{
                  width: "100%",
                  fontSize: "13px",
                  outline: "none",
                  border: "none",
                  backgroundColor: "transparent",
                  color: emailError ? "#333" : "white",
                }}
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
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Motivo de la desactivación{" "}
              <span style={{ fontWeight: "400", color: "#9ca3af" }}>(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Solicité la desactivación por error..."
              rows={3}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#333",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Error de API */}
          {apiError && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "#ef4444",
              }}
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
                !isFormValid() ? "#C26E5A88" : "#C26E5A",
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