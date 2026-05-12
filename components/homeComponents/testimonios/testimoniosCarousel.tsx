// src/components/homeComponents/testimonios/TestimoniosCarousel.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { testimoniosData, Testimonio } from './data';

const SQRT_5000 = Math.sqrt(5000);

// Extendemos tu interface original para añadir el tempId necesario para la animación
interface TestimonialWithTempId extends Testimonio {
  tempId: number;
}

interface TestimonialCardProps {
  position: number;
  testimonial: TestimonialWithTempId;
  handleMove: (steps: number) => void;
  cardSize: number;
  visibleCount: number; // Para controlar cuántos se ven por responsividad
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize,
  visibleCount
}) => {
  const isCenter = position === 0;
  const isVisible = Math.abs(position) <= visibleCount;

  const textoTruncado = testimonial.comentario.length > 120 
    ? testimonial.comentario.substring(0, 120).trim() + '...' 
    : testimonial.comentario;

  if (!isVisible) return null; 

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 transition-all duration-500 ease-in-out flex flex-col justify-between",
        isCenter 
          ? "z-20 bg-primary text-primary-foreground border-primary" 
          // AQUÍ SE QUITÓ LA TRANSPARENCIA: Eliminé opacity-80 y hover:opacity-100
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

      <div>
        <div className="mb-4">
          <span className={cn(
            "text-[10px] font-bold tracking-widest uppercase",
            isCenter ? "text-primary-foreground/70" : "text-secondary"
          )}>
            {testimonial.solucion}
          </span>
        </div>

        <p className={cn(
          "text-sm italic leading-relaxed",
          isCenter ? "text-primary-foreground" : "text-foreground"
        )}>
          "{textoTruncado}"
        </p>
      </div>

      <div className={cn(
        "border-t pt-4 mt-4",
        isCenter ? "border-primary-foreground/20" : "border-card-border"
      )}>
        
        <div className="flex gap-1 mb-2" aria-label={`Calificación: ${testimonial.estrellas} estrellas`}>
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < testimonial.estrellas ? "text-warning" : (isCenter ? "text-primary-foreground/30" : "text-muted")}>
              ★
            </span>
          ))}
        </div>

        <h4 className="font-bold text-base mb-1">{testimonial.nombre}</h4>
        <p className={cn(
          "text-[11px] font-black tracking-[0.15em] uppercase",
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
  const [visibleCount, setVisibleCount] = useState(2); // 2 por lado = 5 tarjetas total (Desktop)
  const [isPaused, setIsPaused] = useState(false);
  
  // Inicializamos la lista mapeando tus datos reales y añadiendo un tempId
  const [testimonialsList, setTestimonialsList] = useState<TestimonialWithTempId[]>(() => 
    testimoniosData.map((t, index) => ({ ...t, tempId: index }))
  );

  // REQUERIMIENTO: Ocultar si no hay testimonios
  if (!testimoniosData || testimoniosData.length === 0) {
    return null;
  }

  // Función de movimiento segura para intervalos
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

  // REQUERIMIENTO: Responsividad
  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 768) {
        setCardSize(280);
        setVisibleCount(0); // Móvil: Solo muestra 1 tarjeta (la central)
      } else if (window.innerWidth < 1024) {
        setCardSize(300);
        setVisibleCount(1); // Tablet: Muestra 3 tarjetas (centro + 1 por lado)
      } else {
        setCardSize(340);
        setVisibleCount(2); // Desktop: Muestra 5 tarjetas (centro + 2 por lado)
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // REQUERIMIENTO: Autoplay cada 5 segundos y Pausa
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleMove(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleMove]);

  // REQUERIMIENTO: Navegación Global por teclado
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA';
      if (isInputFocused) return;

      if (e.key === 'ArrowLeft') handleMove(-1);
      if (e.key === 'ArrowRight') handleMove(1);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleMove]);

  return (
    <section className="py-16 w-full">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* REQUERIMIENTO: Título de Sección */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Más que propiedades, historias reales</h2>
          <div className="h-1 w-20 bg-secondary rounded-full mx-auto"></div>
        </div>

        {/* Contenedor Interactivo */}
        <div
          className="relative w-full overflow-hidden bg-transparent outline-none focus:ring-4 focus:ring-primary/20 rounded-3xl"
          style={{ height: 500 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          tabIndex={0}
        >
          {testimonialsList.map((testimonial, index) => {
            // Calcula la posición relativa al centro del array
            const position = testimonialsList.length % 2
              ? index - (testimonialsList.length - 1) / 2
              : index - testimonialsList.length / 2;
            
            return (
              <TestimonialCard
                key={testimonial.tempId}
                testimonial={testimonial}
                handleMove={handleMove}
                position={position}
                cardSize={cardSize}
                visibleCount={visibleCount}
              />
            );
          })}

          {/* REQUERIMIENTO: Controles visuales (Botones Flotantes) */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4 z-30">
            <button
              onClick={(e) => { e.stopPropagation(); handleMove(-1); }}
              tabIndex={-1}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all shadow-md",
                "bg-card-bg text-primary border-2 border-card-border hover:bg-primary hover:text-primary-foreground hover:scale-110"
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
                "bg-card-bg text-primary border-2 border-card-border hover:bg-primary hover:text-primary-foreground hover:scale-110"
              )}
              aria-label="Siguiente testimonio"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}