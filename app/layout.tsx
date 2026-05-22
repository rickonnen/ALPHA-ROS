import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals02.css";
import "leaflet/dist/leaflet.css";
import SesionExpiradaModal from "@/components/sesion-expirada-modal";

import { AuthProvider } from "@/app/auth/AuthContext";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha Ros - Plataforma Inmobiliaria",
  description: "Plataforma de compra, alquiler y anticrético de inmuebles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <AuthProvider>
          <SesionExpiradaModal />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}