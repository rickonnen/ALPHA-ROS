import { ChevronLeft, Check } from "lucide-react";
import { type Property } from "./propertyCard";
import { useState } from "react";
import { useDollarRate } from '@/components/hooks/getDollarRate';
import CurrencySwitch from "@/components/search/currencySwitch";
const MAX_COMPARE_PROPERTIES = 4;
const FALLBACK_COMPARE_IMAGE = "/casa1.jpg";

// Extendemos localmente tu Property para incluir las caracteristicas de la BD
interface CompareProperty extends Property {
  //caracteristicas?: string[];
  features?: string[]; 
}

interface CompareTableProps {
  properties: Property[];
  selectedIds: number[];
  selectedCurrency: 'USD' | 'BS';
  onCurrencyChange?: (currency: 'USD' | 'BS') => void;
  onBack: () => void;
}

export function CompareTable({ properties, selectedIds, selectedCurrency, onCurrencyChange, onBack }: CompareTableProps) {
  const { compra } = useDollarRate();
  const exchangeRate = compra ?? 6.96;

  const [showFeatures, setShowFeatures] = useState<boolean>(false);

  // Filtramos solo las propiedades seleccionadas
  const selectedProperties = properties
  .filter((p) => selectedIds.includes(p.id))
  .slice(0, MAX_COMPARE_PROPERTIES) as CompareProperty[];
  if (selectedProperties.length < 2) {
    return (
      <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="mb-4 text-sm font-semibold text-gray-600">
          Selecciona al menos 2 propiedades para comparar.
        </p>

        <button
          onClick={onBack}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-[#a67c52] transition-colors"
        >
          Volver a los listados
        </button>
      </div>
    );
  }
  
  
  
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

  const getDiscountPercent = (prop: CompareProperty) => {
    if (
      typeof prop.previousPrice !== "number" ||
      !Number.isFinite(prop.previousPrice) ||
      !Number.isFinite(prop.price) ||
      prop.previousPrice <= prop.price
    ) {
      return 0;
    }

    return (
      prop.discountPercent ??
      Math.round(((prop.previousPrice - prop.price) / prop.previousPrice) * 100)
    );
  };

  const hasDiscount = (prop: CompareProperty) => {
    return getDiscountPercent(prop) > 0;
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
    new Set(selectedProperties.flatMap(p => {
      const fromCaracterisiticas = p.caracteristicas?.map(c=>c.nombre) || [];
      const fromFeatures = p.features || [];
      return [ ... fromCaracterisiticas, ...fromFeatures ];
      })
    )
  ).sort();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-24 lg:px-4 mt-2 sm:mt-4 relative">
      
      {/* --- CABECERA CON BOTÓN VOLVER Y SWITCH DE MONEDA --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#C26E5A] font-bold transition-colors w-fit text-sm sm:text-base"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Volver a los listados</span>
        </button>

        {onCurrencyChange && (
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-fit">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">Moneda:</span>
            <CurrencySwitch
              currentCurrency={selectedCurrency}
              setCurrentCurrency={onCurrencyChange}
            />
          </div>
        )}
      </div>

      {/* --- CONTENEDOR DE LA TABLA CON SCROLL HORIZONTAL --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto w-full max-h-[75vh] md:max-h-[80vh] relative custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-20 shadow-sm border-b border-gray-200 bg-slate-50">
            <tr>
              {/* Celda "Especificaciones" fija en esquina superior izquierda */}
              <th className="sticky left-0 top-0 z-30 p-3 sm:p-6 text-slate-800 font-black text-[10px] sm:text-sm uppercase w-[120px] sm:w-48 bg-slate-50 border-r border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Especificaciones
              </th>
              
              {selectedProperties.map(prop => (
                <th key={`header-${prop.id}`} className="p-3 sm:p-6 bg-white border-r border-b border-gray-200 align-top min-w-[200px] sm:min-w-[250px] w-[200px] sm:w-[280px]">
                  <div 
                    onClick={() => handlePropertyClick(prop.id)}
                    className="cursor-pointer group relative"
                    title="Ver detalles del inmueble"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-4 shadow-sm border-2 border-transparent group-hover:border-[#C26E5A] transition-colors">
                      {hasDiscount(prop) && (
                        <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white shadow">
                          -{getDiscountPercent(prop)}%
                        </span>
                      )}

                      <img
                        src={prop.images?.[0] || FALLBACK_COMPARE_IMAGE}
                        alt={prop.title}
                        className="w-full h-28 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {/* Resaltamos el precio más bajo en color verde */}
                    <div className={`text-lg sm:text-xl font-black mb-1 transition-colors ${prop.price === minPrice && minPrice > 0 ? 'text-[#00c087]' : 'text-slate-800 group-hover:text-[#C26E5A]'}`}>
                      {getConvertedPrice(prop.price)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-[#C26E5A] uppercase leading-tight line-clamp-2">
                      {prop.title}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              {/* Columna fija izquierda */}
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tipo de Operación</td>
              {selectedProperties.map(prop => (
                <td key={`type-${prop.id}`} className="p-3 sm:p-6 text-gray-800 font-medium border-r border-gray-100">{prop.type}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Superficie Terreno</td>
              {selectedProperties.map(prop => (
                <td key={`area-${prop.id}`} className={`p-3 sm:p-6 border-r border-gray-100 ${prop.terrainArea === maxArea && maxArea > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.terrainArea ? `${prop.terrainArea.toLocaleString('es-BO')} m²` : '—'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Habitaciones</td>
              {selectedProperties.map(prop => (
                <td key={`rooms-${prop.id}`} className={`p-3 sm:p-6 border-r border-gray-100 ${prop.bedrooms === maxBeds && maxBeds > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.bedrooms || '—'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Baños</td>
              {selectedProperties.map(prop => (
                <td key={`baths-${prop.id}`} className={`p-3 sm:p-6 border-r border-gray-100 ${prop.bathrooms === maxBaths && maxBaths > 0 ? 'font-bold text-[#00c087] bg-green-50/30' : 'text-gray-800 font-medium'}`}>
                  {prop.bathrooms || '—'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Garajes</td>
              {selectedProperties.map(prop => (
                <td key={`garage-${prop.id}`} className="p-3 sm:p-6 text-gray-800 font-medium border-r border-gray-100">{prop.garajes || '—'}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Plantas / Pisos</td>
              {selectedProperties.map(prop => (
                <td key={`floors-${prop.id}`} className="p-3 sm:p-6 text-gray-800 font-medium border-r border-gray-100">{prop.floors || '—'}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ubicación</td>
              {selectedProperties.map(prop => (
                <td key={`loc-${prop.id}`} className="p-3 sm:p-6 text-gray-500 text-[10px] sm:text-xs leading-relaxed border-r border-gray-100">
                  <span className="line-clamp-3">{prop.location}</span>
                </td>
              ))}
            </tr>

            {/* --- SECCIÓN DESPLEGABLE DE CARACTERÍSTICAS ADICIONALES --- */}
            {/* <tr 
              className="border-b border-gray-200 bg-slate-100/50 cursor-pointer hover:bg-slate-200/50 transition-colors"
              onClick={() => setShowFeatures(!showFeatures)}
            >
              <td colSpan={selectedProperties.length + 1} className="p-0">
                <div className="sticky left-0 w-screen sm:w-full flex items-center justify-start sm:justify-center p-3 sm:p-4 gap-2 text-[#C26E5A]">
                  <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">
                    Características Adicionales
                  </span>
                  {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </td>
            </tr> */}
            
            {/* {showFeatures && uniqueFeatures.length === 0 && (
              <tr className="border-b border-gray-100 bg-gray-50/50 animate-in fade-in duration-300">
                <td colSpan={selectedProperties.length + 1} className="p-0">
                  <div className="sticky left-0 w-screen sm:w-full p-4 sm:p-6 text-center text-gray-500 font-medium italic text-xs sm:text-sm">
                    No hay características adicionales registradas para estos inmuebles.
                  </div>
                </td>
              </tr>
            )} */}

            {showFeatures && uniqueFeatures.length > 0 && uniqueFeatures.map(featureName => (
              <tr key={featureName} className="border-b border-gray-100 hover:bg-gray-50/50 animate-in fade-in duration-300">
                <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 capitalize shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {featureName}
                </td>
                {selectedProperties.map(prop => {
                  const hasFeature = 
                    prop.caracteristicas?.some(c => c.nombre === featureName) || 
                    prop.features?.includes(featureName);
                  return (
                    <td key={`${featureName}-${prop.id}`} className="p-3 sm:p-6 text-center border-r border-gray-100">
                      {hasFeature ? (
                        <div className="flex justify-center">
                           <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#00c087]" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                           <span className="text-gray-300 font-bold text-base sm:text-lg">—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <td className="sticky left-0 z-10 p-3 sm:p-6 font-bold text-[11px] sm:text-sm text-gray-500 bg-slate-50 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Acciones</td>
              {selectedProperties.map(prop => (
                <td key={`action-${prop.id}`} className="p-3 sm:p-6 border-r border-gray-100">
                  <button
                    onClick={()=> handlePropertyClick(prop.id)}
                    className="w-full bg-slate-800 hover:bg-[#a67c52] text-white font-bold py-2 sm:py-2.5 rounded text-[10px] sm:text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 sm:gap-2"                  >
                    Ver Detalle
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