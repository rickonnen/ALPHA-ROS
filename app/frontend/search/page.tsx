'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  buscarPublicaciones,
  type FiltrosPublicacion,
  type PublicacionBusqueda,
} from '@/app/frontend/search/search-services';
import AdvancedFilters from '@/components/search/advancedFilters';
import { ApplyFiltersButton } from '@/components/search/applyFiltersButton';
import { ClearFiltersButton } from '@/components/search/clearFiltersButton';
import { FilterTypeProperty, type TipoInmueble } from '@/components/search/filterTypeProperty';
import { OperationTypeFilter, type OperationType } from '@/components/search/operationTypeFilter';
import PriceDropdown from '@/components/search/priceDropdown';
import PropertyCard, { type Property } from '@/components/search/propertyCard';
import SearchAutocomplete from '@/components/search/searchAutocomplete';
import { SortSelect } from '@/components/search/SortSelect';

type Currency = 'USD' | 'BS';

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
};

const PROPERTY_TYPE_OPTIONS: TipoInmueble[] = [
  { id_tipo_inmueble: 1, nombre_inmueble: 'Casa' },
  { id_tipo_inmueble: 2, nombre_inmueble: 'Departamento' },
  { id_tipo_inmueble: 3, nombre_inmueble: 'Terreno' },
  { id_tipo_inmueble: 4, nombre_inmueble: 'Local Comercial' },
  { id_tipo_inmueble: 5, nombre_inmueble: 'Oficina' },
];

const LOCAL_FALLBACK_IMAGES = ['/casa1.jpg', '/casa2.jpg', '/casa3.jpg'];

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function getOperationLabel(value: OperationType): string {
  switch (value) {
    case 'alquiler':
      return 'Alquiler';
    case 'anticretico':
      return 'Anticretico';
    default:
      return 'Venta';
  }
}

function isRenderableImage(url: string): boolean {
  if (!url) {
    return false;
  }

  if (url.startsWith('/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname !== 'example.com';
  } catch {
    return false;
  }
}

function getSafeImages(publication: PublicacionBusqueda): string[] {
  const validImages = (publication.imagenes ?? []).filter(isRenderableImage);

  if (validImages.length > 0) {
    return validImages;
  }

  const fallbackIndex = publication.id_publicacion % LOCAL_FALLBACK_IMAGES.length;
  return [LOCAL_FALLBACK_IMAGES[fallbackIndex]];
}

function mapPublicationToProperty(
  publication: PublicacionBusqueda,
  selectedOperation: OperationType,
): Property {
  const location = [
    publication.ubicacion?.direccion,
    publication.ubicacion?.zona,
    publication.ubicacion?.ciudad,
    publication.ubicacion?.pais,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: publication.id_publicacion,
    title: publication.titulo ?? 'Sin titulo',
    type: `${publication.tipo_inmueble ?? 'Inmueble'} en ${publication.tipo_operacion ?? getOperationLabel(selectedOperation)}`,
    location: location || 'Ubicacion no disponible',
    terrainArea: toNumber(publication.superficie),
    bedrooms: publication.habitaciones ?? 0,
    bathrooms: publication.banos ?? 0,
    price: toNumber(publication.precio),
    currencySymbol: publication.moneda_simbolo ?? '$us',
    publishedDate: 'Reciente',
    whatsappContact: '',
    images: getSafeImages(publication),
  };
}

export default function SearchPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [appliedPriceFilter, setAppliedPriceFilter] = useState<AppliedPriceFilter | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [advancedFilterValues, setAdvancedFilterValues] = useState({ habitaciones: '', banos: '', piscina: '' });
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('venta');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState('fecha-reciente');
  const [searchResults, setSearchResults] = useState<PublicacionBusqueda[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchLocation.trim() ||
      selectedOperation !== 'venta' ||
      selectedPropertyTypes.length > 0 ||
      advancedFilterValues.habitaciones ||
      advancedFilterValues.banos ||
      advancedFilterValues.piscina ||
      appliedPriceFilter?.minPrice !== undefined ||
      appliedPriceFilter?.maxPrice !== undefined ||
      selectedSort !== 'fecha-reciente',
    );
  }, [
    advancedFilterValues.banos,
    advancedFilterValues.habitaciones,
    advancedFilterValues.piscina,
    appliedPriceFilter?.maxPrice,
    appliedPriceFilter?.minPrice,
    searchLocation,
    selectedOperation,
    selectedPropertyTypes.length,
    selectedSort,
  ]);

  const displayedProperties = useMemo(
    () => searchResults.map((publication) => mapPublicationToProperty(publication, selectedOperation)),
    [searchResults, selectedOperation],
  );

  const handleApplyRange = (priceFilter: AppliedPriceFilter) => {
    setAppliedPriceFilter(priceFilter);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const runSearch = async (overrides?: Partial<FiltrosPublicacion>) => {
    setIsApplyingFilters(true);

    try {
      const filtros: FiltrosPublicacion = {
        ubicacion: searchLocation,
        operacion: selectedOperation,
        tipoInmuebleIds: selectedPropertyTypes,
        habitaciones: advancedFilterValues.habitaciones,
        banos: advancedFilterValues.banos,
        piscina: advancedFilterValues.piscina,
        currency: selectedCurrency,
        minPrice: appliedPriceFilter?.minPrice,
        maxPrice: appliedPriceFilter?.maxPrice,
        sortBy: selectedSort,
        ...overrides,
      };

      const resultados = await buscarPublicaciones(filtros);
      setSearchResults(resultados);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  useEffect(() => {
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilters = () => {
    setSearchLocation('');
    setSelectedOperation('venta');
    setSelectedPropertyTypes([]);
    setAdvancedFilterValues({ habitaciones: '', banos: '', piscina: '' });
    setAppliedPriceFilter(null);
    setSelectedCurrency('USD');
    setSelectedSort('fecha-reciente');
    void runSearch({
      ubicacion: '',
      operacion: 'venta',
      tipoInmuebleIds: [],
      habitaciones: '',
      banos: '',
      piscina: '',
      currency: 'USD',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'fecha-reciente',
    });
  };

  const handleSort = (sortOption: string) => {
    setSelectedSort(sortOption);
    void runSearch({ sortBy: sortOption });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 md:hidden">
        <button className="flex items-center gap-2 rounded-md bg-[#E4C5A5] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#d4b08c]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Mostrar Filtros
        </button>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-checked:bg-[#a67c52] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside className="hidden space-y-6 md:col-span-3 md:block">
          <div className="sticky top-8">
            <h2 className="mb-4 text-base font-semibold">Filtros</h2>
            <div className="space-y-4 rounded-lg p-2">
              <div className="flex items-center gap-2 border-b pb-4">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-checked:bg-[#a67c52] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Mapa</span>
              </div>

              <SearchAutocomplete value={searchLocation} onChange={setSearchLocation} />

              <ApplyFiltersButton
                isLoading={isApplyingFilters}
                onClick={() => {
                  void runSearch();
                }}
              />

              <OperationTypeFilter value={selectedOperation} onChange={setSelectedOperation} />

              <FilterTypeProperty
                tipos={PROPERTY_TYPE_OPTIONS}
                selected={selectedPropertyTypes}
                onChange={setSelectedPropertyTypes}
              />

              <PriceDropdown
                selectedCurrency={selectedCurrency}
                appliedPriceFilter={appliedPriceFilter}
                onCurrencyChange={handleCurrencyChange}
                onApplyRange={handleApplyRange}
              />

              <AdvancedFilters onChange={setAdvancedFilterValues} />

              <div>
                <ClearFiltersButton hasActiveFilters={hasActiveFilters} onClear={handleClearFilters} />
              </div>
            </div>
          </div>
        </aside>

        <main className={`${isMapOpen ? 'md:col-span-5' : 'md:col-span-9'}`}>
          <div className="mb-6 hidden flex-col items-start justify-between gap-4 md:flex md:flex-row md:items-center">
            <div>
              <nav className="mb-1 text-sm text-gray-500">Casas y Casas en Condominio / Venta</nav>
              <h1 className="text-base font-semibold">{displayedProperties.length} inmuebles disponibles</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SortSelect onSortChange={handleSort} />
            </div>
          </div>

          <div className="mb-4 block md:hidden">
            <nav className="mb-1 text-sm text-gray-500 underline">Casas y Casas en Condominio / Venta</nav>
            <h1 className="mb-2 text-base font-semibold">{displayedProperties.length} inmuebles disponibles</h1>
            <div className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center">Relevancia</div>
          </div>

          {!hasSearched && isApplyingFilters ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
              Cargando inmuebles...
            </div>
          ) : displayedProperties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
              No se encontraron inmuebles con los filtros aplicados.
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
              {displayedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} selectedCurrency={selectedCurrency} />
              ))}
            </div>
          )}
        </main>

        {isMapOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[90px] z-40 bg-white md:relative md:inset-auto md:z-0 md:col-span-4 md:h-[calc(90vh-2rem)] md:sticky md:top-4 md:rounded-xl md:border-2 md:border-gray-200">
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-100">
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
