/** * Dev: Marcela C.
 * Date: 24/03/2026
 * Funcionalidad: Image grid and YouTube video logic (Task 4.4, 4.5, 4.11).
 */
import React from 'react';

export const MediaGallery = ({ arrImages, strVideoUrl }: { arrImages: string[], strVideoUrl?: string }) => {
  const strFallback = "/company-placeholder.png"; // Tarea 4.11

  return (
    <div className="space-y-8">
      {/* Tarea 4.4: Grilla responsiva */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[450px]">
        <div className="md:col-span-2 h-[300px] md:h-full bg-[#E7E1D7] rounded-2xl overflow-hidden relative group">
          <img 
            src={arrImages[0] || strFallback} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt="Main view" 
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden">
            <img src={arrImages[1] || strFallback} className="w-full h-full object-cover" alt="Secondary" />
          </div>
          <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden">
            <img src={arrImages[2] || strFallback} className="w-full h-full object-cover" alt="Secondary" />
          </div>
        </div>
      </div>
      
      {/* Tarea 4.5: Video condicional */}
      {strVideoUrl && (
        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white/20">
          <iframe 
            className="w-full h-full" 
            src={`https://www.youtube.com/embed/${strVideoUrl.split('v=')[1] || ""}`} 
            allowFullScreen 
          />
        </div>
      )}
    </div>
  );
};