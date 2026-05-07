import { ArrowRightLeft } from "lucide-react";

interface CompareFloatingBarProps {
  selectedCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareFloatingBar({ selectedCount, onClear, onCompare }: CompareFloatingBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-8 duration-300 w-max max-w-[95%]">
      <div className="bg-[#1b2b48] rounded-[20px] shadow-2xl p-2.5 sm:p-3 flex items-center justify-between space-x-4 sm:space-x-6 border border-white/5">

        {/* --- Bloque Izquierdo: Icono y Textos --- */}
        <div className="flex items-center space-x-3 sm:space-x-4 pl-1">
          {/* Icono Naranja/Coral */}
          <div className="bg-[#cc7a66] w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
            <ArrowRightLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="text-white font-bold text-lg sm:text-xl leading-tight">
              {selectedCount} {selectedCount === 1 ? 'Propiedad' : 'Propiedades'}
            </span>
            <span className="text-[#8ba3c7] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase leading-tight mt-0.5">
              Seleccionadas<br/>para comparar
            </span>
          </div>
        </div>

        {/* --- Divisor vertical --- */}
        <div className="h-12 w-px bg-[#314365] hidden sm:block"></div>

        {/* --- Bloque Derecho: Acciones --- */}
        <div className="flex items-center space-x-3 sm:space-x-5 pr-1">
          
          <button 
            onClick={onClear}
            className="text-[#8ba3c7] hover:text-white text-xs sm:text-sm font-semibold transition-colors text-center leading-tight"
          >
            Borrar<br className="hidden sm:block"/> 
            <span className="sm:hidden"> todo</span>
            <span className="hidden sm:inline">todo</span>
          </button>

          <button 
            onClick={onCompare}
            disabled={selectedCount < 2}
            className={`
              ${selectedCount >= 2 
                ? 'bg-[#00cf87] hover:bg-[#00ba79] text-white shadow-lg shadow-[#00cf87]/25' 
                : 'bg-[#314365] text-[#8ba3c7] cursor-not-allowed'
              } 
              font-black px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all uppercase text-center leading-tight tracking-wide
            `}
          >
            Comparar<br className="hidden sm:block"/> ahora
          </button>
        </div>
        
      </div>
    </div>
  );
}