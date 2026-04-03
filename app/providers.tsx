"use client";

import { AuthProvider } from "@/app/auth/AuthContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );

}