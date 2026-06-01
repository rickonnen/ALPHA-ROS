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
  primary_provider?: string | null;
  onBack: () => void;
}

export default function Autenticacion2FAView({ id_usuario, primary_provider, onBack }: Autenticacion2FAProps) {
  const [bolActivado, setBolActivado] = useState(false);
  const [cargandoEstado, setCargandoEstado] = useState(true);
  const [secreto, setSecreto] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [mostrarConfirmDesactivar, setMostrarConfirmDesactivar] = useState(false);
  const [ya2FAConfigurado, setYa2FAConfigurado] = useState(false);

  useEffect(() => {
    const cargarEstado2FA = async () => {
      try {
        const response = await fetch(`/api/perfil/estado-2fa?userId=${id_usuario}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.dos_fa_habilitado) {
            setBolActivado(true);
            setYa2FAConfigurado(true);
          }
        }
      } catch (error) {
        console.error("Error cargando estado 2FA:", error);
      } finally {
        setCargandoEstado(false); 
      }
    };
    cargarEstado2FA();
  }, [id_usuario]);

  useEffect(() => {
    if (bolActivado && !secreto && !ya2FAConfigurado) generarSecreto();
  }, [bolActivado]);

  const generarSecreto = async () => {
    try {
      const nuevoSecreto = speakeasy.generateSecret({
        name: `PROPBOL (${id_usuario})`,
        issuer: "Propbol",
        length: 20,
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
      if (ya2FAConfigurado) {
        setMostrarConfirmDesactivar(true);
      } else {
        setBolActivado(false);
        setSecreto("");
        setQrCode("");
        setMostrarInputCodigo(false);
      }
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

      {/* APP DE AUTENTICACION — toggle siempre visible */}
      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-white/80 mb-3">
          APP DE AUTENTICACION
        </h3>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-4">
          <p className="flex-1 text-sm text-white/80">
            {ya2FAConfigurado
              ? "El segundo factor está activado."
              : "Obtén un codigo de alguna app de autenticación."}
          </p>
          {/* Toggle real cuando el estado ya se conoce */}
          {cargandoEstado ? (
            <div className="relative inline-flex h-7 w-14 items-center rounded-full bg-white/10 animate-pulse" />
          ) : (
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
          )}
        </div>
      </div>

      {/* Confirmar desactivación */}
      {mostrarConfirmDesactivar && (
        <ConfirmarDesactivar2FA
          id_usuario={id_usuario}
          primary_provider={primary_provider}
          onSuccess={() => {
            setBolActivado(false);
            setSecreto("");
            setQrCode("");
            setMostrarInputCodigo(false);
            setMostrarConfirmDesactivar(false);
            setYa2FAConfigurado(false);
          }}
          onCancel={() => setMostrarConfirmDesactivar(false)}
        />
      )}

      {/* Instrucciones + QR: solo si está activando por primera vez */}
      {bolActivado && secreto && !ya2FAConfigurado && !mostrarInputCodigo && !mostrarConfirmDesactivar && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold tracking-widest text-white/80">
              INSTRUCCIONES DE CONFIGURACION
            </h3>

            <p className="text-sm text-white/80">
              <span className="font-bold">1.</span> Descarga una app de autenticación.
            </p>
            <p className="text-xs text-white/50 -mt-3">
              Ejm: Google Authenticator, Authy, 2FA Authenticator.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-white/80">
                <span className="font-bold">2.</span> Escanea este codigo QR o copia la clave secreta.
              </p>

              {/* flex-col en mobile, flex-row en desktop */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* QR */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  {qrCode && (
                    <div className="bg-white/10 border border-white/15 rounded-xl p-3">
                      <img src={qrCode} alt="QR Code 2FA" className="w-36 h-36" />
                    </div>
                  )}
                </div>

                {/* Clave secreta */}
                <div className="flex flex-col items-center gap-3 w-full sm:flex-1">
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 sm:min-h-[144px]">
                    {secreto.match(/.{1,4}/g)?.reduce<string[][]>((rows, chunk, i) => {
                      const rowIndex = Math.floor(i / 3);
                      if (!rows[rowIndex]) rows[rowIndex] = [];
                      rows[rowIndex].push(chunk);
                      return rows;
                    }, []).map((row, i) => (
                      <div key={i} className="flex gap-3">
                        {row.map((chunk, j) => (
                          <span key={j} className="font-mono text-sm text-white/90 tracking-wider">
                            {chunk}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={copiarAlPortapapeles}
                    aria-label="Copiar clave secreta al portapapeles"
                    className="px-4 py-2 text-xs font-bold text-white/70 border border-white/20 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {copiado ? (
                      <><Check className="h-3.5 w-3.5" />COPIADO</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" />COPIAR CLAVE</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/80">
              <span className="font-bold">3.</span> Copia e ingresa el codigo de 6 dígitos.
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => setMostrarInputCodigo(true)}
              className="flex-1 px-4 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors"
            >
              Ingresar Código
            </button>
            <button
              type="button"
              onClick={() => { setBolActivado(false); setSecreto(""); setQrCode(""); }}
              className="flex-1 px-4 py-3 border border-white/20 text-white/80 font-bold text-sm rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ingresar código TOTP */}
      {bolActivado && secreto && !ya2FAConfigurado && mostrarInputCodigo && (
        <IngresarCodigo2FA
          id_usuario={id_usuario}
          secreto={secreto}
          onSuccess={() => {
            setMostrarInputCodigo(false);
            setYa2FAConfigurado(true);
          }}
          onCancel={() => setMostrarInputCodigo(false)}
        />
      )}

      {/* Desactivado */}
      {!bolActivado && !mostrarConfirmDesactivar && (
        <p className="mt-1 text-xs text-white/40 tracking-wide">
          Activa el toggle para configurar 2FA con tu app autenticadora.
        </p>
      )}
    </div>
  );
}