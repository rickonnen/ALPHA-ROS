'use client';
import { useState } from 'react';
import PropertyCard, { Property } from '@/components/search/propertyCard';
import PriceDropdown from '@/components/search/priceDropdown';
import { ClearFiltersButton } from '@/components/search/clearFiltersButton';
import { useFilters } from '@/app/backend/filter_search_page/usefilters';
import Filters from "@/components/search/basicFilters";
import AdvancedFilters from "@/components/search/advancedFilters";
import { SortSelect } from "@/components/search/SortSelect";
import { OperationTypeFilter, type OperationType } from '@/components/search/operationTypeFilter';

import { FilterTypeProperty, TipoInmueble } from '@/components/search/filterTypeProperty';
import { useSearchParams } from 'next/navigation'; 
import { getPublicacionesOrdenadas } from '@/app/backend/filter_search_page/services';

type Currency = "USD" | "BS";

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
}

export default function SearchPage() {
  // estados principales
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [appliedPriceFilter, setAppliedPriceFilter] = useState<AppliedPriceFilter | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [advancedFilterValues, setAdvancedFilterValues] = useState({ habitaciones: '', banos: '', piscina: '' });
  const [selectedOperation, setSelectedOperation] = useState<OperationType>("venta");
  const { hasActiveFilters, clearFilters } = useFilters({
    appliedPriceFilter,
    selectedCurrency,
    onClearPriceFilter: () => setAppliedPriceFilter(null),
    onResetCurrency: () => setSelectedCurrency("USD"),
  });

  const handleApplyRange = (priceFilter: AppliedPriceFilter) => setAppliedPriceFilter(priceFilter);
  const handleCurrencyChange = (currency: Currency) => setSelectedCurrency(currency);
  const handleSort = (sortOption: string) => {
    console.log("Ordenar por:", sortOption);
    // Aquí luego puedes conectar con getPublicacionesOrdenadas
  };

  // prueba mockeado
  const PROPERTIES_MOCK: Property[] = [
    { id: 1, title: 'Propiedad de Alto Nivel en Venta Exclusiva', type: 'Casa en Venta', location: 'AV LAS AMERICAS, Sur, Santa Cruz', terrainArea: 1114, bedrooms: 4, bathrooms: 2, price: 1461925, currencySymbol: '$us', publishedDate: 'Publicado hace 5 días', whatsappContact: '59187654321', images: ['/casa1.jpg', '/casa2.jpg'] },
    { id: 2, title: 'Propiedad de Alto Nivel en Venta Exclusiva', type: 'Casa en Venta', location: 'AV LAS AMERICAS, Sur, Santa Cruz', terrainArea: 1114, bedrooms: 4, bathrooms: 2, price: 1461925, currencySymbol: '$us', publishedDate: 'Publicado hace 5 días', whatsappContact: '59187654321', images: ['/casa2.jpg', '/casa3.jpg'] },
    { id: 3, title: 'Propiedad de Alto Nivel en Venta Exclusiva', type: 'Casa en Venta', location: 'AV LAS AMERICAS, Sur, Santa Cruz', terrainArea: 1114, bedrooms: 4, bathrooms: 2, price: 1461925, currencySymbol: '$us', publishedDate: 'Publicado hace 5 días', whatsappContact: '59187654321', images: ['/casa3.jpg', '/casa1.jpg'] }
  ];

  

  return (
    <div className="container mx-auto px-4 py-8">
      {/* esta es la cabecera que va tener los filtros cuando sea movil, por ahora esta en oculto (hidden) */}
      <div className="flex md:hidden flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        {/* boton en movil para filtros, esto ustedes lo tiene que mejorar */}
        <button className="bg-[#E4C5A5] text-[#2C2C2C] px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#d4b08c]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Mostrar Filtros
        </button>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
      </div>
      {/* hasta aca seria la parte de movil */}

      {/* contenido en un grid de 12 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* sidebar de filtros en desktop  en tres columnas */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="sticky top-8">
            <h2 className="text-xl font-bold mb-4">Filtros</h2>
            {/* este es el espacio para boton del mapa */}
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Mapa</span>
            </div>
            {/* hasta aca el boton del mapa */}

            {/* filtros */}
            <div className="border-gray-300 rounded-lg p-10 text-center text-gray-400">
              <Filters filtrosAvanzados={advancedFilterValues} onResultados={() => {}} />
              <PriceDropdown
                selectedCurrency={selectedCurrency}
                appliedPriceFilter={appliedPriceFilter}
                onCurrencyChange={handleCurrencyChange}
                onApplyRange={handleApplyRange}
              />
              <div className='mt-3'>
                
                <OperationTypeFilter
                  value={selectedOperation}
                  onChange={setSelectedOperation}
                />
              </div>
              <AdvancedFilters onChange={(valores) => setAdvancedFilterValues(valores)} />
              <div className="mt-4">
                <ClearFiltersButton hasActiveFilters={hasActiveFilters} onClear={clearFilters} />
              </div>
            </div>
          </div>
        </aside>
        {/* hasta aca fue lo de desktop */}

        {/* parte principal */}
        <main className={`${isMapOpen ? 'md:col-span-5' : 'md:col-span-9'}`}>
          {/* cabecera desktop */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <nav className="text-sm text-gray-500 mb-1">Casas y Casas en Condominio / Venta</nav>
              <h1 className="text-xl font-semibold">150 Casas y en Condominio en Venta en Bolivia</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SortSelect onSortChange={handleSort} />
            </div>
          </div>
          {/* cabecera movil */}
          <div className="block md:hidden mb-4">
            <nav className="text-sm text-gray-500 mb-1 underline">Casas y Casas en Condominio / Venta</nav>
            <h1 className="text-lg font-semibold mb-2">150 Casas y en Condominio en Venta en Bolivia</h1>
            <div className="border border-gray-300 px-3 py-2 rounded-md bg-white w-full text-center">Relevancia</div>
          </div>

          {/* cards */}
          <div className={`grid grid-cols-1 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
            {PROPERTIES_MOCK.map((prop) => (
              <PropertyCard key={prop.id} property={prop} selectedCurrency={selectedCurrency} />
            ))}
          </div>
        </main>

        {/* mapa movil */}
        {isMapOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[90px] z-40 bg-white md:relative md:inset-auto md:z-0 md:col-span-4 md:h-[calc(90vh-2rem)] md:sticky md:top-4 md:border-2 md:border-gray-200 md:rounded-xl">
            <div className="w-full h-full bg-gray-100 relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                [Componente Mapa Activo]
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}