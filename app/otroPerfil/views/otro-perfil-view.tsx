"use client";

import { MapPin, User, Calendar, Heart, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OtroPerfilViewProps {
  usuario: any;
  telefonos: string[];
  privacidad: {
    direccion: boolean;
    genero: boolean;
    fecha_nacimiento: boolean;
    estado_civil: boolean;
  };
}

export default function OtroPerfilView({ usuario, telefonos, privacidad }: OtroPerfilViewProps) {
  const getGenero = (sigla: string | null | undefined) => {
    const mapa: Record<string, string> = {
      M: "Masculino",
      F: "Femenino",
      O: "Otro",
    };
    return sigla ? mapa[sigla.toUpperCase()] ?? "No registrado" : "No registrado";
  };

  const formatFecha = (fechaISO: string | Date | null | undefined) => {
    if (!fechaISO) return null;
    const fecha = typeof fechaISO === "string" ? new Date(fechaISO) : fechaISO;
    if (Number.isNaN(fecha.getTime())) return null;
    return fecha.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const campos = [
    {
      label: "Dirección",
      valor: usuario.direccion,
      visible: privacidad.direccion,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      label: "Género",
      valor: getGenero(usuario.genero),
      visible: privacidad.genero,
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Fecha de nacimiento",
      valor: formatFecha(usuario.fecha_nac),
      visible: privacidad.fecha_nacimiento,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: "Estado civil",
      valor: usuario.estado_civil,
      visible: privacidad.estado_civil,
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          PERFIL
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Nombre completo</p>
            <p className="text-white font-semibold">
              {usuario.nombres} {usuario.apellidos}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Usuario</p>
            <p className="text-white font-semibold">@{usuario.username}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Correo electrónico</p>
            <p className="text-white font-semibold">{usuario.email ?? "No registrado"}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Teléfono(s)</p>
            {telefonos.length > 0 ? (
              telefonos.map((t, i) => (
                <p key={i} className="text-white font-semibold">{t}</p>
              ))
            ) : (
              <p className="text-white/60 font-semibold">Teléfono no registrado</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {campos.map((campo) => (
            <div key={campo.label} className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
              <div className="text-white/60 mt-0.5">{campo.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 uppercase tracking-wide mb-1">{campo.label}</p>
                {campo.visible ? (
                  campo.valor ? (
                    <p className="text-white font-semibold">{campo.valor}</p>
                  ) : (
                    <p className="text-white/60 font-semibold">Sin registrar</p>
                  )
                ) : (
                  <div className="flex items-center gap-1 text-white/30">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Privado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}