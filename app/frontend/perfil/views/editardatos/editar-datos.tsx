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
 * Fecha: 28/03/2026
 * Funcionalidad: Implementacion de back
 */
/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 28/03/2026
 * Funcionalidad: Integracion de ResultModal
 */
/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 28/03/2026
 * Funcionalidad: Implementacion combobox para pais + Boton volver a seguridad + Redireccion al perfil tras guardar
 */
/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 28/03/2026
 * Fix: Redireccion al perfil tras guardar
 */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ResultModal from "@/components/ui/ResultModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";


interface EditProfileProps {
  usuario: {
    id_usuario: string;
    username?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    direccion?: string | null;
    url_foto_perfil?: string | null;
    id_pais?: number | null;
    Pais?: {
      nombre_pais?: string | null;
      codigo_iso?: string | null;
    } | null;
  };
  onGuardar: (data: any) => void;
  onCancelar: () => void;
}

export default function EditProfile({ usuario, onGuardar, onCancelar }: EditProfileProps) {
  const router = useRouter();
  const [strNombres, setStrNombres] = useState(usuario.nombres ?? "");
  const [strApellidos, setStrApellidos] = useState(usuario.apellidos ?? "");
  const [strDireccion, setStrDireccion] = useState(usuario.direccion ?? "");
  const [strFotoUrl, setStrFotoUrl] = useState(usuario.url_foto_perfil ?? "");
  const [intPaisId, setIntPaisId] = useState<number | null>(usuario.id_pais ?? null);
  const [arrPaises, setArrPaises] = useState<{ id_pais: number; nombre_pais: string }[]>([]);
  const [bolLoadingPaises, setBolLoadingPaises] = useState(false);
  const [bolLoading, setBolLoading] = useState(false);
  const [objModal, setObjModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [objData, setObjData] = useState<any>(null);

  useEffect(() => {
    const fetchPaises = async () => {
      setBolLoadingPaises(true);
      try {
        const res = await fetch("/backend/perfil/update/updatePais");
        const json = await res.json();
        setArrPaises(json.data ?? []);
      } catch {
        console.error("Error al cargar países");
      } finally {
        setBolLoadingPaises(false);
      }
    };
    fetchPaises();
  }, []);

  const handleGuardar = async () => {
    if (
      !strNombres.trim() ||
      !strApellidos.trim() ||
      strNombres.trim().length < 3 ||
      strApellidos.trim().length < 3
    ) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: "El nombre y apellido deben tener al menos 3 caracteres.",
      });
      return;
    }
    setBolLoading(true);
    try {
      const res = await fetch("/backend/perfil/updateUsuario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nombres: strNombres.trim(),
          apellidos: strApellidos.trim(),
          direccion: strDireccion,
          url_foto_perfil: strFotoUrl,
          id_pais: intPaisId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setObjModal({
          type: "error",
          title: "Error al guardar",
          message: json.error ?? "No se pudieron guardar los cambios.",
        });
        return;
      }
      setObjData(json.data);
      setObjModal({
        type: "success",
        title: "Cambios realizados",
        message: "Tu perfil fue actualizado correctamente.",
      });
    } catch {
      setObjModal({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor. Intenta nuevamente.",
      });
    } finally {
      setBolLoading(false);
    }
  };

  const handleCambiarFoto = () => {
    const strNuevaUrl = window.prompt("Ingresa la URL de tu nueva foto de perfil:");
    if (strNuevaUrl && strNuevaUrl.trim() !== "") {
      setStrFotoUrl(strNuevaUrl.trim());
    }
  };

  const handleEliminarFoto = () => {
    const bolConfirmado = window.confirm(
      "¿Estás seguro de que deseas eliminar tu foto de perfil?"
    );
    if (bolConfirmado) {
      setStrFotoUrl("");
    }
  };

  return (
    <>
      <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              onClick={onCancelar}
              disabled={bolLoading}
              className="p-0 text-white/60 hover:text-white hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs font-black tracking-widest uppercase">Seguridad</span>
            </Button>
          </div>
          <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
            Editar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-6">
          <p className="text-xs font-black tracking-widest text-white/50 uppercase -mt-2">
            Seguridad › Editar Perfil
          </p>
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
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pais" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    País
                  </Label>
                  <select
                    id="pais"
                    value={intPaisId ?? ""}
                    onChange={(e) => setIntPaisId(e.target.value ? Number(e.target.value) : null)}
                    disabled={bolLoadingPaises}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
                  >
                    <option value="" className="bg-[#1e1e2e] text-white/50">
                      {bolLoadingPaises ? "Cargando..." : "Selecciona un país"}
                    </option>
                    {arrPaises.map((pais) => (
                      <option key={pais.id_pais} value={pais.id_pais} className="bg-[#1e1e2e] text-white">
                        {pais.nombre_pais}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="usuario" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Usuario
                  </Label>
                  <Badge className="text-xs font-black tracking-widest bg-white/10 text-white/40 border-white/20 hover:bg-white/10">
                    No editable
                  </Badge>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-md px-3 py-2">
                  <span className="text-sm text-white/40 flex-1">
                    {usuario.username ?? ""}
                  </span>
                  {usuario.Pais?.codigo_iso && (
                    <img
                      src={`https://flagcdn.com/24x18/${usuario.Pais.codigo_iso.toLowerCase()}.png`}
                      alt={usuario.Pais.nombre_pais ?? ""}
                      width={24}
                      height={18}
                      className="rounded-sm shadow-md opacity-60"
                    />
                  )}
                </div>
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

      {objModal && (
        <ResultModal
          type={objModal.type}
          title={objModal.title}
          message={objModal.message}
          onClose={() => {
            const bolFueExito = objModal.type === "success";
            setObjModal(null);
            if (bolFueExito && objData) {
              onGuardar(objData);
              router.push("/frontend/perfil");
            }
          }}
          onRetry={objModal.type === "error" ? () => {
            setObjModal(null);
            handleGuardar();
          } : undefined}
        />
      )}
    </>
  );
}