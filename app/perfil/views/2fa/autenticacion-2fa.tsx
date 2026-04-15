/*  Dev: [Alisson Jasmin Serrano Romero]
    Fecha: 15/04/2026
    Epic: SIGN IN_UP
    Funcionalidad: Vista de Autenticación 2FA con app de autenticación (TOTP)
      - Toggle para activar/desactivar 2FA via app autenticadora
      - Muestra QR para vincular con Google Authenticator u otra app
*/
"use client";

import { useState } from "react";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Autenticacion2FAProps {
  id_usuario: string;
  onBack: () => void;
}

export default function Autenticacion2FAView({
  id_usuario,
  onBack,
}: Autenticacion2FAProps) {
  const [bolActivado, setBolActivado] = useState(false);

  const handleToggle = () => {
    setBolActivado((prev) => !prev);
    // TODO: conectar con endpoint /api/perfil/toggle2FA
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
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

      {/* Estado */}
      {bolActivado && (
        <p className="mt-3 text-xs text-white/40 tracking-wide">
          2FA activado — vincula tu app escaneando el QR (próximamente).
        </p>
      )}
    </div>
  );
}