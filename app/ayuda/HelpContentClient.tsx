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
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777353220/identificar_1_zpmtd8.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777353075/ident_2_vztoww.png",
    ]
  },
  mapa: {
    subtitle: "Uso interactivo del mapa con delimitación de zonas.",
    description: "Aprende a buscar inmuebles dibujando tus propias limitaciones geográficas directamente sobre el mapa interactivo para encontrar coincidencias en zonas específicas.",
    steps: [
      "Una vez dentro de la búsqueda por filtros, activa la herramienta de dibujo en el mapa.",
      "Realiza clics sucesivos sobre el mapa para formar un circuito cerrado que delimite tu zona de interés.",
      "Para reiniciar tu búsqueda o dibujar un área nueva, utiliza el botón 'Limpiar Mapa'.",
      "El mapa mostrará únicamente los pines de propiedades que coincidan con tus filtros dentro de la zona dibujada."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777354664/mapa_interactivo_ihvesp.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777354663/map_2_yptilo.png"
    ]
  },
  coincidencias: {
    subtitle: "Cálculo de precisión basado en presupuesto y técnica.",
    description: "El sistema prioriza los inmuebles que se ajustan a tu presupuesto y cumplen con tus requisitos técnicos (m², habitaciones, baños), calculando un porcentaje de éxito para cada opción.",
    steps: [
      "Define tu presupuesto mediante el selector de moneda (USD/BS) y establece un rango de precio mínimo y máximo.",
      "Ajusta los parámetros técnicos en el panel 'Avanzado' para filtrar por dimensiones y servicios específicos.",
      "El algoritmo procesa ambos criterios para mostrarte primero las propiedades con mayor coincidencia presupuestaria y funcional."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777428124/apartasos_foqnav.png"
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
    subtitle: "Seguimiento administrativo para la activación de anuncios.",
    description: "Una vez que hayas subido el comprobante de pago, este entra en un proceso de revisión administrativa. Conoce cómo hacer seguimiento a su estado.",
    steps: [
      "Tras enviar tu comprobante, presiona el botón 'Ir a mi perfil'.",
      "Dentro de tu perfil, selecciona el apartado 'Historial de pagos'.",
      "La transacción se mostrará inicialmente en estado 'Verificando pago'.",
      "Tras la validación, pasará a 'Pagos realizados' o 'Pagos rechazados'."
    ],
    images: [
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777355490/verificar_1_pfiykk.png",
      "https://res.cloudinary.com/dqwhie1pw/image/upload/v1777258770/1_n0rmsa.png"
    ]
  }
};

const arrHelpTopics: HelpTopic[] = [
  { id: "identificar", title: "Identificación de propiedades", breadcrumb: "Identificar", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { id: "mapa", title: "Uso del Mapa Interactivo", breadcrumb: "Mapa", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { id: "coincidencias", title: "Sistema de Coincidencias", breadcrumb: "Coincidencias", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { id: "pagos", title: "Procedimiento de Pagos", breadcrumb: "Pagos", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { id: "verificar", title: "Verificación de Transacciones", breadcrumb: "Verificación", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
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


  useEffect(() => {
    if (goToSelectedImage) goToSelectedImage(0);
  }, [strActiveTopicId]);

  // Pre-carga de imágenes mantenida
  useEffect(() => {
    activeContent.images.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [activeContent]);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs con colores corregidos (Usa tus variables de globals.css) */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span>/</span>
        <button 
          onClick={() => setStrActiveTopicId(arrHelpTopics[0].id)} 
          className="hover:text-primary transition-colors"
        >
          Guía de Ayuda
        </button>
        <span>/</span>
        <span className="text-foreground font-semibold">{objActiveTopic.breadcrumb}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar con tu color secundario-fund */}
        <aside className="w-full md:w-1/3 lg:w-1/4 sticky top-24 flex flex-col gap-2 bg-secondary-fund p-4 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-2 px-2 text-[11px] uppercase tracking-widest opacity-60">Temas de ayuda</h2>
          {arrHelpTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setStrActiveTopicId(topic.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                strActiveTopicId === topic.id ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-background"
              }`}
            >
              {topic.icon}
              {topic.title}
            </button>
          ))}
        </aside>

        {/* Main Content con el nuevo diseño de pasos en columnas */}
        <main key={strActiveTopicId} className="w-full md:w-2/3 lg:w-3/4 bg-secondary-fund p-6 sm:p-10 rounded-2xl border border-border shadow-md animate-in fade-in duration-500">
          <h1 className="text-3xl sm:text-5xl font-bold text-primary mb-6">{objActiveTopic.title}</h1>
          
          <div className="text-foreground text-lg mb-12 leading-relaxed">
            <p className="font-semibold text-secondary mb-3">{activeContent.subtitle}</p>
            <p className="mb-10 opacity-90">{activeContent.description}</p>
            
            {/* NUEVA ESTRUCTURA: Pasos en columnas estilo Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContent.steps.map((step, index) => (
                <div key={index} className="flex flex-col gap-3 bg-background/50 p-5 rounded-xl border border-border/50 transition-hover hover:border-secondary/40 group">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-secondary transition-colors">
                    Paso 0{index + 1}
                  </span>
                  <p className="text-[15px] font-semibold text-foreground leading-snug">
                    {step}
                  </p>
                  <div className="h-[2px] w-6 bg-secondary mt-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Carrusel e imágenes intactos */}
          <div className="mt-8 border-t border-border pt-8">
            <h3 className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-[3px] text-center">Referencia Visual</h3>
            
            <div 
              ref={objBannerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full aspect-video bg-background rounded-xl border border-border overflow-hidden group shadow-inner"
              {...touchHandlers}
            >
              <div 
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${intCurrentIndex * 100}%)` }}
              >
                {activeContent.images.map((url, idx) => (
                  <div key={`${strActiveTopicId}-${idx}`} className="min-w-full h-full flex items-center justify-center p-6">
                    <img 
                      src={url} 
                      alt={`Referencia ${idx + 1}`} 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {bolShowControls && activeContent.images.length > 1 && (
                <>
                  <button onClick={goToPreviousImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary/90 text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={goToNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/90 text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  
                  {/* Indicadores de bolitas */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {activeContent.images.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => goToSelectedImage(idx)} 
                        className={`h-1.5 rounded-full transition-all ${intCurrentIndex === idx ? "bg-secondary w-6" : "bg-white/50 w-1.5"}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-[10px] mt-4 text-center text-muted-foreground uppercase tracking-widest">Interactive Guide • OiDevs</p>
          </div>
        </main>
      </div>
    </div>
  );
}