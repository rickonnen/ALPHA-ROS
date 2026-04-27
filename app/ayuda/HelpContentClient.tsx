"use client";


import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCarousel } from "@/components/hooks/useCarousel";

interface HelpTopic {
  id: string;
  title: string;
  breadcrumb: string;
  icon: React.ReactNode;
}

const helpContent: Record<string, { subtitle: string; description: string; steps: string[]; images: string[] }> = {
  identificar: {
    subtitle: "Uso de filtros para localizar inmuebles de forma precisa.",
    description: "Segmenta las búsquedas mediante el panel lateral para optimizar la localización de propiedades según tus necesidades.",
    steps: [
      "Accede al buscador principal desde la página de inicio.",
      "Selecciona el tipo de operación: Venta, Alquiler o Anticrético.",
      "Filtra por categoría (Casa, Departamento, Terreno, etc.).",
      "En caso de no encontrar coincidencias, se mostrará un mensaje de 'Aún no existentes'."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777259266/paso_1_edt5pl.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777259266/paso_2_q33gar.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777259267/paso_3_yh7rai.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777259267/paso_4_uossrp.png"
    ]
  },
  mapa: {
    subtitle: "Navegación y geolocalización de propiedades.",
    description: "Utiliza el mapa interactivo para ubicar visualmente los inmuebles y servicios técnicos (Fixers) en zonas específicas.",
    steps: [
      "Concede permiso de ubicación para centrar el mapa automáticamente.",
      "Interactúa con los marcadores para obtener una vista previa de la oferta.",
      "Explora diversas ciudades como Cochabamba, Tarija o Santa Cruz mediante el zoom."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777259212/perimitir_accceso_ubicacion_elwsjq.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257083/visualizacion_de_mapa_swnar9.png"
    ]
  },
  coincidencias: {
    subtitle: "Conexión de preferencias con ofertas disponibles.",
    description: "El algoritmo analiza los filtros frecuentes para sugerir inmuebles que se ajusten a tus requerimientos.",
    steps: [
      "Consulta la sección de 'Recomendados' basada en búsquedas recientes.",
      "Identifica las propiedades con etiquetas de coincidencia total según tus criterios.",
      "Recibe notificaciones al publicarse inmuebles que encajen con tus filtros guardados."
    ],
    images: [
      "https://res.cloudinary.com/tu_cloud/image/upload/v1/coincidencias_1.png"
    ]
  },
  pagos: {
    subtitle: "Proceso de pago para contratación y publicación.",
    description: "Gestión de transacciones para adquirir planes premium o servicios especializados.",
    steps: [
      "Selecciona el nivel de visibilidad deseado (Básico, Pro o Premium).",
      "Escanea el código QR generado para procesar la transacción bancaria.",
      "Carga la captura de pantalla del comprobante en el apartado de validación."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/1_aqinoq.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/2_hbod0h.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/3_ex260f.png"
    ]
  },
  verificar: {
    subtitle: "Validación de comprobantes y activación de anuncios.",
    description: "Flujo administrativo para garantizar la legitimidad de cada publicación en la plataforma.",
    steps: [
      "Accede a la opción 'Perfil' desde el menú de usuario.",
      "Entra en 'Historial de Pagos' para listar tus transacciones recientes.",
      "Verifica el estado del pago: 'Pendiente' (en revisión), 'Realizado' (activo) o 'Rechazado'."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777258770/0_b1iepa.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777258770/1_n0rmsa.png"
    ]
  }
};

const arrHelpTopics: HelpTopic[] = [
  { id: "identificar", title: "Identificación de propiedades", breadcrumb: "Identificar", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { id: "mapa", title: "Uso del Mapa Interactivo", breadcrumb: "Mapa", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { id: "coincidencias", title: "Sistema de Coincidencias", breadcrumb: "Coincidencias", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { id: "pagos", title: "Procedimiento de Pagos", breadcrumb: "Pagos", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { id: "verificar", title: "Verificación de Transacciones", breadcrumb: "Verificación", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

export default function HelpContentClient() {
  const [strActiveTopicId, setStrActiveTopicId] = useState<string>(arrHelpTopics[0].id);
  const objActiveTopic = arrHelpTopics.find(t => t.id === strActiveTopicId) || arrHelpTopics[0];
  const activeContent = helpContent[strActiveTopicId] || helpContent["identificar"];

  const {
    intCurrentIndex,
    objBannerRef,
    bolShowControls,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers
  } = useCarousel({
    intTotalItems: activeContent.images.length,
    intAutoPlayDelay: 6000,
  });

  // ARREGLO 1: Forzar el reseteo del carrusel al cambiar de tema
  useEffect(() => {
    if (goToSelectedImage) {
      goToSelectedImage(0);
    }
  }, [strActiveTopicId]);

  // Precarga de imágenes
  useEffect(() => {
    activeContent.images.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [activeContent]);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm text-[#8b8276]">
        <Link href="/" className="hover:text-[#1F3A4D] transition-colors rounded px-1">Inicio</Link>
        <span>/</span>
        <button onClick={() => setStrActiveTopicId(arrHelpTopics[0].id)} className="hover:text-[#1F3A4D] rounded px-1">Guía de Ayuda</button>
        <span>/</span>
        <span className="text-[#2E2E2E] font-semibold">{objActiveTopic.breadcrumb}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="w-full md:w-1/3 lg:w-1/4 sticky top-24 flex flex-col gap-2 bg-[#E7E1D7] p-4 rounded-2xl border border-[#C4BAA8] shadow-sm">
          <h2 className="text-lg font-bold text-[#2E2E2E] mb-2 px-2">Temas de ayuda</h2>
          {arrHelpTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setStrActiveTopicId(topic.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                strActiveTopicId === topic.id ? "bg-[#1F3A4D] text-[#E7E1D7] shadow-md" : "text-[#2E2E2E] hover:bg-[#F4EFE6]"
              }`}
            >
              {topic.icon}
              {topic.title}
            </button>
          ))}
        </aside>

        <main key={strActiveTopicId} className="w-full md:w-2/3 lg:w-3/4 bg-[#E7E1D7] p-6 sm:p-8 rounded-2xl border border-[#C4BAA8] shadow-md animate-in fade-in duration-500">
          <h1 className="text-2xl sm:text-5xl font-bold text-[#1F3A4D] mb-6">{objActiveTopic.title}</h1>
          
          <div className="text-[#2E2E2E] text-lg space-y-6 mb-10 leading-relaxed">
            <p className="font-semibold text-[#C26E5A]">{activeContent.subtitle}</p>
            <p>{activeContent.description}</p>
            <div className="bg-[#F4EFE6] p-4 rounded-xl border border-[#C4BAA8]">
              <h3 className="font-bold mb-3 text-[#1F3A4D]">Pasos detallados:</h3>
              <ul className="list-decimal pl-5 space-y-2 text-md text-[#2E2E2E]">
                {activeContent.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-[#C4BAA8] pt-8">
            <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Referencia Visual</h3>
            
            <div 
              ref={objBannerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full aspect-[16/9] bg-[#D1C9BC] rounded-xl border border-[#C4BAA8] overflow-hidden group shadow-inner"
              {...touchHandlers}
            >
              <div 
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${intCurrentIndex * 100}%)` }}
              >
                {activeContent.images.map((url, idx) => (
                  <div key={`${strActiveTopicId}-${idx}`} className="min-w-full h-full flex items-center justify-center relative">
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      {/* ARREGLO 2: object-scale-down evita que las imágenes pequeñas se vean borrosas */}
                      <img 
                        src={url} 
                        alt={`Instrucción ${idx + 1}`} 
                        className="max-w-full max-h-full object-scale-down rounded-lg shadow-sm"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {bolShowControls && activeContent.images.length > 1 && (
                <>
                  <button onClick={goToPreviousImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={goToNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {activeContent.images.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => goToSelectedImage(idx)} 
                        className={`h-1.5 rounded-full transition-all ${intCurrentIndex === idx ? "bg-[#C26E5A] w-6" : "bg-white/50 w-2"}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-[10px] mt-4 text-center text-[#8b8276] uppercase tracking-widest font-medium">Interactive Guide • OiDevs</p>
          </div>
        </main>
      </div>
    </div>
  );
}