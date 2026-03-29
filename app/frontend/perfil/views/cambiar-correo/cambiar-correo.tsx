/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc 
    Fecha: 26/03/2026
    Funcionalidad: Primera versión mockeada de la vista "Cambiar correo"
      - Se implementa la estructura base de la pantalla:
        header, correo actual, nuevo correo, contraseña y botones de acción
      - Se agregan validaciones visuales iniciales para correo y contraseña
      - Se mantiene flujo local de UI sin integración completa al backend
*/

/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc 
    Fecha: 27/03/2026
    Funcionalidad: Integración con flujo de Seguridad y eliminación de hardcodeo
      - Se corrige navegación de retorno mediante callback (onBack)
      - Se ajusta el flujo: Home > Mi Perfil > Seguridad > Cambiar correo
      - Se parametriza la vista para recibir datos dinámicos:
        id_usuario y email_actual
      - Se reemplaza uso de valores fijos por props recibidas desde la vista padre
*/
/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc
    Fecha: 28/03/2026
    Funcionalidad: Validaciones de formulario + transición al paso de confirmación
      - Se centraliza estado del formulario en el componente padre:
        strNewEmail, strPassword y bolTrySubmit
      - Se aplica validación visual de requeridos y formato de correo
      - Se corrige flujo de acciones:
        Cancelar -> onBack
        Confirmar cambio -> onContinue(nuevoEmail) cuando pasa validaciones
      - Se integra navegación de flujo interno:
        Cambiar correo -> Confirmar correo (subsubview)
*/

/*  Dev: Jaime Sebastian Chavarria Fuertes - xdev/sow-sebasc
    Fecha: 28/03/2026
    Funcionalidad: Actualización de contrato de props y transición al paso OTP
      - Se amplía el contrato de CambiarCorreoView con:
        @param {(nuevoEmail: string) => void} onContinue:
        callback para avanzar a la subsubvista "Confirmar correo" pasando el nuevo correo validado
      - Se mantiene:
        @param {() => void} onBack:
        callback para volver a la subvista principal de Seguridad
        @param {string} id_usuario:
        identificador del usuario para futuras operaciones de actualización
        @param {string} email_actual:
        correo actual mostrado en campo de solo lectura
      - Se actualiza el flujo local:
        si correo/contraseña cumplen validaciones visuales -> onContinue(strNewEmail.trim())
      - @return {JSX.Element}:
        formulario de cambio de correo con validaciones visuales básicas y transición al paso de confirmación OTP
*/
"use client";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ResultModal from "@/components/ui/modal";
import { useState } from "react";

interface CambiarCorreoProps {
  onBack: () => void;
  onContinue: (nuevoEmail: string) => void;
  id_usuario: string;
  email_actual: string;
}

export default function CambiarCorreoView({
  onBack,
  onContinue,
  id_usuario,
  email_actual,
}: CambiarCorreoProps) {
  const [strNewEmail, setStrNewEmail] = useState("");
  const [strPassword, setStrPassword] = useState("");
  const [bolTrySubmit, setBolTrySubmit] = useState(false);
  const [bolValidandoContrasena, setBolValidandoContrasena] = useState(false);
  const [bolShowErrorModal, setBolShowErrorModal] = useState(false);
  const [strErrorModalMessage, setStrErrorModalMessage] = useState("");

  const handleCloseErrorModal = () => {
    setBolShowErrorModal(false);
    setStrErrorModalMessage("");
  };

  return (
    <div className="m-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-4 px-0 text-white/80 hover:text-white hover:bg-transparent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Seguridad
      </Button>
      <HeaderCorreo />
      <CorreoActual email_actual={email_actual} />
      <NuevoCorreo
        strNewEmail={strNewEmail}
        onEmailChange={(value) => {
          setStrNewEmail(value);
          if (bolTrySubmit) setBolTrySubmit(false);
        }}
        bolTrySubmit={bolTrySubmit}
      />
      <Contrasena
        strPassword={strPassword}
        onPasswordChange={(value) => {
          setStrPassword(value);
          if (bolTrySubmit) setBolTrySubmit(false);
        }}
        bolTrySubmit={bolTrySubmit}
      />
      <BotonesAccion
        onClick={onBack}
        onConfirm={async () => {
          if (bolValidandoContrasena) return;

          const strNuevoEmail = strNewEmail.trim().toLowerCase();
          const bolEmailVacio = strNuevoEmail === "";
          const bolEmailInvalido = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            strNuevoEmail,
          );

          if (bolEmailVacio || bolEmailInvalido) {
            setBolTrySubmit(true);
            return;
          }

          try {
            setBolValidandoContrasena(true);

            const resPrecheck = await fetch(
              "/backend/perfil/prevalidarCambioCorreo",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_usuario,
                  nuevo_email: strNuevoEmail,
                }),
              },
            );

            const jsonPrecheck = await resPrecheck.json();

            if (
              !resPrecheck.ok ||
              !jsonPrecheck.ok ||
              !jsonPrecheck.canProceed
            ) {
              setStrErrorModalMessage(
                jsonPrecheck.message ||
                  "No se pudo continuar con el cambio de correo.",
              );
              setBolShowErrorModal(true);
              return;
            }

            const bolPassVacia = strPassword.trim() === "";
            if (bolPassVacia) {
              setBolTrySubmit(true);
              setStrErrorModalMessage(
                "Ingresa tu contraseña actual para continuar.",
              );
              setBolShowErrorModal(true);
              return;
            }

            const res = await fetch("/backend/perfil/validarContrasenaActual", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario,
                password_actual: strPassword,
              }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
              setStrErrorModalMessage(
                json.error || "Error en la consistencia de datos",
              );
              setBolShowErrorModal(true);
              return;
            }

            const resOtp = await fetch("/backend/perfil/verificationCode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario,
                nuevo_email: strNuevoEmail,
              }),
            });

            const jsonOtp = await resOtp.json();

            if (!resOtp.ok || !jsonOtp.ok) {
              setStrErrorModalMessage(
                jsonOtp.message ||
                  "No se pudo enviar el código de verificación.",
              );
              setBolShowErrorModal(true);
              return;
            }

            onContinue(strNuevoEmail);
          } catch (error) {
            console.error("Error en validación de cambio de correo:", error);
            setStrErrorModalMessage(
              "Error de red al validar el cambio de correo.",
            );
            setBolShowErrorModal(true);
          } finally {
            setBolValidandoContrasena(false);
          }
        }}
        bolValidandoContrasena={bolValidandoContrasena}
      />

      {bolShowErrorModal && (
        <ResultModal
          type="error"
          title="No se pudo continuar"
          message={strErrorModalMessage}
          onClose={handleCloseErrorModal}
          onRetry={handleCloseErrorModal}
        />
      )}
    </div>
  );
}

function HeaderCorreo() {
  return (
    <CardHeader className="px-0 border-b border-white/15 pb-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Mail className="h-6 w-6 text-white/70" />
        </div>

        <div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
            Cambiar correo electrónico
          </CardTitle>
          <CardDescription className="mt-1 text-base text-white/70">
            Te enviaremos un código de verificación al nuevo correo.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
interface CorreoActualProps {
  email_actual: string;
}
function CorreoActual({ email_actual }: CorreoActualProps) {
  return (
    <section className="mt-6">
      <Label
        htmlFor="correo-actual-read-only"
        className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70"
      >
        Correo Actual
      </Label>
      <div className="relative">
        <Input
          id="correo-actual-read-only"
          value={email_actual}
          type="email"
          readOnly
          className="h-12 rounded-lg border border-white/20 bg-white/10 pr-10 text-base md:text-base text-white/55 placeholder:text-white/35 cursor-not-allowed caret-transparent focus-visible:ring-2 focus-visible:ring-white/25"
        />
        <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
      </div>
      <p className="mt-1 text-xs text-white/55">No editable</p>
    </section>
  );
}
interface NuevoCorreoProps {
  strNewEmail: string;
  onEmailChange: (value: string) => void;
  bolTrySubmit: boolean;
}
function NuevoCorreo({
  strNewEmail,
  onEmailChange,
  bolTrySubmit,
}: NuevoCorreoProps) {
  const [bolTouchedEmail, setBolTouchedEmail] = useState(false);

  const bolEmailVacio = strNewEmail.trim() === "";
  const bolIsValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strNewEmail.trim());
  const bolShowRequired = (bolTouchedEmail || bolTrySubmit) && bolEmailVacio;
  const bolShowFormatError =
    (bolTouchedEmail || bolTrySubmit) && !bolEmailVacio && !bolIsValidEmail;

  return (
    <section className="mt-6">
      <Label
        htmlFor="nuevo-correo-input"
        className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70"
      >
        Nuevo Correo
      </Label>
      <div className="relative">
        <Input
          id="nuevo-correo-input"
          type="email"
          value={strNewEmail}
          placeholder="nuevo@email.com"
          autoComplete="email"
          spellCheck={false}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={() => setBolTouchedEmail(true)}
          className={
            "h-12 rounded-lg border bg-white/10 px-3 text-base md:text-base text-white/90 placeholder:text-white/40 focus-visible:ring-2 transition-colors " +
            (bolShowRequired || bolShowFormatError
              ? "border-red-400/70 focus-visible:ring-red-400/40"
              : "border-white/25 focus-visible:ring-white/30")
          }
        />
      </div>

      <p
        className={
          "mt-1 text-xs transition-colors " +
          (bolShowRequired || bolShowFormatError
            ? "text-red-300/80"
            : "text-white/55")
        }
      >
        {bolShowRequired
          ? "Rellena este campo."
          : bolShowFormatError
            ? "Ingresa un correo válido (ej: nombre@dominio.com)"
            : "Ingresa el correo al que enviaremos el código."}
      </p>
    </section>
  );
}
interface ContrasenaProps {
  strPassword: string;
  onPasswordChange: (value: string) => void;
  bolTrySubmit: boolean;
}
function Contrasena({
  strPassword,
  onPasswordChange,
  bolTrySubmit,
}: ContrasenaProps) {
  const [bolShowPassword, setBolShowPassword] = useState(false);
  const [bolTouchedPassword, setBolTouchedPassword] = useState(false);

  const bolShowError =
    (bolTouchedPassword || bolTrySubmit) && strPassword.trim() === "";
  return (
    <section className="mt-6">
      <Label
        htmlFor="contrasena-input"
        className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70"
      >
        Contraseña
      </Label>
      <div className="relative">
        <Input
          id="contrasena-input"
          type={bolShowPassword ? "text" : "password"}
          value={strPassword}
          placeholder="••••••••••••"
          autoComplete="current-password"
          onChange={(e) => onPasswordChange(e.target.value)}
          onBlur={() => setBolTouchedPassword(true)}
          className={`h-12 rounded-lg border bg-white/10 pr-10 px-3 text-base md:text-base text-white/90 placeholder:text-white/40 focus-visible:ring-2 transition-colors ${
            bolShowError
              ? "border-red-400/70 focus-visible:ring-red-400/40"
              : "border-white/25 focus-visible:ring-white/30"
          }`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setBolShowPassword((prev) => !prev)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-white/45 hover:text-white/70 hover:bg-white/10"
        >
          {bolShowPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p
        className={`mt-1 text-xs transition-colors ${bolShowError ? "text-red-300/80" : "text-white/55"}`}
      >
        {bolShowError
          ? "Ingresa tu contraseña actual para confirmar el cambio."
          : "Necesitamos verificar tu identidad."}
      </p>
    </section>
  );
}
interface BotonesAccionProps {
  onClick: () => void;
  onConfirm: () => void;
  bolValidandoContrasena: boolean;
}
function BotonesAccion({
  onClick,
  onConfirm,
  bolValidandoContrasena,
}: BotonesAccionProps) {
  return (
    <div className="mt-8 flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-36 h-10 rounded-lg border-white/25 bg-transparent text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 transition-colors"
        onClick={onClick}
        disabled={bolValidandoContrasena}
      >
        Cancelar
      </Button>

      <Button
        type="button"
        className="w-36 h-10 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700 font-bold hover:bg-zinc-200 hover:border-zinc-400 hover:text-zinc-800 transition-colors shadow-sm shadow-black/20 disabled:opacity-60"
        onClick={onConfirm}
        disabled={bolValidandoContrasena}
      >
        {bolValidandoContrasena ? "Verificando..." : "Confirmar cambio"}
      </Button>
    </div>
  );
}
