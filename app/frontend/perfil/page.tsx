/*  Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: se llega desde el boton del header de home
      - @param {PerfilPage()} - ubicacion default de Mi Perfil
      - @return {perfil-view} - muestra los datos del usuario 
*/
/* Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: Adaptación Mobile + Cambio a Azul Primary
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 27/03/2026
    Funcionalidad: Página principal de Mi Perfil
      - Consume GET /backend/perfil/get?id_usuario=...
      - Distribuye los datos reales a cada vista
      - TODO: reemplazar ID_USUARIO_HARDCODEADO por el id real
              que llegue desde el header/auth cuando esté listo
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: FIX bd y cambios en Telefono
*/
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, LogOut, Loader2 } from "lucide-react";
import PerfilView from "./views/perfil-view";
import SeguridadView from "./views/seguridad-view";
import PublicacionesView from "./views/publicaciones-view";
import FavoritoView from "./views/favorito-view";
import HistorialView from "./views/historial-view";
import HistorialPagosView from "@/app/frontend/cobros/historial-pagos/page";

/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: Página principal de Mi Perfil
      - Lee el id_usuario desde el query param ?id=... que envía el Header
      - Consume GET /backend/perfil/getUsuario?id_usuario=...
      - Distribuye los datos reales a cada vista
*/

export default function PerfilPage() {
  const searchParams = useSearchParams();
  // Lee el id que envía el Header como /frontend/perfil?id=<user.id>
  const idUsuario = searchParams.get("id") ?? "";

  const [view, setView] = useState("perfil");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idUsuario) {
      setError("No se proporcionó un ID de usuario.");
      setLoading(false);
      return;
    }

    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/backend/perfil/getUsuario?id_usuario=${idUsuario}`
        );
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const json = await res.json();
        setUsuario(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [idUsuario]);

  const menuItems = [
    { id: "perfil", name: "MI PERFIL" },
    { id: "seguridad", name: "SEGURIDAD" },
    { id: "publicaciones", name: "PUBLICACIONES" },
    { id: "favoritos", name: "FAVORITOS" },
    { id: "historial", name: "HISTORIAL" },
    { id: "historialPagos", name: "HISTORIAL PAGOS" },
  ];

  const telefonos = usuario?.UsuarioTelefono?.map(
    (ut: any) => `+${ut.Telefono?.codigo_pais} ${ut.Telefono?.nro_telefono}`
  ) ?? [];

  const VIEWS_COMPONENTS: Record<string, React.ReactNode> = {
    perfil: usuario ? <PerfilView usuario={usuario} telefonos={telefonos} /> : null,
    publicaciones: usuario ? <PublicacionesView id_usuario={usuario.id_usuario} /> : null,
    seguridad: (
      <SeguridadView
        id_usuario={idUsuario}
        email={usuario?.email ?? ""}
        telefonos={telefonos}
        onSuccess={() => setView("perfil")}
      />
    ),
    favoritos: usuario ? <FavoritoView id_usuario={usuario.id_usuario} /> : null,
    historial: <HistorialView id_usuario={idUsuario} />,
    historialPagos: <HistorialPagosView id_usuario={idUsuario} />,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-5xl px-4 py-6 md:pt-5">

        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="text-sm font-medium">Cargando perfil...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500 font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && usuario && (
          <>
            <div id="info" className="flex items-center justify-between gap-6 mb-5 md:mb-5">
              <div className="flex items-center gap-4 md:gap-6">
                <img
                  src={usuario.url_foto_perfil ?? "https://github.com/shadcn.png"}
                  alt="User"
                  className="w-20 h-20 md:w-40 md:h-40 rounded-full border-4 border-[var(--primary)]"
                />
                <div className="text-left">
                  <h1 className="font-[900] text-2xl md:text-5xl text-[var(--foreground)] tracking-tight uppercase">
                    {usuario.nombres} {usuario.apellidos}
                  </h1>
                  <h2 className="text-slate-500 text-sm md:text-2xl font-medium">
                    {usuario.email}
                  </h2>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-[var(--primary)] text-[var(--primary)]"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {isMenuOpen && (
              <div className="fixed inset-0 z-[100] bg-black/50 md:hidden animate-in fade-in duration-300">
                <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-xl animate-in slide-in-from-right duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-black text-[var(--primary)] text-xs tracking-widest">MENÚ</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => { setView(btn.id); setIsMenuOpen(false); }}
                        className={`text-left px-4 py-3 rounded-lg text-xs font-bold transition-colors ${
                          view === btn.id
                            ? "bg-[var(--primary)] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {btn.name}
                      </button>
                    ))}
                    <hr className="my-4" />
                    <button className="flex items-center gap-2 text-red-500 px-4 py-3 text-xs font-bold hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="h-4 w-4" /> CERRAR SESIÓN
                    </button>
                  </nav>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-0 items-stretch">
              <nav id="btns" className="hidden md:flex flex-col w-64 z-10 relative">
                {menuItems.map((btn) => {
                  const isSelected = view === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => setView(btn.id)}
                      className={`text-left px-6 py-4 transition-all duration-300 text-xs font-black tracking-widest outline-none ${
                        isSelected
                          ? "bg-[var(--primary)] text-white md:rounded-l-2xl md:-mr-[1px] z-20"
                          : "bg-white text-slate-500 hover:bg-slate-50 hover:text-[var(--primary)] hover:pl-8 border-transparent z-10"
                      }`}
                    >
                      {btn.name}
                    </button>
                  );
                })}
                <button className="mt-4 flex items-center gap-2 text-xs font-black tracking-widest text-red-400 hover:text-red-600 px-6 py-4 transition-colors">
                  <LogOut className="h-4 w-4" /> SALIR
                </button>
              </nav>

              <div
                id="dinamic"
                className="flex-grow bg-[var(--primary)] text-white rounded-[5px] md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 min-h-[400px]"
              >
                {VIEWS_COMPONENTS[view] ?? VIEWS_COMPONENTS.perfil}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
