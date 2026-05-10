"use client";

 
import Link from "next/link";
import React, { useState, useEffect } from "react";
import PublicarInmuebleGuide from "./PublicarInmuebleGuide";
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
interface HelpTopic {
  id: string;
  title: string;
  breadcrumb: string;
  icon: React.ReactNode;
}
 
interface HelpContentData {
  subtitle: string;
  description: string;
  proTip: string;
  steps: string[];
  images: string[];
}
 
// ─── Contenido de los temas ─
 
const helpContent: Record<string, HelpContentData> = {
  identificar: {
    subtitle: "Uso de filtros para localizar inmuebles de forma precisa.",
    description:
      "Segmenta las búsquedas mediante el panel lateral para optimizar la localización de propiedades según tus necesidades.",
    proTip:
      "Usa la búsqueda avanzada para filtrar detalles clave que suelen olvidarse, como si aceptan mascotas o si cuentan con garaje techado.",
    steps: [
      "Accede al buscador principal desde la página de inicio.",
      "Selecciona el tipo de operación: Venta, Alquiler o Anticrético.",
      "Filtra por categoría (Casa, Departamento, Terreno, etc.).",
      "En caso de no encontrar coincidencias, se mostrará un mensaje de 'Aún no existentes'.",
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777353220/identificar_1_zpmtd8.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777353075/ident_2_vztoww.png",
    ],
  },
  mapa: {
    subtitle: "Uso interactivo del mapa con delimitación de zonas.",
    description:
      "Aprende a buscar inmuebles dibujando tus propias limitaciones geográficas directamente sobre el mapa interactivo para encontrar coincidencias en zonas específicas.",
    proTip:
      "Haz un poco de zoom antes de empezar a dibujar tu polígono. Esto te permitirá tener mucha más precisión al marcar calles o avenidas específicas.",
    steps: [
      "Una vez dentro de la búsqueda por filtros, activa la herramienta de dibujo en el mapa.",
      "Realiza clics sucesivos sobre el mapa para formar un circuito cerrado que delimite tu zona de interés.",
      "Para reiniciar tu búsqueda o dibujar un área nueva, utiliza el botón 'Limpiar Mapa'.",
      "El mapa mostrará únicamente los pines de propiedades que coincidan con tus filtros dentro de la zona dibujada.",
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777354664/mapa_interactivo_ihvesp.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777354663/map_2_yptilo.png",
    ],
  },
  coincidencias: {
    subtitle: "Cálculo de precisión basado en presupuesto y técnica.",
    description:
      "El sistema prioriza los inmuebles que se ajustan a tu presupuesto y cumplen con tus requisitos técnicos (m², habitaciones, baños), calculando un porcentaje de éxito para cada opción.",
    proTip:
      "Si no logras un 100% de coincidencia, intenta ampliar tu rango de presupuesto máximo en un 5% o elimina un filtro no esencial; podrías descubrir excelentes oportunidades.",
    steps: [
      "Define tu presupuesto mediante el selector de moneda (USD/BS) y establece un rango de precio mínimo y máximo.",
      "Ajusta los parámetros técnicos en el panel 'Avanzado' para filtrar por dimensiones y servicios específicos.",
      "El algoritmo procesa ambos criterios para mostrarte primero las propiedades con mayor coincidencia presupuestaria y funcional.",
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777428124/apartasos_foqnav.png",
    ],
  },
  pagos: {
    subtitle: "Proceso de pago para contratación y publicación.",
    description: "Gestión de transacciones para adquirir planes premium o servicios especializados.",
    proTip:
      "Siempre toma una captura de pantalla extra de la transferencia exitosa antes de cerrar la aplicación de tu banco. Es tu mejor respaldo ante cualquier interrupción de internet.",
    steps: [
      "Selecciona el nivel de visibilidad deseado (Básico, Pro o Premium).",
      "Escanea el código QR generado para procesar la transacción bancaria.",
      "Carga la captura de pantalla del comprobante en el apartado de validación.",
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/1_aqinoq.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/2_hbod0h.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777257882/3_ex260f.png",
    ],
  },
  verificar: {
    subtitle: "Seguimiento administrativo para la activación de anuncios.",
    description:
      "Una vez que hayas subido el comprobante de pago, este entra en un proceso de revisión administrativa. Conoce cómo hacer seguimiento a su estado.",
    proTip:
      "Las verificaciones suelen ser mucho más rápidas en horario de oficina (9:00 AM - 6:00 PM). ¡Tenlo en cuenta si te urge publicar tu anuncio el mismo día!",
    steps: [
      "Tras enviar tu comprobante, presiona el botón 'Ir a mi perfil'.",
      "Dentro de tu perfil, selecciona el apartado 'Historial de pagos'.",
      "La transacción se mostrará inicialmente en estado 'Verificando pago'.",
      "Tras la validación, pasará a 'Pagos realizados' o 'Pagos rechazados'.",
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777355490/verificar_1_pfiykk.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777258770/1_n0rmsa.png",
    ],
  },
};
 
// ─── Temas de la barra lateral ─
 
const arrHelpTopics: HelpTopic[] = [
  {
    id: "identificar",
    title: "Identificación de propiedades",
    breadcrumb: "Identificar",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: "mapa",
    title: "Uso del Mapa Interactivo",
    breadcrumb: "Mapa",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: "coincidencias",
    title: "Sistema de Coincidencias",
    breadcrumb: "Coincidencias",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: "publicar",
    title: "Cómo publicar un inmueble",
    breadcrumb: "Publicar inmueble",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: "pagos",
    title: "Procedimiento de Pagos",
    breadcrumb: "Pagos",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a2 2 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: "verificar",
    title: "Verificación de Transacciones",
    breadcrumb: "Verificación",
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];
 
// ─── Componente principal ──
 
export default function HelpContentClient() {
  const [strActiveTopicId, setStrActiveTopicId] = useState<string>(arrHelpTopics[0].id);
  const [intCurrentIndex, setIntCurrentIndex] = useState(0);
  const [numTouchStartX, setNumTouchStartX] = useState<number | null>(null);
  const [bolMobileMenuOpen, setBolMobileMenuOpen] = useState(false);
 
  const objActiveTopic =
    arrHelpTopics.find((t) => t.id === strActiveTopicId) || arrHelpTopics[0];
  const activeContent = helpContent[strActiveTopicId] || helpContent["identificar"];
  const intTotalImages = activeContent?.images?.length ?? 0;
  const bolIsPublicar = strActiveTopicId === "publicar";
 
  const goToSelectedImage = (intIndex: number) => setIntCurrentIndex(intIndex);
  const goToNextImage = () => setIntCurrentIndex((p) => (p + 1) % intTotalImages);
  const goToPreviousImage = () => setIntCurrentIndex((p) => (p - 1 + intTotalImages) % intTotalImages);
 
  // Seleccionar topic y cerrar menú mobile
  const handleTopicSelect = (id: string) => {
    setStrActiveTopicId(id);
    setBolMobileMenuOpen(false);
    setIntCurrentIndex(0);
  };
 
  useEffect(() => {
    setIntCurrentIndex(0);
  }, [strActiveTopicId]);
 
  useEffect(() => {
    if (bolIsPublicar || intTotalImages <= 1) return;
    const id = window.setInterval(goToNextImage, 6000);
    return () => window.clearInterval(id);
  }, [intTotalImages, strActiveTopicId, bolIsPublicar]);
 
  useEffect(() => {
    if (bolIsPublicar) return;
    activeContent?.images?.forEach((strUrl) => {
      const objImg = new window.Image();
      objImg.src = strUrl;
    });
  }, [activeContent, bolIsPublicar]);
 
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) =>
    setNumTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (numTouchStartX === null) return;
    const diff = numTouchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goToNextImage() : goToPreviousImage();
    setNumTouchStartX(null);
  };
 
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
 
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setBolMobileMenuOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#E7E1D7] border border-[#C4BAA8] text-sm font-medium text-[#1F3A4D]"
        >
          <div className="flex items-center gap-2">
            {objActiveTopic.icon}
            <span>{objActiveTopic.title}</span>
          </div>
          <svg
            className={`w-4 h-4 text-[#8b8276] transition-transform duration-200 ${bolMobileMenuOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
 
        
        {bolMobileMenuOpen && (
          <div className="mt-1 rounded-xl border border-[#C4BAA8] bg-[#E7E1D7] overflow-hidden shadow-lg">
            {arrHelpTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b last:border-0 border-[#C4BAA8]/50 ${
                  strActiveTopicId === topic.id
                    ? "bg-[#1F3A4D] text-white"
                    : "text-[#2E2E2E] hover:bg-[#F4EFE6]"
                }`}
              >
                {topic.icon}
                <span className="font-medium">{topic.title}</span>
                {strActiveTopicId === topic.id && (
                  <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
 
      
      <div className="flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
 
        <aside className="hidden md:flex w-full md:w-56 lg:w-64 md:sticky md:top-24 flex-col bg-[#E7E1D7] p-3 sm:p-4 rounded-2xl border border-[#C4BAA8] shadow-sm h-fit z-10 shrink-0">
          <h2 className="mb-3 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8b8276]">
            Temas de ayuda
          </h2>
          <div className="flex flex-col gap-1.5">
            {arrHelpTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic.id)}
                className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-left text-sm font-medium transition-all duration-200 border ${
                  strActiveTopicId === topic.id
                    ? "bg-[#1F3A4D] text-[#E7E1D7] border-[#1F3A4D] shadow-md"
                    : "bg-transparent text-[#2E2E2E] border-transparent hover:bg-[#F4EFE6] hover:border-[#C4BAA8]"
                }`}
              >
                {topic.icon}
                <span className="leading-snug">{topic.title}</span>
              </button>
            ))}
          </div>
        </aside>
 
        {/* Área de contenido */}
        <main
          key={strActiveTopicId}
          className="w-full md:flex-1 bg-[#E7E1D7] p-4 sm:p-6 lg:p-10 rounded-2xl border border-[#C4BAA8] shadow-sm animate-in fade-in duration-500 min-w-0"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs text-[#8b8276] mb-4">
            <Link href="/" className="hover:text-[#1F3A4D] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <button
              type="button"
              onClick={() => handleTopicSelect(arrHelpTopics[0].id)}
              className="hover:text-[#1F3A4D] transition-colors"
            >
              Guía de Ayuda
            </button>
            <span>/</span>
            <span className="text-[#2E2E2E] font-semibold">{objActiveTopic.breadcrumb}</span>
          </nav>
 
          {/* Contenido según topic */}
          {bolIsPublicar ? (
            <PublicarInmuebleGuide />
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#1F3A4D] mb-4 sm:mb-6 leading-tight">
                {objActiveTopic.title}
              </h1>
 
              <div className="text-[#2E2E2E] text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                <p className="font-semibold text-[#C26E5A] mb-2 sm:mb-3">{activeContent.subtitle}</p>
                <p className="mb-6 sm:mb-10 opacity-90">{activeContent.description}</p>
 
                {/* Grid de pasos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {activeContent.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 sm:gap-3 bg-[#F4EFE6] p-4 sm:p-5 rounded-xl border border-[#C4BAA8] transition-all duration-200 hover:border-[#C26E5A]/50"
                    >
                      <span className="text-[10px] font-bold text-[#8b8276] uppercase tracking-widest">
                        Paso 0{index + 1}
                      </span>
                      <p className="text-[13px] sm:text-[14px] lg:text-[15px] font-semibold text-[#2E2E2E] leading-snug">
                        {step}
                      </p>
                      <div className="h-[2px] w-6 bg-[#C26E5A] mt-auto" />
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Galería */}
              <div className="mt-6 sm:mt-8 border-t border-[#C4BAA8] pt-6 sm:pt-8">
                <h3 className="text-[10px] font-bold text-[#8b8276] mb-3 sm:mb-4 uppercase tracking-[3px] text-center">
                  Referencia Visual
                </h3>
                <div
                  className="relative w-full aspect-video bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] overflow-hidden group"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${intCurrentIndex * 100}%)` }}
                  >
                    {activeContent.images.map((strUrl, idx) => (
                      <div
                        key={`${strActiveTopicId}-${idx}`}
                        className="min-w-full h-full flex items-center justify-center p-3 sm:p-4 lg:p-6"
                      >
                        <img
                          src={strUrl}
                          alt={`Referencia ${idx + 1}`}
                          className="max-w-full max-h-full object-contain rounded-lg"
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    ))}
                  </div>
 
                  {intTotalImages > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-[#1F3A4D] text-[#E7E1D7] p-1.5 sm:p-2 rounded-full opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 shadow-md"
                        aria-label="Imagen anterior"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-[#1F3A4D] text-[#E7E1D7] p-1.5 sm:p-2 rounded-full opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 shadow-md"
                        aria-label="Imagen siguiente"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                        {activeContent.images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => goToSelectedImage(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              intCurrentIndex === idx ? "bg-[#C26E5A] w-6" : "bg-[#C4BAA8] w-2"
                            }`}
                            aria-label={`Ir a imagen ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
 
                {/* Tip Pro */}
                {activeContent.proTip && (
                  <div className="mt-6 sm:mt-8 lg:mt-10 bg-[#C26E5A] text-[#E7E1D7] p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-[12px] sm:text-[13px] lg:text-[14px] uppercase tracking-widest text-[#E7E1D7]/90">
                        Tip Pro
                      </h4>
                      <p className="text-[13px] sm:text-[14px] lg:text-[15px] leading-relaxed font-medium">
                        {activeContent.proTip}
                      </p>
                    </div>
                  </div>
                )}
 
                <p className="text-[10px] mt-5 sm:mt-6 lg:mt-8 text-center text-[#8b8276] uppercase tracking-widest">
                  Interactive Guide • OiDevs
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}