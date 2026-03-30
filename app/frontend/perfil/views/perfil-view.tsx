/*  Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: se llega desde el boton del header de home
      - @param {call} - espera a ser llamada la vista
      - @return {perfil-view} - muestra la vista de Informacion del Usuario
*/
/* Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: Vista Perfil - Tematización Azul Primary
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 27/03/2026
    Funcionalidad: Vista de Información Personal
      - Ya no recibe un objeto mockeado, recibe `usuario` directo de la BD
      - @param {usuario} - objeto Usuario de Prisma
      - @param {telefonos} - array de strings "+591 xxxxxxx"
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: Vista del pais
      - Se muestra el id_pais con el codigo_iso se genera la bandera
      - @param {usuario} - objeto Usuario de Prisma
      - @param {bandera img} - una bandera generada con el codigo_iso
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: FIX bd y cambios en Telefono
*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="group flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 cursor-default border-b border-white/10 pb-4">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 transition-colors duration-300 group-hover:text-white/80">
        {label}
      </label>
      <p className="text-base md:text-lg font-semibold tracking-tight transition-all duration-300 group-hover:text-white group-hover:scale-[1.02] origin-left">
        {value}
      </p>
    </div>
  );
}

interface PerfilViewProps {
  usuario: {
    username?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    email?: string | null;
    direccion?: string | null;
    url_foto_perfil?: string | null;
    Pais?: {
      nombre_pais?: string | null;
      codigo_iso?: string | null;
    } | null;
    UsuarioTelefono?: {
      estado?: number | null;
      Telefono?: {
        nro_telefono?: string | null;
        codigo_pais?: number | null;
      } | null;
    }[];
  };
  telefonos: string[];
}

export default function PerfilView({ usuario, telefonos }: PerfilViewProps) {
  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="px-6 md:px-8">
        <CardTitle className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-6 md:px-8">
        <div className="flex flex-col gap-6">
          <div className="group flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 cursor-default border-b border-white/10 pb-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 transition-colors duration-300 group-hover:text-white/80">
              Usuario
            </label>
            <div className="flex items-center gap-2">
              <p className="text-base md:text-lg font-semibold tracking-tight transition-all duration-300 group-hover:text-white group-hover:scale-[1.02] origin-left">
                {usuario.username ?? "-"}
              </p>
              {usuario.Pais?.codigo_iso && (
                <img
                  src={`https://flagcdn.com/24x18/${usuario.Pais.codigo_iso.toLowerCase()}.png`}
                  alt={usuario.Pais.nombre_pais ?? ""}
                  width={24}
                  height={18}
                  className="rounded-sm shadow-md opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </div>
          </div>
          <DetailBlock
            label="Nombre y Apellido"
            value={`${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim() || "-"}
          />
          <DetailBlock label="Dirección" value={usuario.direccion ?? "-"} />
        </div>
        <div className="flex flex-col gap-6">
          <DetailBlock label="Email" value={usuario.email ?? "-"} />
          <DetailBlock label="Teléfono 1" value={telefonos[0] ?? "No registrado"} />
          <DetailBlock label="Teléfono 2" value={telefonos[1] ?? "No registrado"} />
          <DetailBlock label="Teléfono 3" value={telefonos[2] ?? "No registrado"} />
        </div>
      </CardContent>
    </Card>
  );
}
