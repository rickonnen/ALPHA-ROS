import { ChevronLeft, ChevronDown, ChevronUp, Check } from "lucide-react";
import { type Property } from "./propertyCard";
import { useState } from "react";

// Extendemos localmente tu Property para incluir las caracteristicas de la BD
interface CompareProperty extends Property {
  caracteristicas?: string[];
  features?: string[]; // Alias para evitar confusiones, si ya tienes "caracteristicas" en tu modelo, puedes eliminar esta línea
}

interface CompareTableProps {
  properties: Property[];
  selectedIds: number[];
  onBack: () => void;
}

export function CompareTable({ properties, selectedIds, onBack }: CompareTableProps) {
  
  // Filtramos solo las propiedades que el usuario seleccionó y usamos nuestra extensión
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id)) as CompareProperty[];
  
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  
  const handlePropertyClick = (id: number) => {
    // Redirigir a la página de detalles
    window.open(`/publicacion/Vista_del_Inmueble/${id}`, '_blank');
  };

  // Extraemos todas las características únicas de las propiedades seleccionadas
  const uniqueFeatures = Array.from(
    new Set(selectedProperties.flatMap(p => p.caracteristicas || []))
  ).sort();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-y-auto pb-24 px-4 lg:px-8 mt-4">
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
                  <div 
                    onClick={() => handlePropertyClick(prop.id)}
                    className="cursor-pointer group relative"
                    title="Ver detalles del inmueble"
                  >
                    <div className="overflow-hidden rounded-lg mb-4 shadow-sm border-2 border-transparent group-hover:border-[#C26E5A] transition-colors">
                      <img 
                        src={prop.images[0] || '/placeholder.jpg'} 
                        alt={prop.title} 
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    </div>
                    <div className="text-xl font-black text-slate-800 mb-1 group-hover:text-[#C26E5A] transition-colors">
                      {prop.currencySymbol} {prop.price.toLocaleString('es-BO')}
                    </div>
                    <div className="text-xs font-bold text-[#C26E5A] uppercase leading-tight line-clamp-2">
                      {prop.title}
                    </div>
                  </div>
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
                <td key={`area-${prop.id}`} className="p-6 text-gray-800 font-medium">{prop.terrainArea.toLocaleString('es-BO')} m²</td>
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

            {/* --- SECCIÓN DESPLEGABLE DE CARACTERÍSTICAS ADICIONALES --- */}
            {uniqueFeatures.length > 0 && (
              <>
                <tr 
                  className="border-b border-gray-100 bg-slate-100/50 cursor-pointer hover:bg-slate-200/50 transition-colors"
                  onClick={() => setShowFeatures(!showFeatures)}
                >
                  <td colSpan={selectedProperties.length + 1} className="p-4 select-none">
                    <div className="flex items-center justify-center gap-2 text-[#C26E5A]">
                      <span className="font-black uppercase tracking-widest text-xs">
                        Características Adicionales
                      </span>
                      {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </td>
                </tr>
                
                {showFeatures && uniqueFeatures.map(featureName => (
                  <tr key={featureName} className="border-b border-gray-100 hover:bg-gray-50/50 animate-in fade-in duration-300">
                    <td className="p-6 font-bold text-gray-500 bg-slate-50 capitalize">
                      {featureName}
                    </td>
                    {selectedProperties.map(prop => {
                      const hasFeature = prop.caracteristicas?.includes(featureName);
                      return (
                        <td key={`${featureName}-${prop.id}`} className="p-6 text-center">
                          {hasFeature ? (
                            <div className="flex justify-center">
                               <Check className="h-5 w-5 text-[#00c087]" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="flex justify-center">
                               <span className="text-gray-300 font-bold text-lg">-</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}

            <tr>
              <td className="p-6 font-bold text-gray-500 bg-slate-50">Acciones</td>
              {selectedProperties.map(prop => (
                <td key={`action-${prop.id}`} className="p-6">
                  <button 
                    onClick={() => handlePropertyClick(prop.id)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded text-xs transition-colors shadow-sm"
                  >
                    VER DETALLES
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