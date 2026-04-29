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

export default function HeaderAdmin() {
  const objRouter = useRouter();

  const clsFocusBase = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund";
  const strHoverAnim = useHoverAnimation(true);

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
      <Image src="/logo-principal.svg" alt="logo probol" width={40} height={40} priority
      style={{ width: 'auto' }} className="h-10 w-auto object-contain lg:h-8 xl:h-10 2xl:h-14"/>
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
      <div className="flex h-16 items-center justify-between px-6">
        {objLogoElement}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCerrarSesion}
            className="text-sm font-semibold uppercase text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cerrar sesión
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-border">
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

            <span className="hidden text-sm font-semibold uppercase text-foreground md:inline">
              {strAdminName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}