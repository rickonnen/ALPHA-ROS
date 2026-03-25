/*  Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: se llega desde el boton del header de home
      - @param {call} - espera a ser llamada la vista
      - @return {perfil-view} - muestra la vista de Informacion del Usuario
*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="group flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 cursor-default border-b border-white/10 pb-4">
      
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1 transition-colors duration-300 group-hover:text-white/90">
        {label}
      </label>
      <p className="text-lg font-semibold tracking-tight transition-all duration-300 group-hover:text-white group-hover:scale-[1.02] origin-left">
        {value}
      </p>   
    </div>
  );
}

export default function PerfilView({ user }: { user: any }) {
  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6">
        
        <div className="flex flex-col gap-6">
          <DetailBlock label="Usuario" value={user.usuario} />
          <DetailBlock label="Nombre y Apellido" value={`${user.nombres} ${user.apellidos}`} />
          <DetailBlock label="Dirección" value={user.direccion} />
        </div>
        <div className="flex flex-col gap-6">
          <DetailBlock label="Email" value={user.email} />
          <DetailBlock label="Teléfono 1" value={user.telefono1} />
          <DetailBlock label="Teléfono 2" value={user.telefono2} />
          <DetailBlock label="Teléfono 3" value="-" />
        </div>
      </CardContent>
    </Card>
  );
}