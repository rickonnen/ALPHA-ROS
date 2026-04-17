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
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: FIX bd y cambios en Telefono
*/
/*  Dev: David Chavez Totora - sow-davidc
    Fecha: 03/04/2026
    Funcionalidad: Implementacion de JWT a todo Perfil
*/
/*  Dev: Alvarado Alisson Dalet - sow-alissona
    Fecha: 04/04/2026
    Fix: Agrega intRefreshKey al useEffect de fetchUsuario para que al guardar
         cambios en editar perfil el header (foto, nombre) se actualice
         inmediatamente sin necesidad de hacer refresh manual de la pagina
*/
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";

import PerfilView from "./views/perfil-view";
import SeguridadView from "./views/seguridad-view";
import PublicacionesView from "./views/publicaciones-view";
import FavoritoView from "./views/favorito-view";
import HistorialView from "./views/historial-view";
import HistorialPagosView from "@/app/cobros/historial-pagos/page";
import { useAuth } from "../auth/AuthContext";
/*  Dev: David Chavez Totora - sow-davidc 
    Fecha: 05/04/2026
    Funcionalidad: integracion del modal de confirmacion para el logout
      - @param {llamada} - se llama con el titulo, mensaje, funcion a ejecutar al confirmar, funcion a ejecutar al cancelar, y opcionalmente los textos de los botones
      - @return {accion} - se confirma una accion o se cancela, cerrando el modal
*/
import ConfirmModal from "@/components/ui/confirmModal";
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: Página principal de Mi Perfil
      - Lee el id_usuario desde el query param ?id=... que envía el Header
      - Consume GET /backend/perfil/getUsuario?id_usuario=...
      - Distribuye los datos reales a cada vista
*/

function PerfilContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  console.log("Usuario autenticado en PerfilContent:", user);
  const userId = user?.id ?? "";
  console.log("Tipo de Usuario:", typeof userId);
  console.log("Usuario:", userId);

  const [view, setView] = useState("perfil");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telefonos, setTelefonos] = useState<string[]>([]);
  const [intRefreshKey, setIntRefreshKey] = useState(0);

  useEffect(() => {
  if (userId) {
    setError(null);
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/perfil/getUsuario?id_usuario=${userId}`);
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const json = await res.json();
        setUsuario(json.data);
        
        const tels = json.data?.UsuarioTelefono?.filter((ut: any) =>
            Boolean(ut.estado)
          ).map((ut: any) =>
              `+${ut.Telefono?.codigo_pais} ${ut.Telefono?.nro_telefono}`
          ) ?? [];
        setTelefonos(tels);
      } catch (err: any) {
        setError("Usuario no encontrado en la base de datos.");
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  } 
  
  else {
    const timer = setTimeout(() => {
      if (!userId) {
        setError("Sesión no válida. Redirigiendo...");
        router.push("/");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [userId, intRefreshKey, router]);

  const handleTelefonosChange = (nuevosTelefonos: string[]) => {
    setTelefonos(nuevosTelefonos);
  };
  const menuItems = [
    { id: "perfil", name: "MI PERFIL" },
    { id: "seguridad", name: "SEGURIDAD" },
    { id: "publicaciones", name: "PUBLICACIONES" },
    { id: "favoritos", name: "FAVORITOS" },
    { id: "historial", name: "HISTORIAL" },
    { id: "historialPagos", name: "HISTORIAL PAGOS" },
    { id: "zonas", name: "ZONAS" },
  ];

  //miguel actualizacion telefonos
  // const telefonos =
  //   usuario?.UsuarioTelefono?.map(
  //     (ut: any) => `+${ut.Telefono?.codigo_pais} ${ut.Telefono?.nro_telefono}`,
  //   ) ?? [];

  const VIEWS_COMPONENTS: Record<string, React.ReactNode> = {
    perfil: usuario ? (
      <PerfilView usuario={usuario} telefonos={telefonos} />
    ) : null,
    publicaciones: usuario ? <PublicacionesView id_usuario={userId} /> : null,
    seguridad: (
      <SeguridadView
        id_usuario={userId}
        email={usuario?.email ?? ""}
        telefonos={telefonos}
        onSuccess={() => setView("perfil")}
        onTelefonosChange={handleTelefonosChange}
        onPerfilActualizado={() => setIntRefreshKey((k) => k + 1)}
      />
    ),
    favoritos: usuario ? <FavoritoView id_usuario={userId} /> : null,
    historial: <HistorialView id_usuario={userId} />,
    historialPagos: <HistorialPagosView />,
    zonas: <div className="p-6 text-center text-slate-500">En proceso de Team-Bug Hunters/Mapas</div>,
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };
  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="animate-spin h-6 w-6" />
          <span className="text-sm font-medium">Cargando perfil...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500 font-semibold">
          <div className="text-red-500 font-semibold text-lg">{error}</div>
          <p className="text-slate-400 text-sm">Regresando al inicio...</p>
        </div>
      )}

      {!loading && !error && usuario && (
        <>
          <div
            id="info"
            className="flex items-center justify-between gap-6 mb-5 md:mb-5"
          >
            <div className="flex mx-auto items-center gap-4 md:gap-6">
              <img
                src={
                  usuario.url_foto_perfil?.trim() ||
                  "https://i.imgur.com/WxNkK7J.png"
                }
                alt="User"
                className="w-20 h-20 md:w-40 md:h-40 rounded-full border-4 border-[var(--primary)]"
                onError={(e) => {
                  e.currentTarget.src = "https://i.imgur.com/WxNkK7J.png";
                }}
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
                  <span className="font-black text-[var(--primary)] text-xs tracking-widest">
                    MENÚ
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-2">
                  {menuItems.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        setView(btn.id);
                        setIsMenuOpen(false);
                      }}
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-black font-bold px-4 py-3 rounded-lg text-white bg-[var(--secondary)]"
                  >                    
                    CERRAR SESIÓN
                  </button>
                </nav>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-0 items-stretch">
            <nav
              id="btns"
              className="bg-white md:rounded-l-2xl hidden md:flex flex-col w-64 h-full z-10 relative"
            >
              {menuItems.map((btn, index) => {
                const isSelected = view === btn.id;
                return (
                  <button
                    key={btn.id}
                    tabIndex={0}
                    onClick={() => setView(btn.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setView(btn.id);
                        setTimeout(() => {
                          const dinamicContent =
                            document.getElementById("dinamic");
                          dinamicContent?.focus();
                        }, 100);
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        const next =
                          document.querySelectorAll<HTMLElement>(
                            "#btns button",
                          )[index + 1];
                        next?.focus();
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        const prev =
                          document.querySelectorAll<HTMLElement>(
                            "#btns button",
                          )[index - 1];
                        prev?.focus();
                      }
                    }}
                    className={`text-left px-6 py-4 transition-all duration-300 text-xs font-black tracking-widest focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline ${
                      isSelected
                        ? "bg-[var(--primary)] text-white md:rounded-l-2xl md:-mr-[1px] z-20 focus-visible:outline-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[var(--primary)] hover:pl-8 border-transparent z-10 focus-visible:outline-[var(--primary)]"
                    }`}
                  >
                    {btn.name}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="mt-3 flex items-center gap-2 text-xs font-black tracking-widest px-6 py-4 transition-all duration-300 text-white bg-[var(--secondary)] hover:pl-8 md:rounded-l-2xl"
              >                
                CERRAR SESION
              </button>
            </nav>

            <div
              id="dinamic"
              tabIndex={-1}
              className="flex-grow bg-[var(--primary)] text-white rounded-[5px] md:rounded-tl-none md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 min-h-[420px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              {VIEWS_COMPONENTS[view] ?? VIEWS_COMPONENTS.perfil}
            </div>
          </div>
        </>
      )}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
            {/* Icono de Salir en Rojo */}
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} className="text-red-500" />
            </div>

            <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
              ¿Cerrar sesión?
            </h3>

            <p className="text-slate-500 text-sm mb-6">
              Estás a punto de salir de tu cuenta. ¿Deseas continuar?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-md shadow-red-200 transition-colors"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PerfilPage() {
  return (
    <div className="bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 md:pt-5">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 className="animate-spin h-6 w-6" />
              <span className="text-sm font-medium">Cargando datos...</span>
            </div>
          }
        >
          <PerfilContent />
        </Suspense>
      </main>
    </div>
  );
}
