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
import { ShieldCheck, Mail, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResultModal from "@/components/ui/modal";
interface ConfirmarCorreoProps {
  id_usuario: string;
  nuevo_email: string;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const OTP_EXP_SECONDS = 600; // 10 min

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0] ?? "*"}*@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

export default function ConfirmarCorreoView({
  id_usuario,
  nuevo_email,
  onBack,
}: ConfirmarCorreoProps) {
  const [arrOtp, setArrOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [intTimeLeft, setIntTimeLeft] = useState(OTP_EXP_SECONDS);
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

  const openSuccessModal = (message: string, bolRedirect = false) => {
    setStrModalType("success");
    setStrModalTitle("Operación exitosa");
    setStrModalMessage(message);
    setBolRedirectToPerfilOnClose(bolRedirect);
    setBolShowResultModal(true);
  };

  const handleCloseModal = () => {
    setBolShowResultModal(false);
    setStrModalTitle("");
    setStrModalMessage("");

    if (bolRedirectToPerfilOnClose) {
      window.location.assign("/frontend/perfil");
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
      const res = await fetch("/backend/perfil/verificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          nuevo_email,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        openErrorModal(json.message || "No se pudo reenviar el código.");
        return;
      }

      setArrOtp(Array(OTP_LENGTH).fill(""));
      setIntTimeLeft(OTP_EXP_SECONDS);
      arrRefs.current[0]?.focus();
      openSuccessModal("Código reenviado correctamente.", false);
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

      const res = await fetch("/backend/perfil/verificarOtp", {
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
        openErrorModal(json.message || "No se pudo verificar el código.");
        return;
      }

      openSuccessModal("Correo actualizado correctamente.", true);
    } catch (error) {
      console.error("Error al verificar OTP:", error);
      openErrorModal("Error de red al verificar el código.");
    } finally {
      setBolSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur-sm">
      <div className="border-b border-white/15 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Confirmar nuevo correo electronico
            </h2>
            <p className="text-base text-white/70">
              Ingresa el codigo de 6 digitos que enviamos a{" "}
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
            Codigo de verificacion
          </p>

          <div className="flex gap-3">
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
                className="h-16 w-16 rounded-xl border-2 border-white/25 bg-white/5 text-center text-3xl font-black tracking-widest text-white focus-visible:border-white focus-visible:ring-0"
              />
            ))}
          </div>

          <p className="mt-2 text-sm text-white/65">
            El codigo expira en {formatTime(intTimeLeft)}.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 p-5">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelar}
          className="h-11 min-w-32 rounded-xl border-white/25 bg-white/10 text-white/80 hover:bg-white/15"
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleReenviar}
          disabled={bolSubmitting}
          className="h-11 min-w-40 rounded-xl border-white/25 bg-transparent text-white/85 hover:bg-white/10"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reenviar codigo
        </Button>

        <Button
          type="button"
          onClick={handleConfirmar}
          disabled={!bolOtpCompleto || bolSubmitting || intTimeLeft === 0}
          className="h-11 min-w-36 rounded-xl bg-primary-foreground font-bold text-primary hover:bg-primary-foreground/90 disabled:opacity-50"
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
  );
}
