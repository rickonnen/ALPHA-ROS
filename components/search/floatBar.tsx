interface CompareFloatingBarProps {
  selectedCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareFloatingBar({ selectedCount, onClear, onCompare }: CompareFloatingBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-8 duration-300 w-[95%] sm:w-auto">
      <div className="bg-slate-900 rounded-xl shadow-2xl p-3 flex items-center justify-between sm:justify-start space-x-4 sm:space-x-6 border border-slate-700">
        
        <div className="flex items-center space-x-3 sm:space-x-4 pl-2">
          <div className="bg-[#C26E5A] w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-white shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-base sm:text-lg leading-none">{selectedCount}/4</span>
            <span className="text-slate-300 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-1">
              Propiedades<br/>seleccionadas
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-10 w-px bg-white/20"></div>

        <div className="flex items-center space-x-3 sm:space-x-4 pr-1">
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onCompare}
            disabled={selectedCount < 2}
            className={`${selectedCount >= 2 
                ? 'bg-[#00c087] hover:bg-[#00a876] text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'} 
                font-bold px-4 sm:px-6 py-2 sm:py-3 rounded text-xs sm:text-sm transition-all uppercase`}
          >
            Comparar {selectedCount < 2 && '(Min 2)'}
          </button>
        </div>
        
      </div>
    </div>
  );
}