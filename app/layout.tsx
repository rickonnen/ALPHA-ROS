import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/app/auth/AuthContext";
import { Header } from "@/components/homeComponents/header";
import Footer from "@/components/homeComponents/footer";
import { GlobalShortcut } from "@/components/GlobalShortcut";
import "leaflet/dist/leaflet.css";

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
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <AuthProvider>
          {/* El Header es fixed (z-50), por lo tanto no ocupa espacio físico */}
          <Header />
              <GlobalShortcut />
          {/* CORRECCIÓN: pt-18 (72px) para compensar la altura h-18 del Header */}
          <main className="flex-1 pt-18 flex flex-col">
            {children}
          </main>
          
          {/* el Footer ahora está dentro de AuthProvider */}
          <Footer /> 
        </AuthProvider>
      </body>
    </html>
  );
}

/* Dev: Rodrigo Almaraz - team-ada
    Fecha: 02/04/2026
    Funcionalidad: Ajuste de padding superior (pt-20) para evitar que el Header fixed cubra el contenido.
    Sincronización de colores base (bg-background) en el body.
*/