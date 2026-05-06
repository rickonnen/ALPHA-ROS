import { X } from "lucide-react";

interface Props {
  url: string | null;
  onClose: () => void;
}

export const PrevisualizacionFoto = ({ url, onClose }: Props) => {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-white rounded-xl p-2 shadow-2xl flex flex-col max-h-[90vh]">
        <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 z-[120] bg-white/90 hover:bg-red-50 text-gray-800 p-2 rounded-full transition-all shadow-lg cursor-pointer"
        >
            <X size={24} />
        </button>
        <div className="overflow-y-auto p-2 flex-grow">
          <img src={url} alt="Comprobante" className="w-full h-auto object-contain rounded-lg" />
        </div>
        <div className="p-4 text-center border-t border-gray-100 bg-white rounded-b-xl">
          <p className="text-[#1D3547] font-bold text-lg">Comprobante seleccionado</p>
          <p className="text-muted-foreground text-sm">Verifica que los datos del pago sean legibles</p>
        </div>
      </div>
    </div>
  );
};