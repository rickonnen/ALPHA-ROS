import { Metadata } from "next";
import HelpContentClient from "./HelpContentClient";

export const metadata: Metadata = {
  title: "Centro de Ayuda | Propbol",
  description: "Guía oficial y centro de asistencia para usuarios de la plataforma inmobiliaria Propbol.",
};

export default function AyudaPage() {
  return (
    // Usamos el fondo Soft Sand Beige de tu paleta
    <div className="min-h-full bg-background w-full flex-1 pb-16">
      <div className="w-[90%] max-w-[1600px] mx-auto pt-8">
        <HelpContentClient />
      </div>
    </div>
  );
}