import { ChevronLeft, ChevronDown, ChevronUp, Check, MessageCircle } from "lucide-react";
import { type Property } from "./propertyCard";
import { useState } from "react";
import { useDollarRate } from '@/components/hooks/getDollarRate';

// Extendemos localmente tu Property para incluir las caracteristicas de la BD
interface CompareProperty extends Property {
  caracteristicas?: string[];
  features?: string[]; 
}

interface CompareTableProps {
  properties: Property[];
  selectedIds: number[];
  selectedCurrency: 'USD' | 'BS';
  onBack: () => void;
}

export function CompareTable({ properties, selectedIds, selectedCurrency, onBack }: CompareTableProps) {
  const { compra } = useDollarRate();
  const exchangeRate = compra ?? 6.96;

  // Filtramos solo las propiedades seleccionadas
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id)) as CompareProperty[];
  
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  
  const handlePropertyClick = (id: number) => {
    window.open(`/publicacion/Vista_del_Inmueble/${id}`, '_blank');
  };

  const handleContact = (phone: string, title: string) => {
    if (!phone) return;
    const message = `Hola, estoy interesado en la propiedad: ${title}`;
    const cleanPhone = phone.replace(/\D/g, ''); // Quitamos espacios o caracteres raros
    window.open(`https://wa.me/591${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getConvertedPrice = (price: number) => {
    const converted = selectedCurrency === 'USD' ? price : Math.round(price * exchangeRate * 100) / 100;
    const symbol = selectedCurrency === 'USD' ? '$us' : 'Bs';
    return `${symbol} ${converted.toLocaleString('es-BO')}`;
  };

  // Identificar los mejores/peores valores para destacarlos (Req 20)
  const prices = selectedProperties.map(p => p.price);
  const minPrice = Math.min(...prices.filter(p => p > 0));

  const areas = selectedProperties.map(p => p.terrainArea || 0);
  const maxArea = Math.max(...areas);

  const beds = selectedProperties.map(p => p.bedrooms || 0);
  const maxBeds = Math.max(...beds);

  const baths = selectedProperties.map(p => p.bathrooms || 0);
  const maxBaths = Math.max(...baths);

  // Extraemos características únicas para el acordeón (filtros avanzados)
  const uniqueFeatures = Array.from(
    new Set(selectedProperties.flatMap(p => p.caracteristicas || p.features || []))
  ).sort();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-y-auto pb-24 px-4 lg:px-8 mt-4 relative">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#C26E5A] font-bold mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Volver a los listados</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto max-h-[75vh]">
        <table className="w-full min-w-[800px] text-left border-collapse relative">
          <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-gray-200">
            <tr>
              <th className="p-6 text-slate-800 font-black text-sm uppercase w-48 bg-slate-50 border-r border-gray-200">
                Especificaciones
              </th>
              {selectedProperties.map(prop => (
                <th key={`header-${prop.id}`} className="p-6 bg-white border-r border-gray-200 align-top min-w-[250px] w-[280px]">
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
                    {/* Resaltamos el precio más bajo en color verde */}
                    <div className={`text-xl font-black mb-1 transition-colors ${prop.price === minPrice && minPrice > 0 ? 'text-[#00c087]' : 'text-slate-800 group-hover:text-[#C26E5A]'}`}>
                      {getConvertedPrice(prop.price)}
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
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Tipo de Operación</td>
              {selectedProperties.map(prop => (
                <td key={`type-${prop.id}`} className="p-6 text-gray-800 font-medium border-r border-gray-100">{prop.type}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Superficie Terreno</td>
              {selectedProperties.map(prop => (
                <td key={`area-${prop.id}`} className={`p-6 border-r border-gray-100 ${prop.terrainArea === maxArea && maxArea > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.terrainArea ? `${prop.terrainArea.toLocaleString('es-BO')} m²` : '—'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Habitaciones</td>
              {selectedProperties.map(prop => (
                <td key={`rooms-${prop.id}`} className={`p-6 border-r border-gray-100 ${prop.bedrooms === maxBeds && maxBeds > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.bedrooms || '—'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Baños</td>
              {selectedProperties.map(prop => (
                <td key={`baths-${prop.id}`} className={`p-6 border-r border-gray-100 ${prop.bathrooms === maxBaths && maxBaths > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.bathrooms || '—'}
                </td>
              ))}
            </tr>
            {/* <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Garajes</td>
              {selectedProperties.map(prop => (
                <td key={`garages-${prop.id}`} className="p-6 text-gray-800 font-medium border-r border-gray-100">{prop.garages || '—'}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Plantas / Pisos</td>
              {selectedProperties.map(prop => (
                <td key={`floors-${prop.id}`} className="p-6 text-gray-800 font-medium border-r border-gray-100">{prop.floors || '—'}</td>
              ))}
            </tr> */}
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Ubicación</td>
              {selectedProperties.map(prop => (
                <td key={`loc-${prop.id}`} className="p-6 text-gray-500 text-xs leading-relaxed border-r border-gray-100">{prop.location}</td>
              ))}
            </tr>

            {/* --- SECCIÓN DESPLEGABLE DE CARACTERÍSTICAS ADICIONALES --- */}
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
            
            {showFeatures && uniqueFeatures.length === 0 && (
              <tr className="border-b border-gray-100 bg-gray-50/50 animate-in fade-in duration-300">
                <td colSpan={selectedProperties.length + 1} className="p-6 text-center text-gray-500 font-medium italic">
                  No hay características adicionales registradas para estos inmuebles.
                </td>
              </tr>
            )}

            {showFeatures && uniqueFeatures.length > 0 && uniqueFeatures.map(featureName => (
              <tr key={featureName} className="border-b border-gray-100 hover:bg-gray-50/50 animate-in fade-in duration-300">
                <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100 capitalize">
                  {featureName}
                </td>
                {selectedProperties.map(prop => {
                  const hasFeature = prop.caracteristicas?.includes(featureName) || prop.features?.includes(featureName);
                  return (
                    <td key={`${featureName}-${prop.id}`} className="p-6 text-center border-r border-gray-100">
                      {hasFeature ? (
                        <div className="flex justify-center">
                           <Check className="h-5 w-5 text-[#00c087]" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                           <span className="text-gray-300 font-bold text-lg">—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <td className="p-6 font-bold text-gray-500 bg-slate-50 border-r border-gray-100">Acciones</td>
              {selectedProperties.map(prop => (
                <td key={`action-${prop.id}`} className="p-6 border-r border-gray-100">
                  <button 
                    onClick={() => handleContact(prop.whatsappContact || prop.usuarioTelefono || '', prop.title)}
                    className="w-full bg-slate-800 hover:bg-[#25D366] text-white font-bold py-2.5 rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
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