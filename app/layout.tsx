import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/frontend/auth/AuthContext";
import { Header } from "@/components/home-comps/Header";
import Footer from "@/components/home-comps/footer";

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
  const bolPruebaSesion = false;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Header bolIsLoggedIn={bolPruebaSesion} />

          <main className="flex-1 pt-16 flex flex-col">{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
/*  Dev: Rodrigo Almaraz - team-ada
    Fecha: 30/03/2026
    Funcionalidad: FIX movi el AuthProider 3 lineas mas para abajo
*/
