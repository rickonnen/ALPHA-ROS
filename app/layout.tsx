import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importamos el Header desde la carpeta de tu equipo
import { Header } from "@/components/home-comps/Header";

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
  // Variable de prueba para la sesión (Estándar: bol = boolean)
  const bolPruebaSesion = false;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        
        {/* Colocamos el Header aquí arriba para que sea global */}
        <Header bolIsLoggedIn={bolPruebaSesion} />
        
        <main className="flex-1 pt-16 flex flex-col">
          {children}
        </main>
        
      </body>
    </html>
  );
}

