// src/components/homeComponents/testimonios/TestimoniosCarousel.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { testimoniosData, Testimonio } from './data';

const SQRT_5000 = Math.sqrt(5000);

interface TestimonialWithTempId extends Testimonio {
  tempId: number;
}

interface TestimonialCardProps {
  position: number;
  testimonial: TestimonialWithTempId;
  handleMove: (steps: number) => void;
  onOpenModal: (testimonial: TestimonialWithTempId) => void;
  cardSize: number;
  visibleCount: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove,
  onOpenModal,
  cardSize,
  visibleCount
}) => {
  const isCenter = position === 0;
  const isVisible = Math.abs(position) <= visibleCount;

  if (!isVisible) return null; 

  return (
    <div
      // Si está en el centro, abre el modal. Si no, lo mueve al centro.
      onClick={() => isCenter ? onOpenModal(testimonial) : handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-4 sm:p-6 transition-all duration-500 ease-in-out flex flex-col group",
        isCenter 
          ? "z-20 bg-primary text-primary-foreground border-primary" 
          : "z-10 bg-card-bg text-foreground border-card-border hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -30 : position % 2 ? 20 : -20}px)
          rotate(${isCenter ? 0 : position % 2 ? 3 : -3}deg)
        `,
        boxShadow: isCenter ? "0px 12px 0px 4px var(--card-border)" : "0px 0px 0px 0px transparent"
      }}
      aria-hidden={!isCenter}
    >
      <span
        className={cn(
          "absolute block origin-top-right rotate-45",
          isCenter ? "bg-primary-foreground/30" : "bg-card-border"
        )}
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />

      {/* SECCIÓN SUPERIOR */}
      <div className="mb-2 sm:mb-3 shrink-0">
        <span className={cn(
          "text-[10px] font-bold tracking-widest uppercase",
          isCenter ? "text-primary-foreground/70" : "text-secondary"
        )}>
          {testimonial.solucion}
        </span>
      </div>

      {/* SECCIÓN MEDIA: Más espacio para texto (line-clamp-4 o 5) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <p className={cn(
          "text-[13px] sm:text-sm italic leading-relaxed text-ellipsis",
          "line-clamp-4 sm:line-clamp-5", 
          isCenter ? "text-primary-foreground" : "text-foreground"
        )}>
          "{testimonial.comentario}"
        </p>
        
        {/* Indicador visual sutil para leer más */}
        {isCenter && (
          <span className="text-[10px] font-semibold mt-1 opacity-70 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Leer completo ↗
          </span>
        )}
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className={cn(
        "border-t pt-2 sm:pt-3 mt-2 sm:mt-3 shrink-0",
        isCenter ? "border-primary-foreground/20" : "border-card-border"
      )}>
        
        <div className="flex gap-1 mb-1 sm:mb-2" aria-label={`Calificación: ${testimonial.estrellas} estrellas`}>
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < testimonial.estrellas ? "text-warning" : (isCenter ? "text-primary-foreground/30" : "text-muted")}>
              ★
            </span>
          ))}
        </div>

        <h4 className="font-bold text-sm sm:text-base mb-0.5 truncate">{testimonial.nombre}</h4>
        <p className={cn(
          "text-[9px] sm:text-[11px] font-black tracking-[0.15em] uppercase truncate",
          isCenter ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {testimonial.ciudad}
        </p>
      </div>
    </div>
  );
};

export default function TestimoniosCarousel() {
  const [cardSize, setCardSize] = useState(340);
  const [visibleCount, setVisibleCount] = useState(2); 
  const [isPaused, setIsPaused] = useState(false);
  // Estado para controlar qué testimonio está abierto en el modal
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialWithTempId | null>(null);
  
  const [testimonialsList, setTestimonialsList] = useState<TestimonialWithTempId[]>(() => 
    testimoniosData.map((t, index) => ({ ...t, tempId: index }))
  );

  if (!testimoniosData || testimoniosData.length === 0) return null;

  const handleMove = useCallback((steps: number) => {
    setTestimonialsList(prevList => {
      const newList = [...prevList];
      if (steps > 0) {
        for (let i = steps; i > 0; i--) {
          const item = newList.shift();
          if (item) newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i++) {
          const item = newList.pop();
          if (item) newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 768) {
        setCardSize(280);
        setVisibleCount(0);
      } else if (window.innerWidth < 1024) {
        setCardSize(300);
        setVisibleCount(1);
      } else {
        setCardSize(340);
        setVisibleCount(2);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    // Si el modal está abierto, pausamos el carrusel automáticamente
    if (isPaused || selectedTestimonial) return;
    const interval = setInterval(() => {
      handleMove(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleMove, selectedTestimonial]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (selectedTestimonial && e.key === 'Escape') {
        setSelectedTestimonial(null);
        return;
      }
      
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA';
      if (isInputFocused || selectedTestimonial) return;

      if (e.key === 'ArrowLeft') handleMove(-1);
      if (e.key === 'ArrowRight') handleMove(1);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleMove, selectedTestimonial]);

  return (
    <>
      <section className="py-8 w-full">
        <div className="container mx-auto px-4 max-w-[1400px]">
          
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Más que propiedades, historias reales</h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto"></div>
          </div>

          <div
            className="relative w-full overflow-hidden bg-transparent outline-none focus:ring-4 focus:ring-primary/20 rounded-3xl"
            style={{ height: 380 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            tabIndex={0}
          >
            {testimonialsList.map((testimonial, index) => {
              const position = testimonialsList.length % 2
                ? index - (testimonialsList.length - 1) / 2
                : index - testimonialsList.length / 2;
              
              return (
                <TestimonialCard
                  key={testimonial.tempId}
                  testimonial={testimonial}
                  handleMove={handleMove}
                  onOpenModal={setSelectedTestimonial}
                  position={position}
                  cardSize={cardSize}
                  visibleCount={visibleCount}
                />
              );
            })}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={(e) => { e.stopPropagation(); handleMove(-1); }}
              tabIndex={-1}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all shadow-md",
                "bg-card-bg text-foreground border-2 border-card-border hover:bg-primary hover:text-primary-foreground hover:scale-110"
              )}
              aria-label="Testimonio anterior"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleMove(1); }}
              tabIndex={-1}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all shadow-md",
                "bg-card-bg text-foreground border-2 border-card-border hover:bg-primary hover:text-primary-foreground hover:scale-110"
              )}
              aria-label="Siguiente testimonio"
            >
              <ChevronRight />
            </button>
          </div>

        </div>
      </section>

      {/* MODAL PARA LEER EL TESTIMONIO COMPLETO */}
      {selectedTestimonial && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-all animate-in fade-in duration-200"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div 
            className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Evita que el click dentro cierre el modal
          >
            <button 
              onClick={() => setSelectedTestimonial(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            <span className="text-[10px] font-bold tracking-widest uppercase text-secondary block mb-4">
              {selectedTestimonial.solucion}
            </span>

            <p className="text-foreground text-base md:text-lg italic leading-relaxed mb-6">
              "{selectedTestimonial.comentario}"
            </p>

            <div className="border-t border-card-border pt-4">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < selectedTestimonial.estrellas ? "text-warning" : "text-muted"}>
                    ★
                  </span>
                ))}
              </div>
              <h4 className="font-bold text-lg mb-1 text-primary">{selectedTestimonial.nombre}</h4>
              <p className="text-[11px] font-black text-muted-foreground tracking-[0.15em] uppercase">
                {selectedTestimonial.ciudad}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}