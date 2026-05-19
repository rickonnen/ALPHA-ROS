"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import OtroPerfilView from "./views/otro-perfil-view";
import OtroFavoritoView from "./views/otro-favorito-view";
import OtroPublicacionesView from "./views/otro-publicaciones-view";

const menuItems = [
  { id: "perfil", name: "PERFIL" },
  { id: "favoritos", name: "FAVORITOS" },
  { id: "publicaciones", name: "PUBLICACIONES" },
];

function OtroPerfilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_usuario = searchParams.get("id") ?? "";

  const [view, setView] = useState("perfil");
  const [usuario, setUsuario] = useState<any>(null);
  const [telefonos, setTelefonos] = useState<string[]>([]);
  const [privacidad, setPrivacidad] = useState({
    favorito: false, direccion: false, genero: false,
    fecha_nacimiento: false, estado_civil: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id_usuario) { setError("Usuario no especificado."); setLoading(false); return; }

    const cargar = async () => {
      try {
        setLoading(true);
        const [resUser, resPriv] = await Promise.all([
          fetch(`/api/perfil/getUsuario?id_usuario=${id_usuario}`),
          fetch(`/api/perfil/getPrivacidad?id_usuario=${id_usuario}`),
        ]);
        if (!resUser.ok) throw new Error("Usuario no encontrado");
        const jsonUser = await resUser.json();
        const jsonPriv = resPriv.ok ? await resPriv.json() : { data: {} };

        setUsuario(jsonUser.data);
        setPrivacidad(jsonPriv.data);
        const tels = jsonUser.data?.UsuarioTelefono?.filter((ut: any) => Boolean(ut.estado))
          .map((ut: any) => `+${ut.Telefono?.codigo_pais} ${ut.Telefono?.nro_telefono}`) ?? [];
        setTelefonos(tels);
      } catch (err: any) {
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id_usuario]);

  const VIEWS: Record<string, React.ReactNode> = {
    perfil: usuario ? (
      <OtroPerfilView usuario={usuario} telefonos={telefonos} privacidad={privacidad} />
    ) : null,
    favoritos: <OtroFavoritoView id_usuario={id_usuario} />,
    publicaciones: <OtroPublicacionesView id_usuario={id_usuario} />,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
      <Loader2 className="animate-spin h-6 w-6" />
      <span className="text-sm font-medium">Cargando perfil...</span>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
  );

  const truncate = (str: string, limit: number) =>
    str?.length > limit ? str.substring(0, limit) + "." : str ?? "";

  const nombreCompleto = `${truncate(usuario?.nombres ?? "", 15)} ${truncate(usuario?.apellidos ?? "", 15)}`.trim();

  return (
    <>
      <div className="flex items-center justify-between gap-6 mb-5">
        <div className="flex mx-auto items-center gap-4 md:gap-6">
          <img
            src={usuario.url_foto_perfil?.trim() || "https://i.imgur.com/WxNkK7J.png"}
            alt="User"
            className="w-20 h-20 md:w-40 md:h-40 rounded-full border-4 border-[var(--primary)]"
            onError={(e) => { e.currentTarget.src = "https://i.imgur.com/WxNkK7J.png"; }}
          />
          <div className="text-left">
            <h1 className="font-[900] text-2xl md:text-5xl text-[var(--foreground)] tracking-tight uppercase">
              {nombreCompleto}
            </h1>
            <h2 className="text-slate-500 text-sm md:text-2xl font-medium">
              @{usuario.username}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-0 items-stretch">
        <nav className="bg-white md:rounded-l-2xl hidden md:flex flex-col w-64 h-full z-10 relative">
          {menuItems.map((btn, index) => {
            const isSelected = view === btn.id;
            return (
              <button
                key={btn.id}
                tabIndex={0}
                onClick={() => setView(btn.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setView(btn.id); }
                  if (e.key === "ArrowDown") {
                    document.querySelectorAll<HTMLElement>("#otro-btns button")[index + 1]?.focus();
                  }
                  if (e.key === "ArrowUp") {
                    document.querySelectorAll<HTMLElement>("#otro-btns button")[index - 1]?.focus();
                  }
                }}
                id={index === 0 ? "otro-btns" : undefined}
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

          {/* Botón VOLVER */}
          <button
            onClick={() => router.back()}
            className="mt-3 flex items-center gap-2 text-xs font-black tracking-widest px-6 py-4 transition-all duration-300 text-white bg-[var(--secondary)] hover:pl-8 md:rounded-l-2xl"
          >
            ← VOLVER
          </button>
        </nav>

        {/* Mobile: menú simple top */}
        <div className="flex md:hidden gap-2 mb-3 overflow-x-auto pb-1">
          {menuItems.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setView(btn.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                view === btn.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {btn.name}
            </button>
          ))}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap bg-[var(--secondary)] text-white"
          >
            ← VOLVER
          </button>
        </div>

        <div
          className="flex-grow bg-[var(--primary)] text-white rounded-[5px] md:rounded-tl-none md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 min-h-[420px]"
        >
          {VIEWS[view] ?? VIEWS.perfil}
        </div>
      </div>
    </>
  );
}

export default function OtroPerfilPage() {
  return (
    <div className="bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 md:pt-5">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        }>
          <OtroPerfilContent />
        </Suspense>
      </main>
    </div>
  );
}