/** * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Perfil del Inmueble (HU4) 
 */

import React from 'react';
import { PropertyDetails } from "@/components/property/PropertyDetails";
import { Button } from "@/components/ui/button";
import { Tag, Ruler } from "lucide-react";

// Task 4.2: Data Integration (Mock ready for Prisma/Supabase)
const objMockData = {
  strTitle: "Hermosa Casa A Estrenar Condominio Urubo Mirage",
  intPrice: 297000,
  intSurface: 383,
  strAddress: "Avenida primera calle 11 este, Santa Cruz",
  strDescription: `HERMOSA CASA A ESTRENAR
Condominio Mirage

383 mt Terreno
262 mt Construidos
3 amplias habitaciones en suite
(una en planta baja)
Living Comedor con salida al jardín
Cocina equipada independiente
Baño de visita
Piscina privada con amplio Deck
Jardín

Materiales de primera, tablón de madera rústica para mesón de baño de vista, carpintería de PVC en ventanas, gradas revestidas de madera, spots, etc.
Dos Áreas Comunes:
Piscinas, club house, cancha de fútbol, parques infantiles, etc.

297.000$ dólares o paralelo
Entrega en Enero 2026`,
  arrImages: ["/placeholder.png", "/placeholder.png"],
  strVideoUrl: "https://youtu.be/mppRJ0H08aI",
  objDetails: {
    strType: "Casa",
    strOperation: "Venta",
    strDept: "Santa Cruz",
    strZone: "Urubó",
    intRooms: 3,
    intBaths: 2,
    intFloors: 1,
    intGarages: 2
  }
};

// Task 4.1: Dynamic Route Page [id]
export default function PropertyProfilePage() {
  
  // Task 4.5: Extracting Video ID logic
  const strVideoId = objMockData.strVideoUrl.includes("youtu.be/") 
    ? objMockData.strVideoUrl.split("youtu.be/")[1]?.split("?")[0]
    : objMockData.strVideoUrl.split("v=")[1]?.split("&")[0];

  // Aplicamos la tipografía usando la variable del layout
  const objFontStyle = { fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" };

  return (
    <main 
      className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E] p-4 md:p-12"
      style={objFontStyle}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Task 4.3: Main Header (Title) */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1F3A4D] mb-4 tracking-tight">
            {objMockData.strTitle}
          </h1>
        </header>

        {/* Task 4.4 & Task 4.5: Multimedia Grid (Main Image + Side Video) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Main Image */}
          <div className="md:col-span-2 h-[300px] md:h-[500px] bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm">
            <img 
              src={objMockData.arrImages[0]} 
              className="w-full h-full object-cover" 
              alt="Main View" 
            />
          </div>
          
          <div className="flex flex-col gap-4 h-[500px]">
            {/* YouTube Player */}
            <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner relative">
              <iframe 
                className="w-full h-full border-0" 
                src={`https://www.youtube.com/embed/${strVideoId}`}
                title="Property Video"
                allowFullScreen
              />
            </div>
            {/* Secondary Image (Task 4.11 fallback logic) */}
            <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm">
              <img src={objMockData.arrImages[1]} className="w-full h-full object-cover" alt="Secondary View" />
            </div>
          </div>
        </section>

        {/* Task 4.3 & Task 4.12: Commercial Info Section (Price and Surface) */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center py-8 border-y border-black/10 mb-10 gap-6">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-[#2E2E2E] opacity-70" />
            <p className="text-2xl md:text-3xl">
              <span className="font-bold">Precio:</span>{" "}
              <span className="font-medium">{objMockData.intPrice.toLocaleString('de-DE')} $</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Ruler className="w-6 h-6 text-[#2E2E2E] opacity-70" />
            <p className="text-2xl md:text-3xl">
              <span className="font-bold">Superficie:</span>{" "}
              <span className="font-medium">{objMockData.intSurface} m²</span>
            </p>
          </div>
        </div>

        <div className="mb-12 text-xl">
          <p><span className="font-bold">Direccion:</span> {objMockData.strAddress}</p>
        </div>

        {/* Task 4.6 & Task 4.7: Technical Details and Location Tags */}
        <PropertyDetails objInfo={objMockData.objDetails} />

        {/* Task 4.8: Multi-line Description within unified container */}
        <section className="mt-16 mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
            <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D]">Descripcion</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed opacity-90">
              {objMockData.strDescription}
            </p>
          </div>
        </section>

        {/* Task 4.10: Navigation Actions */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t border-black/10">
          <Button variant="outline" className="w-full md:w-auto border-[#C26E5A] text-[#C26E5A] px-12 py-7 rounded-lg font-bold text-lg hover:bg-[#C26E5A]/5">
            Ver mis publicaciones
          </Button>
          <Button className="w-full md:w-auto bg-[#C26E5A] text-white px-12 py-7 rounded-lg font-bold text-lg hover:bg-[#C26E5A]/90 transition-colors">
            Publicar otro inmueble
          </Button>
        </footer>
      </div>
    </main>
  );
}