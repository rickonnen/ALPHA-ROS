/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc
    Fecha: 28/03/2026
    Funcionalidad: Vista de confirmación de nuevo correo por OTP (mock frontend)
      - Se implementa UI de confirmación de correo con estilo coherente al módulo Seguridad
      - Se muestran props de contexto:
        id_usuario y nuevo_email (con máscara visual)
      - Se agrega captura de OTP de 6 dígitos con:
        auto-focus por casilla, soporte de pegado y navegación con backspace
      - Se agrega temporizador de expiración (10 min) y estado de envío
      - Se conecta botón Cancelar con onBack para retornar a Cambiar correo
      - Se dejan handlers mock para Reenviar código y Confirmar (pendiente backend OTP)
*/
/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc
    Fecha: 28/03/2026
    Funcionalidad: Confirmación de cambio de correo por OTP (mock frontend)
      - Props:
        @param {string} id_usuario
        @param {string} nuevo_email
        @param {() => void} onBack
      - Incluye:
        captura OTP (6 dígitos), timer (10 min), reenviar y confirmar (mock)
      - Flujo:
        Cancelar -> onBack (volver a Cambiar correo)
*/
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResultModal from "@/components/ui/modal";
interface ConfirmarCorreoProps {
  id_usuario: string;
  nuevo_email: string;
  expires_in_sec?: number;
  resend_after_sec?: number;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const OTP_EXP_SECONDS_FALLBACK = 600; // 10 min
const OTP_RESEND_SECONDS_FALLBACK = 60;

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0] ?? "*"}*@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

export default function ConfirmarCorreoView({
  id_usuario,
  nuevo_email,
  expires_in_sec,
  resend_after_sec,
  onBack,
}: ConfirmarCorreoProps) {
  const intInitialOtpSeconds = expires_in_sec ?? OTP_EXP_SECONDS_FALLBACK;
  const intInitialResendSeconds =
    resend_after_sec ?? OTP_RESEND_SECONDS_FALLBACK;
  const [arrOtp, setArrOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [intTimeLeft, setIntTimeLeft] = useState(intInitialOtpSeconds);
  const [intResendLeft, setIntResendLeft] = useState(intInitialResendSeconds);
  const [bolSubmitting, setBolSubmitting] = useState(false);
  const arrRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [bolShowResultModal, setBolShowResultModal] = useState(false);
  const [strModalType, setStrModalType] = useState<"success" | "error">(
    "error",
  );
  const [strModalTitle, setStrModalTitle] = useState("");
  const [strModalMessage, setStrModalMessage] = useState("");
  const [bolRedirectToPerfilOnClose, setBolRedirectToPerfilOnClose] =
    useState(false);

  const strOtp = useMemo(() => arrOtp.join(""), [arrOtp]);
  const bolOtpCompleto = arrOtp.every((digit) => digit !== "");

  useEffect(() => {
    if (intTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setIntTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [intTimeLeft]);

  useEffect(() => {
    if (intResendLeft <= 0) return;
    const timer = setInterval(() => {
      setIntResendLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [intResendLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const openErrorModal = (message: string) => {
    setStrModalType("error");
    setStrModalTitle("No se pudo continuar");
    setStrModalMessage(message);
    setBolShowResultModal(true);
  };

  const openSuccessModal = (
    title: string,
    message: string,
    bolRedirect = false,
  ) => {
    setStrModalType("success");
    setStrModalTitle(title);
    setStrModalMessage(message);
    setBolRedirectToPerfilOnClose(bolRedirect);
    setBolShowResultModal(true);
  };

  const handleCloseModal = () => {
    setBolShowResultModal(false);
    setStrModalTitle("");
    setStrModalMessage("");

    if (bolRedirectToPerfilOnClose) {
      window.location.reload();
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...arrOtp];
      next[idx] = "";
      setArrOtp(next);
      return;
    }

    const next = [...arrOtp];
    next[idx] = clean[0];
    setArrOtp(next);

    if (idx < OTP_LENGTH - 1) {
      arrRefs.current[idx + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !arrOtp[idx] && idx > 0) {
      arrRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < OTP_LENGTH; i++) {
      next[i] = pasted[i] ?? "";
    }
    setArrOtp(next);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH) - 1;
    if (focusIdx >= 0) arrRefs.current[focusIdx]?.focus();
  };

  const handleCancelar = () => {
    onBack();
  };

  const handleReenviar = async () => {
    try {
      setBolSubmitting(true);
      const res = await fetch("/api/perfil/verificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          nuevo_email,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.reason === "OTP_COOLDOWN") {
          setIntResendLeft(
            Number.isFinite(json.resendAfterSec)
              ? json.resendAfterSec
              : OTP_RESEND_SECONDS_FALLBACK,
          );
          openErrorModal(
            "Espera unos segundos antes de reenviar el código.",
          );
          return;
        }
        openErrorModal(json.message || "No se pudo reenviar el código.");
        return;
      }

      setArrOtp(Array(OTP_LENGTH).fill(""));
      setIntTimeLeft(
        Number.isFinite(json.expiresInSec)
          ? json.expiresInSec
          : OTP_EXP_SECONDS_FALLBACK,
      );
      setIntResendLeft(
        Number.isFinite(json.resendAfterSec)
          ? json.resendAfterSec
          : OTP_RESEND_SECONDS_FALLBACK,
      );
      arrRefs.current[0]?.focus();
      openSuccessModal(
        "Código reenviado",
        "Código reenviado correctamente.",
        false,
      );
    } catch (error) {
      console.error("Error al reenviar OTP:", error);
      openErrorModal("Error de red al reenviar código.");
    } finally {
      setBolSubmitting(false);
    }
  };
  const handleConfirmar = async () => {
    if (!bolOtpCompleto) return;
    try {
      setBolSubmitting(true);

      const res = await fetch("/api/perfil/verificarOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          nuevo_email,
          otp: strOtp,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.reason === "OTP_EXPIRED") {
          openErrorModal(
            "El código ya expiró. Solicita uno nuevo con Reenviar código.",
          );
          return;
        }

        openErrorModal(json.message || "No se pudo verificar el código.");
        return;
      }

      openSuccessModal(
        "¡Correo Actualizado!",
        "Tu correo se cambió exitosamente.",
        true,
      );
    } catch (error) {
      console.error("Error al verificar OTP:", error);
      openErrorModal("Error de red al verificar el código.");
    } finally {
      setBolSubmitting(false);
    }
  };

  return (
    <div className="m-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-4 px-0 text-white/80 hover:text-white hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span className="text-xs font-black tracking-widest uppercase">
          Seguridad
        </span>
      </Button>
      <div className="mb-4 border-b border-white/15" />
      <div className="mt-auto w-full rounded-2xl border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur-sm">
        <div className="border-b border-white/15 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Confirmar nuevo correo
              </h2>
              <p className="text-base text-white/70">
                Ingresa el código enviado a {" "}
                {maskEmail(nuevo_email)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
            <Input
              readOnly
              value={nuevo_email}
              className="h-11 rounded-xl border-white/20 bg-white/10 pl-10 text-white/85 placeholder:text-white/45"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-wider text-white/70">
              Código de verificación
            </p>

            <div className="grid grid-cols-6 gap-2 md:flex md:gap-3">
              {arrOtp.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => {
                    arrRefs.current[idx] = el;
                  }}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className="h-16 w-full min-w-0 rounded-xl border-2 border-white/25 bg-white/5 px-0 text-center text-2xl font-black tracking-normal text-white focus-visible:border-white focus-visible:ring-0 md:w-16 md:flex-none md:text-3xl"
                />
              ))}
            </div>

            <p className="mt-2 text-sm text-white/65">
              El código expira en {formatTime(intTimeLeft)}.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/15 p-5 md:flex-row md:flex-wrap md:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelar}
            className="order-3 h-11 w-full rounded-xl border-white/25 bg-white/10 text-white/80 hover:bg-white/15 md:order-1 md:w-auto md:min-w-32"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReenviar}
            disabled={bolSubmitting || intResendLeft > 0}
            className="order-2 h-11 w-full rounded-xl border-white/25 bg-transparent text-white/85 hover:bg-white/10 md:order-2 md:w-auto md:min-w-40"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 3 12 A 9 9 0 1 1 12 21" />
              <polyline points="17 21 12 21 13 16" />
            </svg>
            {intResendLeft > 0
              ? `Reenviar en ${formatTime(intResendLeft)}`
              : "Reenviar código"}
          </Button>

          <Button
            type="button"
            onClick={handleConfirmar}
            disabled={!bolOtpCompleto || bolSubmitting}
            className="order-1 h-11 w-full rounded-xl bg-primary-foreground font-bold text-primary hover:bg-primary-foreground/90 disabled:opacity-50 md:order-3 md:w-auto md:min-w-36"
          >
            {bolSubmitting ? "Verificando..." : "Confirmar"}
          </Button>
        </div>

        {bolShowResultModal && (
          <ResultModal
            type={strModalType}
            title={strModalTitle}
            message={strModalMessage}
            onClose={handleCloseModal}
            onRetry={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
