import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { Header } from "@/components/home-comps/Header";
import Footer from "@/components/home-comps/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header bolIsLoggedIn={bolPruebaSesion} />
        <main className="flex-1 pt-16 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}