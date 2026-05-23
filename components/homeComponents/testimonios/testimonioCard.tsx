// src/components/homeComponents/testimonios/TestimonioCard.tsx
import React from 'react';
import { Testimonio } from './data';

export const TestimonioCard: React.FC<{ data: Testimonio }> = ({ data }) => {
  return (
    <div className="bg-card-bg rounded-xl p-6 flex flex-col border border-card-border shadow-sm hover:border-primary hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-out h-full min-h-[16rem] select-none overflow-hidden">
      
      {/* shrink-0 evita que las estrellas se aplasten */}
      <div className="flex gap-1 mb-3 shrink-0" aria-label={`Calificación: ${data.estrellas} estrellas`}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < data.estrellas ? "text-warning" : "text-muted"}>
            ★
          </span>
        ))}
      </div>

      {/* flex-1 obliga al texto a ocupar SOLO el espacio sobrante. overflow-hidden corta cualquier exceso */}
      <div className="flex-1 overflow-hidden mb-4">
        {/* line-clamp-3 en móvil, line-clamp-5 en pantallas más grandes */}
        <p className="text-foreground text-sm italic leading-relaxed line-clamp-3 sm:line-clamp-5 text-ellipsis">
          "{data.comentario}"
        </p>
      </div>

      {/* shrink-0 protege la base: NUNCA permitirá que esta sección sea empujada fuera de la tarjeta */}
      <div className="border-t border-card-border pt-4 mt-auto shrink-0">
        <h4 className="font-bold text-primary text-sm mb-1 line-clamp-1">{data.nombre}</h4>
        <p className="text-[11px] font-black text-muted-foreground tracking-[0.15em] uppercase line-clamp-1">
          {data.ciudad}
        </p>
      </div>
      
    </div>
  );
};