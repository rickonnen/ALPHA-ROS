"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/auth/AuthContext";
import { NotificationProvider } from "@/app/home/components/notifications/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}