/** *Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 26/03/2026
 * Funcionalidad: Editar datos de el usuario desde la vista de mi perfil
 * @param {String} nombres - Para editar datos
 * @param {String} apellidos - Para editar datos
 * @param {String} url_foto_perfil - Para editar datos
 * @param {String} direccion - Para editar datos
 * @return {Object} - Datos modificados en la base de datos
 *    
*/ 
/* Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 27/03/2026
    Funcionalidad: Adaptación Mobile y Cambio a Azul Primary
*/
/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 27/03/2026
 * Funcionalidad: Editar datos del usuario desde la vista de mi perfil
 *   - Consume PUT /backend/perfil/update
 *   - CA: nombre y apellido no pueden quedar vacíos
 *   - CA: username es solo lectura
 *   - CA: Cancelar descarta cambios y regresa a perfil
 * @param {Object} usuario       - Datos actuales del usuario precargados
 * @param {Function} onGuardar  - Callback al guardar exitosamente
 * @param {Function} onCancelar - Callback al pulsar cancelar
 * @return {JSX.Element} - Formulario de edición de perfil
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface EditProfileProps {
  usuario: {
    id_usuario: string;
    username?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    direccion?: string | null;
    url_foto_perfil?: string | null;
  };
  onGuardar: (data: any) => void;
  onCancelar: () => void;
}

export default function EditProfile({ usuario, onGuardar, onCancelar }: EditProfileProps) {
  // Estado del formulario precargado con datos actuales del usuario
  const [strNombres, setStrNombres] = useState(usuario.nombres ?? "");
  const [strApellidos, setStrApellidos] = useState(usuario.apellidos ?? "");
  const [strDireccion, setStrDireccion] = useState(usuario.direccion ?? "");
  const [strFotoUrl, setStrFotoUrl] = useState(usuario.url_foto_perfil ?? "");
  const [bolLoading, setBolLoading] = useState(false);
  const [strError, setStrError] = useState<string | null>(null);
  const [strSuccess, setStrSuccess] = useState<string | null>(null);

  // Llama al PUT /backend/perfil/update
  const handleGuardar = async () => {
    if (!strNombres.trim() || !strApellidos.trim()) {
      setStrError("El nombre y apellido no pueden estar vacíos.");
      return;
    }
    setBolLoading(true);
    setStrError(null);
    setStrSuccess(null);
    try {
      const res = await fetch("/backend/perfil/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nombres: strNombres.trim(),
          apellidos: strApellidos.trim(),
          direccion: strDireccion,
          url_foto_perfil: strFotoUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStrError(json.error ?? "Error al guardar los cambios.");
        return;
      }
      setStrSuccess("Perfil actualizado correctamente.");
      onGuardar(json.data);
    } catch {
      setStrError("Error de conexión. Intenta nuevamente.");
    } finally {
      setBolLoading(false);
    }
  };

  // Solicitar URL de imagen para cambiar foto
  const handleCambiarFoto = () => {
    const strNuevaUrl = window.prompt("Ingresa la URL de tu nueva foto de perfil:");
    if (strNuevaUrl && strNuevaUrl.trim() !== "") {
      setStrFotoUrl(strNuevaUrl.trim());
    }
  };

  // Solicitar confirmación y limpiar URL para mostrar imagen por defecto
  const handleEliminarFoto = () => {
    const bolConfirmado = window.confirm(
      "¿Estás seguro de que deseas eliminar tu foto de perfil?"
    );
    if (bolConfirmado) {
      setStrFotoUrl("");
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          Editar Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        {/* CA: título "SEGURIDAD > EDITAR PERFIL" */}
        <p className="text-xs font-black tracking-widest text-white/50 uppercase -mt-2">
          Seguridad › Editar Perfil
        </p>
        {strError && (
          <p className="text-red-300 text-xs font-bold bg-red-400/10 border border-red-300/30 rounded-lg px-4 py-3">
            {strError}
          </p>
        )}
        {strSuccess && (
          <p className="text-green-300 text-xs font-bold bg-green-400/10 border border-green-300/30 rounded-lg px-4 py-3">
            {strSuccess}
          </p>
        )}
        <div>
          <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-4">
            Foto de perfil
          </p>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={strFotoUrl} alt={strNombres} />
              <AvatarFallback className="text-xl font-black bg-white/20 text-white">
                {strNombres[0]}{strApellidos[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCambiarFoto}
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest"
              >
                Cambiar foto
              </Button>
              <Button
                variant="outline"
                onClick={handleEliminarFoto}
                className="bg-transparent border-red-300/50 text-red-300 hover:bg-red-400/10 hover:text-red-200 text-xs font-black tracking-widest"
              >
                Eliminar foto
              </Button>
            </div>
          </div>
        </div>
        <Separator className="bg-white/20" />
        <div>
          <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-5">
            Datos personales
          </p>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombres" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Nombre
                </Label>
                <Input
                  id="nombres"
                  value={strNombres}
                  onChange={(e) => setStrNombres(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apellidos" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Apellido
                </Label>
                <Input
                  id="apellidos"
                  value={strApellidos}
                  onChange={(e) => setStrApellidos(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direccion" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={strDireccion}
                  onChange={(e) => setStrDireccion(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
            </div>
            {/* CA: campo USUARIO solo lectura */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="usuario" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Usuario
                </Label>
                <Badge className="text-xs font-black tracking-widest bg-white/10 text-white/40 border-white/20 hover:bg-white/10">
                  No editable
                </Badge>
              </div>
              <Input
                id="usuario"
                value={usuario.username ?? ""}
                disabled
                className="bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        <Separator className="bg-white/20" />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancelar}
            disabled={bolLoading}
            className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={bolLoading}
            className="bg-white text-[var(--primary)] font-black tracking-widest text-xs hover:bg-white/90"
          >
            {bolLoading ? (
              <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Guardando...</>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}