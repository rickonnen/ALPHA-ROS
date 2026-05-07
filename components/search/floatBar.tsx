import { ArrowRightLeft } from "lucide-react";

interface CompareFloatingBarProps {
  selectedCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareFloatingBar({ selectedCount, onClear, onCompare }: CompareFloatingBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-8 duration-300 w-[92%] sm:w-max max-w-[600px]">
      <div className="bg-[#1b2b48] rounded-2xl sm:rounded-[20px] shadow-2xl p-2.5 sm:p-3 flex items-center justify-between sm:space-x-6 border border-white/5">

        {/* --- Bloque Izquierdo: Icono y Textos --- */}
        <div className="flex items-center space-x-2.5 sm:space-x-4 pl-1">
          {/* Icono Naranja/Coral */}
          <div className="bg-[#cc7a66] w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
            <ArrowRightLeft className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2} />
          </div>
          
          <div className="flex flex-col justify-center">
            {/* Título: Abreviado en pantallas extremadamente pequeñas (<360px) */}
            <span className="text-white font-bold text-[13px] sm:text-xl leading-tight whitespace-nowrap">
              {selectedCount} <span className="hidden min-[360px]:inline">{selectedCount === 1 ? 'Propiedad' : 'Propiedades'}</span>
              <span className="min-[360px]:hidden">Prop.</span>
            </span>
            {/* Subtítulo: 2 líneas en PC, 1 línea en Móvil */}
            <span className="text-[#8ba3c7] text-[10px] font-bold tracking-widest uppercase leading-tight mt-0.5 hidden sm:block">
              Seleccionadas<br/>para comparar
            </span>
            <span className="text-[#8ba3c7] text-[9px] font-bold tracking-widest uppercase leading-tight mt-0.5 sm:hidden">
              Seleccionadas
            </span>
          </div>
        </div>

        {/* --- Divisor vertical (Solo visible en PC) --- */}
        <div className="hidden sm:block h-12 w-px bg-[#314365] shrink-0"></div>

        {/* --- Bloque Derecho: Acciones --- */}
        <div className="flex items-center space-x-2.5 sm:space-x-5 pr-1 shrink-0">
          
          {/* Botón Borrar: 1 línea en móvil, 2 líneas en PC */}
          <button 
            onClick={onClear}
            className="text-[#8ba3c7] hover:text-white text-[11px] sm:text-sm font-semibold transition-colors text-center leading-tight whitespace-nowrap"
          >
            Borrar<br className="hidden sm:block"/> 
            <span className="sm:hidden"> todo</span>
            <span className="hidden sm:inline">todo</span>
          </button>

          {/* Botón Comparar: Resumido a 'Comparar' en Móvil */}
          <button 
            onClick={onCompare}
            disabled={selectedCount < 2}
            className={`
              ${selectedCount >= 2 
                ? 'bg-[#00cf87] hover:bg-[#00ba79] text-white shadow-lg shadow-[#00cf87]/25' 
                : 'bg-[#314365] text-[#8ba3c7] cursor-not-allowed'
              } 
              font-black px-3.5 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm transition-all uppercase text-center leading-tight tracking-wide whitespace-nowrap
            `}
          >
            <span className="sm:hidden">Comparar</span>
            <span className="hidden sm:inline">Comparar<br/> ahora</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}