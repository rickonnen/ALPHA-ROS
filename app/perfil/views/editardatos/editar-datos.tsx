/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
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
/** Dev: Alvarado Alisson Dalet - sow-alissona
 * Fecha: 03/04/2026
 * Fix: Quitar breadcrumb
 */
/** Dev: Alvarado Alisson Dalet - sow-alissona
 * Fecha: 03/04/2026
 * Fix: Correccion error en redireccion despues del modal
 */
/** Dev: Alvarado Alisson Dalet - sow-alissona
 * Fecha: 04/04/2026
 * Fix: Limite de caracteres en campos: nombres max 15, apellidos max 15,
 *      direccion max 40 y deteccion de guardar sin cambios.
 *      Username editable
 *      Eliminar redireccion tras guardar
 */
/** Dev: Alvarado Alisson Dalet - sow-AlissonA
 * Fecha: 08/04/2026
 * Funcionalidad: Subir foto desde el explorador de archivos
 */
/** Dev: Alvarado Alisson Dalet - sow-AlissonA
 * Fecha: 09/04/2026
 * Fix: Validacion de minimo 3 letras en username
 *      Restriccion de emojis en username
 */
/** Dev: Alvarado Alisson Dalet - sow-AlissonA
 * Fecha: 16/04/2026
 * Fix: Botones foto mobile-friendly
 *      Reemplazar contadores de caracteres por mensajes de validacion inline
 * Feat: Campos genero, fecha de nacimiento y estado civil
 *                Asterisco de obligatorio en campos requeridos
 */
"use client";
import { useState, useEffect } from "react";
import ResultModal from "@/components/ui/ResultModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

const intMaxName           = 50;
const intMaxLastName       = 50;
const intMaxAddress        = 200;
const intMaxUsername       = 20;
const intMinLetrasUsername = 3;
const regexSinAcentos      = /^[^\u00C0-\u024F]+$/;
const regexSinEmojis       = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FE0F}]/u;
const regexSoloTexto       = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/;

const ARR_GENEROS = [
  { value: "M",   label: "Masculino" },
  { value: "F",    label: "Femenino" },
  { value: "O",  label: "Otro/Prefiero no decir" },
];

const ARR_ESTADOS_CIVILES = [
  { value: "soltero",     label: "Soltero/a" },
  { value: "casado",      label: "Casado/a" },
  { value: "divorciado",  label: "Divorciado/a" },
  { value: "viudo",       label: "Viudo/a" },
];

interface EditProfileProps {
  usuario: {
    id_usuario: string;
    username?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    direccion?: string | null;
    url_foto_perfil?: string | null;
    id_pais?: number | null;
    genero?: string | null;
    fecha_nac?: string | null;
    estado_civil?: string | null;
    Pais?: {
      nombre_pais?: string | null;
      codigo_iso?: string | null;
    } | null;
  };
  onGuardar: (data: any) => void;
  onCancelar: () => void;
}

export default function EditProfile({ usuario, onGuardar, onCancelar }: EditProfileProps) {
  const [strNombres, setStrNombres]         = useState(usuario.nombres ?? "");
  const [strApellidos, setStrApellidos]     = useState(usuario.apellidos ?? "");
  const [strDireccion, setStrDireccion]     = useState(usuario.direccion ?? "");
  const [strFotoUrl, setStrFotoUrl]         = useState(usuario.url_foto_perfil ?? "");
  const [strUsername, setStrUsername]       = useState(usuario.username ?? "");
  const [intPaisId, setIntPaisId]           = useState<number | null>(usuario.id_pais ?? null);
  const [strGenero, setStrGenero]           = useState(usuario.genero ?? "");
  const [strFechaNac, setStrFechaNac]       = useState(usuario.fecha_nac?.slice(0, 10) ?? "");
  const [strEstadoCivil, setStrEstadoCivil] = useState(usuario.estado_civil ?? "");
  const [arrPaises, setArrPaises]           = useState<{ id_pais: number; nombre_pais: string }[]>([]);
  const [bolLoadingPaises, setBolLoadingPaises] = useState(false);
  const [bolLoading, setBolLoading]         = useState(false);
  const [bolLoadingFoto, setBolLoadingFoto] = useState(false);
  const [objModal, setObjModal]             = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [objData, setObjData] = useState<any>(null);

  useEffect(() => {
    const fetchPaises = async () => {
      setBolLoadingPaises(true);
      try {
        const res = await fetch("/api/perfil/updatePais");
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
    const bolSinCambios =
      strNombres.trim()   === (usuario.nombres?.trim()               ?? "") &&
      strApellidos.trim() === (usuario.apellidos?.trim()              ?? "") &&
      strDireccion.trim() === (usuario.direccion?.trim()              ?? "") &&
      strFotoUrl.trim()   === (usuario.url_foto_perfil?.trim()        ?? "") &&
      strUsername.trim()  === (usuario.username?.trim()               ?? "") &&
      intPaisId           === (usuario.id_pais                        ?? null) &&
      strGenero           === (usuario.genero                         ?? "") &&
      strFechaNac         === (usuario.fecha_nac?.slice(0, 10) ?? "") &&
      strEstadoCivil      === (usuario.estado_civil                   ?? "");

    if (bolSinCambios) {
      setObjModal({
        type: "error",
        title: "Sin cambios",
        message: "No realizaste ningún cambio en tu perfil.",
      });
      return;
    }

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

    if (
      strNombres.trim().length > intMaxName ||
      strApellidos.trim().length > intMaxLastName ||
      strDireccion.trim().length > intMaxAddress
    ) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: `El nombre no puede superar ${intMaxName} caracteres, el apellido ${intMaxLastName} y la dirección ${intMaxAddress}.`,
      });
      return;
    }

    if (!strUsername.trim()) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: "El username no puede estar vacío.",
      });
      return;
    }

    if (strUsername.trim().length > intMaxUsername) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: `El username no puede superar ${intMaxUsername} caracteres.`,
      });
      return;
    }

    if (!regexSinAcentos.test(strUsername.trim())) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: "El username no puede contener letras con acento.",
      });
      return;
    }

    if (regexSinEmojis.test(strUsername.trim())) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: "El username no puede contener emojis.",
      });
      return;
    }

    const intCantLetras = (strUsername.trim().match(/[a-zA-Z]/g) ?? []).length;
    if (intCantLetras < intMinLetrasUsername) {
      setObjModal({
        type: "error",
        title: "Campos inválidos",
        message: `El username debe contener al menos ${intMinLetrasUsername} letras.`,
      });
      return;
    }

    if (strFechaNac) {
      const dtFecha  = new Date(strFechaNac);
      const dtHoy    = new Date();
      const intAnios = dtHoy.getFullYear() - dtFecha.getFullYear();
      if (isNaN(dtFecha.getTime())) {
        setObjModal({
          type: "error",
          title: "Campos inválidos",
          message: "La fecha de nacimiento no es válida.",
        });
        return;
      }
      if (intAnios < 18 || intAnios > 120) {
        setObjModal({
          type: "error",
          title: "Campos inválidos",
          message: "Debes tener al menos 18 años para registrar una fecha de nacimiento.",
        });
        return;
      }
    }

    setBolLoading(true);
    try {
      const res = await fetch("/api/perfil/updateUsuario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario:       usuario.id_usuario,
          nombres:          strNombres.trim(),
          apellidos:        strApellidos.trim(),
          direccion:        strDireccion,
          url_foto_perfil:  strFotoUrl,
          id_pais:          intPaisId,
          username:         strUsername.trim(),
          genero:           strGenero      || null,
          fecha_nac:        strFechaNac    || null,
          estado_civil:     strEstadoCivil || null,
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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setBolLoadingFoto(true);
      try {
        const formData = new FormData();
        formData.append("foto", file);

        const res = await fetch("/api/perfil/uploadFoto", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok) {
          setObjModal({
            type: "error",
            title: "Error al subir foto",
            message: json.error ?? "No se pudo subir la imagen.",
          });
          return;
        }

        setStrFotoUrl(json.url);
      } catch {
        setObjModal({
          type: "error",
          title: "Error de conexión",
          message: "No se pudo subir la imagen. Intenta nuevamente.",
        });
      } finally {
        setBolLoadingFoto(false);
      }
    };
    input.click();
  };

  const handleEliminarFoto = () => {
    const bolConfirmado = window.confirm(
      "¿Estás seguro de que deseas eliminar tu foto de perfil?"
    );
    if (bolConfirmado) {
      setStrFotoUrl("");
    }
  };

  const intLetrasUsername = (strUsername.match(/[a-zA-Z]/g) ?? []).length;

  const strFechaMax = new Date().toISOString().slice(0, 10);
  const strFechaMin = `${new Date().getFullYear() - 120}-01-01`;

  const clsSelect    = "bg-white/10 border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50 w-full";
  const clsOptionBg  = "bg-[#1e1e2e]";

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

          {/* Foto de perfil */}
          <div>
            <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-4">
              Foto de perfil
            </p>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 flex-shrink-0">
                <AvatarImage src={strFotoUrl} alt={strNombres} />
                <AvatarFallback className="text-xl font-black bg-white/20 text-white">
                  {strNombres[0]}{strApellidos[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleCambiarFoto}
                  disabled={bolLoadingFoto}
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest min-w-[120px]"
                >
                  {bolLoadingFoto ? (
                    <><Loader2 className="animate-spin h-4 w-4 mr-2" />Subiendo...</>
                  ) : (
                    "Cambiar foto"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEliminarFoto}
                  disabled={bolLoadingFoto}
                  className="bg-transparent border-red-300/50 text-red-300 hover:bg-red-400/10 hover:text-red-200 text-xs font-black tracking-widest min-w-[120px]"
                >
                  Eliminar foto
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Datos personales */}
          <div>
            <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-5">
              Datos personales
            </p>
            <div className="space-y-5">

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nombres" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Nombre <span style={{ color: "#E05A2B" }}>*</span>
                  </Label>
                  <Input
                    id="nombres"
                    value={strNombres}
                    onChange={(e) => setStrNombres(e.target.value)}
                    maxLength={intMaxName}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                  />
                  {strNombres.trim() && regexSoloTexto.test(strNombres) && (
                    <span className="text-xs text-red-400 font-black">
                      Solo se permiten letras (a-z, á-ú, ñ).
                    </span>
                  )}
                  {strNombres.length >= intMaxName && (
                    <span className="text-xs text-red-400 font-black">
                      Máximo {intMaxName} caracteres.
                    </span>
                  )}
                </div>

                {/* Apellido */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="apellidos" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Apellido <span style={{ color: "#E05A2B" }}>*</span>
                  </Label>
                  <Input
                    id="apellidos"
                    value={strApellidos}
                    onChange={(e) => setStrApellidos(e.target.value)}
                    maxLength={intMaxLastName}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                  />
                  {strApellidos.trim() && regexSoloTexto.test(strApellidos) && (
                    <span className="text-xs text-red-400 font-black">
                      Solo se permiten letras (a-z, á-ú, ñ).
                    </span>
                  )}
                  {strApellidos.length >= intMaxLastName && (
                    <span className="text-xs text-red-400 font-black">
                      Máximo {intMaxLastName} caracteres.
                    </span>
                  )}
                </div>
              </div>

              {/* Dirección y País */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Dirección */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="direccion" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Dirección <span style={{ color: "#E05A2B" }}>*</span>
                  </Label>
                  <Input
                    id="direccion"
                    value={strDireccion}
                    onChange={(e) => setStrDireccion(e.target.value)}
                    maxLength={intMaxAddress}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                  />
                  {strDireccion.length >= intMaxAddress && (
                    <span className="text-xs text-red-400 font-black">
                      Máximo {intMaxAddress} caracteres.
                    </span>
                  )}
                </div>

                {/* País */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pais" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    País
                  </Label>
                  <select
                    id="pais"
                    value={intPaisId ?? ""}
                    onChange={(e) => setIntPaisId(e.target.value ? Number(e.target.value) : null)}
                    disabled={bolLoadingPaises}
                    className={clsSelect}
                  >
                    <option value="" className={`${clsOptionBg} text-white/50`}>
                      {bolLoadingPaises ? "Cargando..." : "Selecciona un país"}
                    </option>
                    {arrPaises.map((pais) => (
                      <option key={pais.id_pais} value={pais.id_pais} className={`${clsOptionBg} text-white`}>
                        {pais.nombre_pais}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username y Género */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="username" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Usuario <span style={{ color: "#E05A2B" }}>*</span>
                  </Label>
                  <Input
                    id="username"
                    value={strUsername}
                    onChange={(e) => setStrUsername(e.target.value)}
                    maxLength={intMaxUsername}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                  />
                  {strUsername.trim() && !regexSinAcentos.test(strUsername) && (
                    <span className="text-xs text-red-400 font-black">
                      El username no puede contener letras con acento.
                    </span>
                  )}
                  {strUsername.trim() && regexSinEmojis.test(strUsername) && (
                    <span className="text-xs text-red-400 font-black">
                      El username no puede contener emojis.
                    </span>
                  )}
                  {strUsername.trim() && intLetrasUsername < intMinLetrasUsername && (
                    <span className="text-xs text-red-400 font-black">
                      El username debe contener al menos {intMinLetrasUsername} letras (a-z).
                    </span>
                  )}
                  {strUsername.length >= intMaxUsername && (
                    <span className="text-xs text-red-400 font-black">
                      Máximo {intMaxUsername} caracteres.
                    </span>
                  )}
                </div>

                {/* Género */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="genero" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Género
                  </Label>
                  <select
                    id="genero"
                    value={strGenero}
                    onChange={(e) => setStrGenero(e.target.value)}
                    className={clsSelect}
                  >
                    <option value="" className={`${clsOptionBg} text-white/50`}>
                      Selecciona un género
                    </option>
                    {ARR_GENEROS.map((g) => (
                      <option key={g.value} value={g.value} className={`${clsOptionBg} text-white`}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha de nacimiento y Estado civil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Fecha de nacimiento */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fecha_nacimiento" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Fecha de nacimiento
                  </Label>
                  <input
                    id="fecha_nacimiento"
                    type="date"
                    value={strFechaNac}
                    onChange={(e) => setStrFechaNac(e.target.value)}
                    min={strFechaMin}
                    max={strFechaMax}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/30 w-full [color-scheme:dark]"
                  />
                </div>

                {/* Estado civil */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="estado_civil" className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Estado civil
                  </Label>
                  <select
                    id="estado_civil"
                    value={strEstadoCivil}
                    onChange={(e) => setStrEstadoCivil(e.target.value)}
                    className={clsSelect}
                  >
                    <option value="" className={`${clsOptionBg} text-white/50`}>
                      Selecciona un estado civil
                    </option>
                    {ARR_ESTADOS_CIVILES.map((ec) => (
                      <option key={ec.value} value={ec.value} className={`${clsOptionBg} text-white`}>
                        {ec.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Botones */}
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