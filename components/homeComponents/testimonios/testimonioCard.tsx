// src/components/homeComponents/testimonios/TestimonioCard.tsx
import React from 'react';
import { Testimonio } from './data';

export const TestimonioCard: React.FC<{ data: Testimonio }> = ({ data }) => {
  const textoTruncado = data.comentario.length > 120 
    ? data.comentario.substring(0, 120).trim() + '...' 
    : data.comentario;

  return (
    <div className="bg-card-bg rounded-xl p-6 flex flex-col justify-between border border-card-border shadow-sm hover:border-primary hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-out h-64 select-none">
      
      <div>
        <div className="flex gap-1 mb-3" aria-label={`Calificación: ${data.estrellas} estrellas`}>
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < data.estrellas ? "text-warning" : "text-muted"}>
              ★
            </span>
          ))}
        </div>

        <p className="text-foreground text-sm italic leading-relaxed mb-4">
          "{textoTruncado}"
        </p>
      </div>

      <div className="border-t border-card-border pt-4 mt-auto">
        <h4 className="font-bold text-primary text-sm mb-1">{data.nombre}</h4>
        <p className="text-[11px] font-black text-muted-foreground tracking-[0.15em] uppercase">
          {data.ciudad}
        </p>
      </div>
      
    </div>
  );
};