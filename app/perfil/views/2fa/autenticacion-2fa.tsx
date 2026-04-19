/*  Dev: [Alisson Jasmin Serrano Romero]
    Fecha: 15/04/2026
    Epic: SIGN IN_UP
    Funcionalidad: Vista de Autenticación 2FA con app de autenticación (TOTP)
*/
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, QrCode, Copy, Check } from "lucide-react";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import IngresarCodigo2FA from "./components/IngresarCodigo2FA";
import ConfirmarDesactivar2FA from "./components/ConfirmarDesactivar2FA";

interface Autenticacion2FAProps {
  id_usuario: string;
  onBack: () => void;
}

export default function Autenticacion2FAView({ id_usuario, onBack }: Autenticacion2FAProps) {
  const [bolActivado, setBolActivado] = useState(false);
  const [secreto, setSecreto] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [mostrarConfirmDesactivar, setMostrarConfirmDesactivar] = useState(false);

  useEffect(() => {
    const cargarEstado2FA = async () => {
      try {
        const response = await fetch(`/api/perfil/estado-2fa?userId=${id_usuario}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.dos_fa_habilitado) setBolActivado(true);
        }
      } catch (error) {
        console.error("Error cargando estado 2FA:", error);
      }
    };
    cargarEstado2FA();
  }, [id_usuario]);

  useEffect(() => {
    if (bolActivado && !secreto) generarSecreto();
  }, [bolActivado]);

  const generarSecreto = async () => {
    try {
      const nuevoSecreto = speakeasy.generateSecret({
        name: `Alpha ROS (${id_usuario})`,
        issuer: "Alpha ROS",
        length: 32,
      });
      setSecreto(nuevoSecreto.base32);
      const qrDataUrl = await QRCode.toDataURL(nuevoSecreto.otpauth_url || "");
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error("Error generando secreto 2FA:", error);
    }
  };

  const handleToggle = () => {
    if (bolActivado) {
      setMostrarConfirmDesactivar(true);
    } else {
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

      {/* Confirmar desactivación */}
      {mostrarConfirmDesactivar && (
        <ConfirmarDesactivar2FA
          id_usuario={id_usuario}
          onSuccess={() => {
            setBolActivado(false);
            setSecreto("");
            setQrCode("");
            setMostrarInputCodigo(false);
            setMostrarConfirmDesactivar(false);
          }}
          onCancel={() => setMostrarConfirmDesactivar(false)}
        />
      )}

      {/* Contenido cuando está activado */}
      {bolActivado && secreto && !mostrarInputCodigo && !mostrarConfirmDesactivar && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* ADVERTENCIA */}
          <div className="bg-amber-950/40 border border-amber-700/60 rounded-xl p-4 flex gap-3">
            <div className="flex-shrink-0 text-amber-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-amber-100">
              <p className="font-semibold mb-1">⚠️ Importante</p>
              <p>No desactives el toggle mientras estés configurando. Usa el botón "Cancelar" para reintentar.</p>
            </div>
          </div>

          {/* APP DE AUTENTICACIÓN */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold tracking-widest text-white/80 mb-3">
              APP DE AUTENTICACION
            </h3>
            <p className="text-sm text-white/60">
              Obtén un codigo de alguna app como google authenticador.
            </p>
          </div>

          {/* INSTRUCCIONES */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white/80">
              INSTRUCCIONES DE CONFIGURACION
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-white/80">
                <span className="font-bold">1.</span> Descarga una app de autenticación
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                <span className="font-bold">2.</span> Escanea este codigo QR o copia la clave
              </p>
              <div className="flex flex-col items-center gap-4">
                {qrCode && (
                  <div className="bg-white p-3 rounded-lg">
                    <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40" />
                  </div>
                )}
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
                      <><Check className="h-4 w-4" />COPIADO</>
                    ) : (
                      <><Copy className="h-4 w-4" />COPIAR CLAVE</>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-white/60 mb-2">CLAVE SECRETA</p>
                <p className="font-mono text-sm text-white/90 tracking-wider break-all">
                  {secreto.match(/.{1,4}/g)?.join(" ")}
                </p>
              </div>
            </div>
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
              onClick={() => { setMostrarInputCodigo(false); }}
              className="flex-1 px-4 py-3 border border-white/20 text-white/80 font-bold text-sm rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ingresar código TOTP */}
      {bolActivado && secreto && mostrarInputCodigo && (
        <IngresarCodigo2FA
          id_usuario={id_usuario}
          secreto={secreto}
          onSuccess={() => setMostrarInputCodigo(false)}
          onCancel={() => setMostrarInputCodigo(false)}
        />
      )}

      {/* Estado cuando está desactivado */}
      {!bolActivado && !mostrarConfirmDesactivar && (
        <p className="mt-3 text-xs text-white/40 tracking-wide">
          Activa el toggle para configurar 2FA con tu app autenticadora.
        </p>
      )}
    </div>
  );
}