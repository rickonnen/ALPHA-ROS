"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { useUsuarioHeader } from "@/components/hooks/useUsuarioHeader";
import MenuAdmin from "./menuAdmin";

export default function AdminPage() {
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
  };

  const objUser = objAuth?.user || objAuth?.usuario || undefined;
  const { strNombreHeader } = useUsuarioHeader(objUser);

  const strAdminName =
    strNombreHeader?.trim() ||
    objUser?.nombre?.trim() ||
    objUser?.name?.trim() ||
    objUser?.email?.split("@")?.[0]?.trim() ||
    "Administrador";

  return (
    <>
      <section className="mb-14">
        <h1 className="text-main-title font-bold tracking-tight text-foreground">
          Hola de nuevo "{strAdminName}"
        </h1>
      </section>

      <MenuAdmin />
    </>
  );
}