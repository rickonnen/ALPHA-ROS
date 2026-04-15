'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  buscarPublicaciones,
  type FiltrosPublicacion,
  type PublicacionBusqueda,
} from '@/features/search/search-services';
import AdvancedFilters from '@/components/search/advancedFilters';
import { ApplyFiltersButton } from '@/components/search/applyFiltersButton';
import { ClearFiltersButton } from '@/components/search/clearFiltersButton';
import { FilterTypeProperty, type TipoInmueble } from '@/components/search/filterTypeProperty';
import {
  OperationTypeFilter,
  type OperationTypeValue,
} from '@/components/search/operationTypeFilter';
import PriceDropdown from '@/components/search/priceDropdown';
import PropertyCard, { type Property } from '@/components/search/propertyCard';
import SearchAutocomplete from '@/components/search/searchAutocomplete';
import { SortSelect } from '@/components/search/SortSelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SearchMapClient from './SearchMapClient';
import { convertPublicacionesToLocations } from '@/lib/locations';

type Currency = 'USD' | 'BS';

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
};

const PROPERTY_TYPE_OPTIONS: TipoInmueble[] = [
  { id_tipo_inmueble: 1, nombre_inmueble: 'Casa' },
  { id_tipo_inmueble: 2, nombre_inmueble: 'Departamento' },
  { id_tipo_inmueble: 3, nombre_inmueble: 'Cuarto' },
  { id_tipo_inmueble: 4, nombre_inmueble: 'Terreno' },
  { id_tipo_inmueble: 5, nombre_inmueble: 'Espacio de cementerio' },
];

const LOCAL_FALLBACK_IMAGES = ['/casa1.jpg', '/casa2.jpg', '/casa3.jpg'];

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getQueryValues(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapQueryOperationToValue(value: string | null): OperationTypeValue {
  const lastOperation = getQueryValues(value)
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .at(-1);

  switch (lastOperation) {
    case 'venta':
    case 'compra':
      return 'venta';
    case 'alquiler':
      return 'alquiler';
    case 'anticretico':
      return 'anticretico';
    default:
      return null;
  }
}

function mapQueryPropertyTypeToIds(value: string | null, options: TipoInmueble[]): number[] {
  const normalizedValues = getQueryValues(value).map((item) => normalizeText(item));

  return options
    .filter((option) => normalizedValues.includes(normalizeText(option.nombre_inmueble ?? '')))
    .map((option) => option.id_tipo_inmueble);
}

function getPropertyTypeLabelsFromIds(ids: number[], options: TipoInmueble[]): string[] {
  return options
    .filter((option) => ids.includes(option.id_tipo_inmueble) && option.nombre_inmueble)
    .map((option) => option.nombre_inmueble as string);
}

function sortProperties(properties: Property[], sortBy: string): Property[] {
  const sorted = [...properties];

  sorted.sort((first, second) => {
    switch (sortBy) {
      case 'precio-asc':
        return first.price - second.price;
      case 'precio-des':
        return second.price - first.price;
      case 'm2-menor':
        return first.terrainArea - second.terrainArea;
      case 'm2-mayor':
        return second.terrainArea - first.terrainArea;
      case 'fecha-antigua':
        return first.id - second.id;
      case 'fecha-reciente':
      default:
        return second.id - first.id;
    }
  });

  return sorted;
}

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function getOperationLabel(value: OperationTypeValue): string {
  if (!value) {
    return 'Todas las Operaciones';
  }

  switch (value) {
    case 'alquiler':
      return 'Alquiler';
    case 'anticretico':
      return 'Anticrético';
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
  selectedOperation: OperationTypeValue,
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
    title: publication.titulo ?? 'Sin título',
    type: `${publication.tipo_inmueble ?? 'Inmueble'} en ${publication.tipo_operacion ?? getOperationLabel(selectedOperation)}`,
    location: location || 'Ubicación no disponible',
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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [appliedPriceFilter, setAppliedPriceFilter] = useState<AppliedPriceFilter | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [advancedFilterValues, setAdvancedFilterValues] = useState({ habitaciones: '', banos: '', piscina: '' });
  const [selectedOperation, setSelectedOperation] = useState<OperationTypeValue>(null);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState('fecha-reciente');
  const [searchResults, setSearchResults] = useState<PublicacionBusqueda[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileFiltersVisible, setIsMobileFiltersVisible] = useState(false);
  const [advancedFiltersKey, setAdvancedFiltersKey] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [hoveredPos, setHoveredPos] = useState<[number, number] | null>(null);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchLocation.trim() ||
        selectedOperation !== null ||
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
    () =>
      sortProperties(
        searchResults.map((publication) => mapPublicationToProperty(publication, selectedOperation)),
        selectedSort,
      ),
    [searchResults, selectedOperation, selectedSort],
  );

  const breadcrumbPropertyLabel =
    getPropertyTypeLabelsFromIds(selectedPropertyTypes, PROPERTY_TYPE_OPTIONS).join(', ') ||
    'Inmuebles';
  const breadcrumbLocationLabel = searchLocation.trim() || 'Bolivia';
  const breadcrumb = `${breadcrumbPropertyLabel} / ${getOperationLabel(selectedOperation)} / ${breadcrumbLocationLabel}`;

  const saveFiltersToUrl = () => {
    const urlParams = new URLSearchParams();

    if (searchLocation) urlParams.set('ciudad', searchLocation);
    if (selectedOperation !== null) urlParams.set('operaciones', selectedOperation);
    if (selectedPropertyTypes.length > 0) {
      const labels = getPropertyTypeLabelsFromIds(selectedPropertyTypes, PROPERTY_TYPE_OPTIONS).join(',');
      urlParams.set('tipo', labels);
    }
    if (appliedPriceFilter?.minPrice !== undefined) urlParams.set('minPrice', appliedPriceFilter.minPrice.toString());
    if (appliedPriceFilter?.maxPrice !== undefined) urlParams.set('maxPrice', appliedPriceFilter.maxPrice.toString());
    if (selectedCurrency !== 'USD') urlParams.set('currency', selectedCurrency);
    if (selectedSort !== 'fecha-reciente') urlParams.set('sort', selectedSort);

    const newUrl = `/search?${urlParams.toString()}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleApplyRange = (priceFilter: AppliedPriceFilter) => {
    setAppliedPriceFilter(priceFilter);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const runSearch = async (overrides?: Partial<FiltrosPublicacion>) => {
    setIsApplyingFilters(true);

    try {
      const selectedPropertyLabels = getPropertyTypeLabelsFromIds(
        selectedPropertyTypes,
        PROPERTY_TYPE_OPTIONS,
      );

      const filtros: FiltrosPublicacion = {
        ubicacion: searchLocation,
        operacion: selectedOperation ?? undefined,
        tipoInmueble: selectedPropertyLabels.join(','),
        habitaciones: advancedFilterValues.habitaciones,
        banos: advancedFilterValues.banos,
        piscina: advancedFilterValues.piscina,
        minPrice: appliedPriceFilter?.minPrice,
        maxPrice: appliedPriceFilter?.maxPrice,
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
  
// Cargar estado del mapa desde localStorage al montar componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMapState = localStorage.getItem('searchMapOpen');
      if (savedMapState !== null) {
        setIsMapOpen(JSON.parse(savedMapState));
      }
    }
  }, []);

  // Guardar estado del mapa en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchMapOpen', JSON.stringify(isMapOpen));
    }
  }, [isMapOpen]);

  useEffect(() => {
    const nextLocation = searchParams.get('ciudad')?.trim() ?? '';
    const nextOperation = mapQueryOperationToValue(searchParams.get('operaciones'));
    const nextPropertyTypes = mapQueryPropertyTypeToIds(searchParams.get('tipo'), PROPERTY_TYPE_OPTIONS);
    const nextPropertyLabels = getPropertyTypeLabelsFromIds(nextPropertyTypes, PROPERTY_TYPE_OPTIONS);
    const rawPropertyType = searchParams.get('tipo')?.trim() ?? '';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const currencyParam = searchParams.get('currency');

    const nextMinPrice =
      minPriceParam !== null && minPriceParam.trim() !== ''
        ? Number(minPriceParam)
        : undefined;

    const nextMaxPrice =
      maxPriceParam !== null && maxPriceParam.trim() !== ''
        ? Number(maxPriceParam)
        : undefined;

    const nextCurrency: Currency = currencyParam === 'BS' ? 'BS' : 'USD';

    setAppliedPriceFilter(
      nextMinPrice !== undefined || nextMaxPrice !== undefined
        ? { minPrice: nextMinPrice, maxPrice: nextMaxPrice }
        : null,
    );

    setSelectedCurrency(nextCurrency);
    setSearchLocation(nextLocation);
    setSelectedOperation(nextOperation);
    setSelectedPropertyTypes(nextPropertyTypes);

    void runSearch({
      ubicacion: nextLocation,
      operacion: nextOperation ?? undefined,
      tipoInmueble: nextPropertyLabels.join(',') || rawPropertyType || undefined,
      minPrice: nextMinPrice,
      maxPrice: nextMaxPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileFiltersOpen]);

  const openMobileFilters = () => {
    setIsMobileFiltersOpen(true);
    requestAnimationFrame(() => {
      setIsMobileFiltersVisible(true);
    });
  };

  const closeMobileFilters = () => {
    setIsMobileFiltersVisible(false);
    setTimeout(() => {
      setIsMobileFiltersOpen(false);
    }, 250);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setSelectedOperation(null);
    setSelectedPropertyTypes([]);
    setAdvancedFilterValues({ habitaciones: '', banos: '', piscina: '' });
    setAppliedPriceFilter(null);
    setSelectedCurrency('USD');
    setSelectedSort('fecha-reciente');
    setAdvancedFiltersKey((prev) => prev + 1);
    window.history.pushState(null, '', '/search');
    void runSearch({
      ubicacion: '',
      operacion: undefined,
      tipoInmueble: undefined,
      habitaciones: '',
      banos: '',
      piscina: '',
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const handleSort = (sortOption: string) => {
    setSelectedSort(sortOption);
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="relative z-[60] mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 md:hidden">
        <Button
          variant="secondary"
          onClick={openMobileFilters}
          className="h-10 w-42 px-3 flex items-center gap-1 text-sm"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Mostrar Filtros
        </Button>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-checked:bg-[#C26E5A] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className={`absolute inset-0 bg-black/45 transition-opacity duration-250 ease-out ${
              isMobileFiltersVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            className={`absolute inset-x-0 bottom-0 top-[92px] overflow-hidden rounded-t-[28px] bg-[#F6F4EF] transition-all duration-250 ease-out ${
              isMobileFiltersVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <div className="h-full overflow-y-auto px-4 py-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[32px] font-semibold text-[#2E2E2E]">Filtros</h2>
                <button
                  type="button"
                  onClick={closeMobileFilters}
                  className="flex h-10 w-10 items-center justify-center text-[#2E2E2E]"
                  aria-label="Cerrar filtros"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              <ApplyFiltersButton
                isLoading={isApplyingFilters}
                onClick={() => {
                  saveFiltersToUrl();
                  void runSearch();
                  closeMobileFilters();
                }}
              />

              <div className="my-4 h-px bg-[#D8D2C8]"></div>
              <p className="mb-3 text-sm font-medium text-[#2E2E2E]">Filtros Básicos</p>

              <div className="space-y-3">
                <SearchAutocomplete value={searchLocation} onChange={setSearchLocation} />
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
                <AdvancedFilters
                  key={advancedFiltersKey}
                  onChange={setAdvancedFilterValues}
                />
              </div>

              <div className="my-4 h-px bg-[#D8D2C8]"></div>

              <div className="mt-4 pb-6">
                <ClearFiltersButton hasActiveFilters={hasActiveFilters} onClear={handleClearFilters} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:min-h-[calc(100vh-200px)]">
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-8">
            <div className="flex h-[660px] flex-col overflow-hidden rounded-4xl border border-gray-300 bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-[#2E2E2E]">Filtros</h2>

              <div className="mb-4 flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMapOpen}
                    onChange={() => setIsMapOpen(!isMapOpen)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C26E5A]"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Mapa</span>
              </div>

              <ApplyFiltersButton
                isLoading={isApplyingFilters}
                onClick={() => {
                  saveFiltersToUrl();
                  void runSearch();
                }}
              />

              <div className="my-4 h-px bg-[#F4EFE6]" />

              <SearchAutocomplete value={searchLocation} onChange={setSearchLocation} />

              <div className="my-4 h-px bg-[#F4EFE6]" />

              <div className="min-h-0 flex-1">
                <ScrollArea className="h-full pr-4">
                  <OperationTypeFilter value={selectedOperation} onChange={setSelectedOperation} />
                  <FilterTypeProperty
                    tipos={PROPERTY_TYPE_OPTIONS}
                    selected={selectedPropertyTypes}
                    onChange={setSelectedPropertyTypes}
                  />

                  <div className="my-4 h-px bg-[#F4EFE6]" />

                  <PriceDropdown
                    selectedCurrency={selectedCurrency}
                    appliedPriceFilter={appliedPriceFilter}
                    onCurrencyChange={handleCurrencyChange}
                    onApplyRange={handleApplyRange}
                  />

                  <AdvancedFilters
                    key={advancedFiltersKey}
                    onChange={setAdvancedFilterValues}
                  />

                  <div className="my-4 h-px bg-[#F4EFE6]" />

                  <div className="pb-2">
                    <ClearFiltersButton
                      hasActiveFilters={hasActiveFilters}
                      onClear={handleClearFilters}
                    />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </aside>

        <main className={`${isMapOpen ? 'md:col-span-5' : 'md:col-span-9'}`}>
          <div className="mb-3 hidden flex-col items-start justify-between gap-4 md:flex md:flex-row md:items-center">
            <div>
              <nav className="mb-1 text-sm text-gray-500">{breadcrumb}</nav>
              <h1 className="text-base font-semibold">{displayedProperties.length} inmuebles disponibles</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SortSelect onSortChange={handleSort} />
            </div>
          </div>

          <div className="mb-2 block md:hidden">
            <nav className="mb-1 text-sm text-gray-500 underline">{breadcrumb}</nav>
            <h1 className="mb-2 text-base font-semibold">{displayedProperties.length} inmuebles disponibles</h1>
            <SortSelect onSortChange={handleSort} />
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
            <>
              <div className={`md:hidden ${isMapOpen ? 'hidden' : ''}`}>
                <div className={`grid grid-cols-1 gap-6 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
                  {displayedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      selectedCurrency={selectedCurrency}
                      isHovered={hoveredId === property.id}
                      onMouseEnter={() => {
                        setHoveredId(property.id);
                        const location = searchResults.find(p => p.id_publicacion === property.id)?.ubicacion;
                        if (location?.latitud && location?.longitud) {
                          setHoveredPos([Number(location.latitud), Number(location.longitud)]);
                        }
                      }}
                      onMouseLeave={() => setHoveredPos(null)}
                      onClick={() => {
                        const location = searchResults.find(p => p.id_publicacion === property.id)?.ubicacion;
                        if (location?.latitud && location?.longitud) {
                          setSelectedPos([Number(location.latitud), Number(location.longitud)]);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden md:block">
                <ScrollArea className="h-[605px] pr-4">
                  <div className={`grid grid-cols-1 pb-2 gap-3 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
                    {displayedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        selectedCurrency={selectedCurrency}
                        isHovered={hoveredId === property.id}
                        onMouseEnter={() => {
                          setHoveredId(property.id);
                          const location = searchResults.find(p => p.id_publicacion === property.id)?.ubicacion;
                          if (location?.latitud && location?.longitud) {
                            setHoveredPos([Number(location.latitud), Number(location.longitud)]);
                          }
                        }}
                        onMouseLeave={() => setHoveredPos(null)}
                        onClick={() => {
                          const location = searchResults.find(p => p.id_publicacion === property.id)?.ubicacion;
                          if (location?.latitud && location?.longitud) {
                            setSelectedPos([Number(location.latitud), Number(location.longitud)]);
                          }
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </main>

        {isMapOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[160px] z-40 md:relative md:inset-auto md:z-0 md:col-span-4 md:h-full md:sticky md:top-4 md:rounded-lg md:overflow-hidden">
            <SearchMapClient 
              locations={convertPublicacionesToLocations(searchResults, selectedCurrency)}
              hoveredId={hoveredId}
              selectedPos={selectedPos}
              hoveredPos={hoveredPos}
              setSelectedPos={setSelectedPos}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
