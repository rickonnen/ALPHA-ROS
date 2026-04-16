/*  Dev: [Alisson Jasmin Serrano Romero]
    Fecha: 15/04/2026
    Epic: SIGN IN_UP
    Funcionalidad: Vista de Autenticación 2FA con app de autenticación (TOTP)
      - Toggle para activar/desactivar 2FA via app autenticadora
      - Muestra QR para vincular con Google Authenticator u otra app
*/
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

interface Autenticacion2FAProps {
  id_usuario: string;
  onBack: () => void;
}

export default function Autenticacion2FAView({
  id_usuario,
  onBack,
}: Autenticacion2FAProps) {
  const [bolActivado, setBolActivado] = useState(false);
  const [secreto, setSecreto] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);

  // Generar secreto y QR cuando se activa 2FA
  useEffect(() => {
    if (bolActivado && !secreto) {
      generarSecreto();
    }
  }, [bolActivado]);

  const generarSecreto = async () => {
    try {
      // Generar secreto TOTP usando speakeasy
      const nuevoSecreto = speakeasy.generateSecret({
        name: `Alpha ROS (${id_usuario})`,
        issuer: "Alpha ROS",
        length: 32,
      });

      setSecreto(nuevoSecreto.base32);

      // Generar QR code como data URL
      const qrDataUrl = await QRCode.toDataURL(nuevoSecreto.otpauth_url || "");
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error("Error generando secreto 2FA:", error);
    }
  };

  const handleToggle = () => {
    if (bolActivado) {
      // Desactivar 2FA
      setBolActivado(false);
      setSecreto("");
      setQrCode("");
      setCodigoIngresado("");
    } else {
      // Activar 2FA
      setBolActivado(true);
    }
  };

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(secreto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error("Error copiando al portapapeles:", error);
    }
  };

  const verificarCodigo = async () => {
    if (codigoIngresado.length !== 6) {
      alert("Por favor ingresa un código de 6 dígitos");
      return;
    }

    setCargando(true);
    try {
      // Verificar el código TOTP
      const esValido = speakeasy.totp.verify({
        secret: secreto,
        encoding: "base32",
        token: codigoIngresado,
        window: 2,
      });

      if (esValido) {
        alert("2FA verificado correctamente");
        // TODO: Guardar 2FA en la base de datos
        setMostrarInputCodigo(false);
        setCodigoIngresado("");
        setBolActivado(false);
        setSecreto("");
        setQrCode("");
      } else {
        alert("Código inválido. Por favor intenta nuevamente");
        setCodigoIngresado("");
      }
    } catch (error) {
      console.error("Error verificando código:", error);
      alert("Error verificando el código");
    } finally {
      setCargando(false);
    }
  };

  const cancelar = () => {
    setBolActivado(false);
    setSecreto("");
    setQrCode("");
    setCodigoIngresado("");
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver a Seguridad"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs font-bold tracking-widest">SEGURIDAD</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-white/15">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <QrCode className="h-5 w-5 text-white/70" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Autenticacion 2FA
          </h2>
          <p className="text-sm text-white/60">Protege tu cuenta.</p>
        </div>
      </div>

      {/* Toggle row */}
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-4">
        <p className="flex-1 text-sm text-white/80">
          Obtén un codigo de alguna app como google authenticator.
        </p>
        <button
          type="button"
          onClick={handleToggle}
          aria-label={bolActivado ? "Desactivar 2FA" : "Activar 2FA"}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            bolActivado ? "bg-white/80" : "bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              bolActivado ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Contenido cuando está activado */}
      {bolActivado && secreto && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* APP DE AUTENTICACIÓN */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold tracking-widest text-white/80 mb-3">
              APP DE AUTENTICACION
            </h3>
            <p className="text-sm text-white/60">
              Obtén un codigo de alguna app como google authenticador.
            </p>
          </div>

          {/* INSTRUCCIONES DE CONFIGURACIÓN */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white/80">
              INSTRUCCIONES DE CONFIGURACION
            </h3>

            {/* Paso 1 */}
            <div className="space-y-2">
              <p className="text-sm text-white/80">
                <span className="font-bold">1.</span> Descarga una app de autenticación
              </p>
            </div>

            {/* Paso 2 */}
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                <span className="font-bold">2.</span> Escanea este codigo QR o copia la clave
              </p>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                {qrCode && (
                  <div className="bg-white p-3 rounded-lg">
                    <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40" />
                  </div>
                )}

                {/* Botones QR y Copiar */}
                <div className="flex gap-3 w-full justify-center">
                  <button
                    type="button"
                    title="Mostrar código QR"
                    className="px-4 py-2 text-sm font-semibold text-white/80 border border-white/20 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    CODIGO QR
                  </button>
                  <button
                    type="button"
                    onClick={copiarAlPortapapeles}
                    aria-label="Copiar clave secreta al portapapeles"
                    className="px-4 py-2 text-sm font-semibold text-white/80 border border-white/20 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-4 w-4" />
                        COPIADO
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        COPIAR CLAVE
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Clave secreta */}
              <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-white/60 mb-2">CLAVE SECRETA</p>
                <p className="font-mono text-sm text-white/90 tracking-wider break-all">
                  {secreto.match(/.{1,4}/g)?.join(" ")}
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                <span className="font-bold">3.</span> Confirma tu código
              </p>
            </div>
            
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setMostrarInputCodigo(true)}
              className="flex-1 px-4 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors"
            >
              Ingresar Código
            </button>
            <button
              type="button"
              onClick={cancelar}
              className="flex-1 px-4 py-3 border border-white/20 text-white/80 font-bold text-sm rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Input de código sobrepuesto */}
          {mostrarInputCodigo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-8 border border-white/10">
                
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    INGRESA EL CODIGO
                  </h3>
                  <p className="text-sm text-gray-300">
                    Ingresa el código de 6 dígitos que generó tu app de autenticación
                  </p>
                </div>

                {/* Input para el código */}
                <input
                  type="text"
                  maxLength={6}
                  value={codigoIngresado}
                  onChange={(e) => setCodigoIngresado(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ingresa el código"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-lg font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:bg-slate-700/70 transition-colors mb-6"
                  autoFocus
                />

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={verificarCodigo}
                    disabled={cargando || codigoIngresado.length !== 6}
                    className="flex-1 px-4 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cargando ? "Verificando..." : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputCodigo(false);
                      setCodigoIngresado("");
                    }}
                    className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 font-semibold text-sm rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado cuando está desactivado */}
      {!bolActivado && (
        <p className="mt-3 text-xs text-white/40 tracking-wide">
          Activa el toggle para configurar 2FA con tu app autenticadora.
        </p>
      )}
    </div>
  );
}