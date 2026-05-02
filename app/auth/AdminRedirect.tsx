"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, isAdminUser } from "./AuthContext";

export default function AdminRedirect() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (pathname !== "/") return;
    if (!isAdminUser(user)) return;

    router.replace("/admin");
  }, [isLoading, user, pathname, router]);

  return null;
}
