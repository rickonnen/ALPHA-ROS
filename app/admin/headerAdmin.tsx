"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

import { useAuth } from "@/app/auth/AuthContext";
import { useUsuarioHeader } from "../../components/hooks/useUsuarioHeader";
import { useFotoPerfil } from "../../components/hooks/useFotoPerfil";
import { useHoverAnimation } from "../../components/hooks/useHoverAnimation";
import { useScrollDirection } from "../../components/hooks/useScrollDirection";
import { LogoPropBol } from "@/public/logoPropBol";

export default function HeaderAdmin() {
  const objRouter = useRouter();

  const clsFocusBase = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund";
  const strHoverAnim = useHoverAnimation(true ,true, "pointer", true, true);

  const objAuth = useAuth() as {
    user?: {
      id?: string;
      idUsuario?: string;
      email?: string;
      nombre?: string;
      name?: string;
    };
    usuario?: {
      id?: string;
      idUsuario?: string;
      nombre?: string;
      name?: string;
      email?: string;
    };
    logout?: () => Promise<void> | void;
    signOut?: () => Promise<void> | void;
  };

  const objUser = objAuth?.user || objAuth?.usuario || undefined;

  const { strNombreHeader } = useUsuarioHeader(objUser);

  const strIdUsuario = objUser?.id || objUser?.idUsuario || undefined;

  const { strFotoPerfil, bolLoading } = useFotoPerfil(strIdUsuario);

  const strAdminName =
    strNombreHeader?.trim() ||
    objUser?.nombre?.trim() ||
    objUser?.name?.trim() ||
    "Administrador";

  // hooks de lógica
  const bolHideHeader = useScrollDirection();

  const objLogoElement = useMemo(() => (
    <Link href="/admin" aria-label="ir al panel admin" className={`inline-flex items-center gap-2 rounded-md shrink-0 ${clsFocusBase} ${strHoverAnim}`}>
      {/* componente logo PropBol */}
      <LogoPropBol className="h-10 w-auto shrink-0 lg:h-8 xl:h-10 2xl:h-14" />
      <span className="text-subtitle lg:text-body-info xl:text-subtitle 2xl:text-main-title font-heading font-black tracking-tighter leading-none">
        <span className="text-primary">PROP</span>
        <span className="text-secondary">BOL</span>
      </span>
    </Link>
  ), [strHoverAnim]);

  const handleCerrarSesion = async () => {
    try {
      if (typeof objAuth.logout === "function") {
        await objAuth.logout();
      } else if (typeof objAuth.signOut === "function") {
        await objAuth.signOut();
      }

      objRouter.replace("/");
      objRouter.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      objRouter.replace("/");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-secondary-fund transition-transform duration-300 ease-in-out ${
        bolHideHeader ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="w-full px-4 lg:px-[40px] h-18 flex items-center justify-between gap-4 lg:gap-8">
        {objLogoElement}

        <div className="flex flex-row items-center gap-x-4 md:gap-x-6">
          <button
            type="button"
            onClick={handleCerrarSesion}
            className={`text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-bold uppercase text-primary transition-colors hover:text-secondary whitespace-nowrap ${strHoverAnim}`}
          >
            Cerrar sesión
          </button>

          {/* INICIO DEL DISEÑO DE PERFIL ACTUALIZADO */}
          <div className="flex items-center gap-2 p-1 pr-4 bg-background border border-border rounded-full shrink-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border">
              {!bolLoading && strFotoPerfil ? (
                <Image
                  src={strFotoPerfil}
                  alt="Foto de perfil del administrador"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-8 w-8 text-foreground/70" />
              )}
            </div>

            <span className="hidden md:block text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-semibold uppercase text-foreground leading-none whitespace-nowrap">
              {strAdminName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}