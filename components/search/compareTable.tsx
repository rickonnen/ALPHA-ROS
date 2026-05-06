import { ChevronLeft } from "lucide-react";
import { type Property } from "./propertyCard";

interface CompareTableProps {
  properties: Property[];
  selectedIds: number[];
  onBack: () => void;
}

export function CompareTable({ properties, selectedIds, onBack }: CompareTableProps) {
  // Filtramos solo las propiedades que el usuario seleccionó
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-y-auto pb-24 px-4 lg:px-8 mt-4 border">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#C26E5A] font-bold mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Volver a los listados</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr>
              <th className="p-6 border-b border-gray-200 text-slate-800 font-black text-sm uppercase w-48 bg-slate-50">
                Especificaciones
              </th>
              {selectedProperties.map(prop => (
                <th key={`header-${prop.id}`} className="p-6 border-b border-gray-200 align-top min-w-[250px] w-[280px]">
                  <img src={prop.images[0] || '/placeholder.jpg'} alt={prop.title} className="w-full h-40 object-cover rounded-lg mb-4 shadow-sm" />
                  <div className="text-xl font-black text-slate-800 mb-1">{prop.currencySymbol} {prop.price}</div>
                  <div className="text-xs font-bold text-[#C26E5A] uppercase leading-tight line-clamp-2">{prop.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Tipo</td>
              {selectedProperties.map(prop => (
                <td key={`type-${prop.id}`} className="p-6 text-gray-800 font-medium">{prop.type}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Superficie</td>
              {selectedProperties.map(prop => (
                <td key={`area-${prop.id}`} className="p-6 text-gray-800 font-medium">{prop.terrainArea} m²</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Habitaciones</td>
              {selectedProperties.map(prop => (
                <td key={`rooms-${prop.id}`} className="p-6 text-gray-800 font-medium">{prop.bedrooms}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Baños</td>
              {selectedProperties.map(prop => (
                <td key={`baths-${prop.id}`} className="p-6 text-gray-800 font-medium">{prop.bathrooms}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Ubicación</td>
              {selectedProperties.map(prop => (
                <td key={`loc-${prop.id}`} className="p-6 text-gray-500 text-xs leading-relaxed">{prop.location}</td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Acciones</td>
              {selectedProperties.map(prop => (
                <td key={`action-${prop.id}`} className="p-6">
                  <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded text-xs transition-colors shadow-sm">
                    CONTACTAR AGENTE
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}