"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";

const isAdminUser = (objUser: any): boolean => {
  if (!objUser) return false;

  if (typeof objUser.rol !== "undefined" && objUser.rol !== null) {
    return Number(objUser.rol) === 1;
  }

  if (typeof objUser.role === "string") {
    const roleLower = objUser.role.toLowerCase();
    return roleLower === "admin" || roleLower === "administrador";
  }

  if (typeof objUser.isAdmin === "boolean") {
    return objUser.isAdmin;
  }

  return false;
};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isAdminUser(user)) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !isAdminUser(user)) {
    return null;
  }

  return <>{children}</>;
}
