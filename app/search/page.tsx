"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as turf from "@turf/turf";

import {
  buscarPublicaciones,
  type FiltrosPublicacion,
  type PublicacionBusqueda,
} from "@/features/search/search-services";
import { useTracking } from "@/components/hooks/useTracking";
import AdvancedFilters from "@/components/search/advancedFilters";
import CharacteristicsFilter from "@/components/search/characteristicsFilter";
import { ClearFiltersButton } from "@/components/search/clearFiltersButton";
import {
  FilterTypeProperty,
  type TipoInmueble,
} from "@/components/search/filterTypeProperty";
import {
  OperationTypeFilter,
  type OperationTypeValue,
  operationTypeOptions,
} from "@/components/search/operationTypeFilter";
import PriceDropdown from "@/components/search/priceDropdown";
import PropertyCard, { type Property } from "@/components/search/propertyCard";
import SearchAutocomplete from "@/components/search/searchAutocomplete";
import { SortSelect } from "@/components/search/SortSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  X,
  List,
  LayoutGrid,
  Map,
  Menu,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Type,
} from "lucide-react";
import SearchMapClient from "./SearchMapClient";
import {
  convertPublicacionesToLocations,
  formatPropertyPrice,
} from "@/lib/locations";
import CurrencySwitch from "@/components/search/currencySwitch";

/* hooks y ui para autenticación */
import { useAuth } from "@/app/auth/AuthContext";
import AuthModal from "@/app/auth/AuthModal";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";

/* Para comparacion de propiedades */
import { CompareTable } from "@/components/search/compareTable";
import { CompareFloatingBar } from "@/components/search/floatBar";
import { countActiveFilters } from "@/features/filter_search_page/countActiveFilters";

type Currency = "USD" | "BS";

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
};

type SearchAdvancedFilterValues = {
  habitaciones?: string;
  banos?: string;
  piscina?: string;
  minSurface?: number;
  maxSurface?: number;
  soloOfertas?: boolean;
  caracteristicasIds?: number[];
};

type SearchCharacteristicOption = {
  id_caracteristica: number;
  nombre_caracteristica: string;
};

interface SavedZone {
  id_mi_zona: number;
  nombre_zona: string;
  coordenadas: [number, number][];
  fecha_creacion?: string;
}

interface DefaultZone {
  id_zona: number;
  nombre_zona: string;
  id_ciudad: number | null;
  coordenadas: [number, number][];
}

interface ZoneStats {
  propertyCount: number;
  averagePriceLabel: string | null;
}

type ZoneModalMode = "create" | "rename";

interface FiltrosBusquedaParams extends FiltrosPublicacion {
  page?: number;
  limit?: number;
  currency?: undefined;
}

type BrowserCoordinates = {
  latitud: number;
  longitud: number;
};

type GlobalLocationRecommendationsResponse = {
  success: boolean;
  zone?: string | null;
  publications?: PublicacionBusqueda[];
  total?: number;
  message?: string;
};

const PROPERTY_TYPE_OPTIONS: TipoInmueble[] = [
  { id_tipo_inmueble: 1, nombre_inmueble: "Casa" },
  { id_tipo_inmueble: 2, nombre_inmueble: "Departamento" },
  { id_tipo_inmueble: 3, nombre_inmueble: "Cuarto" },
  { id_tipo_inmueble: 4, nombre_inmueble: "Terreno" },
  { id_tipo_inmueble: 5, nombre_inmueble: "Espacio de cementerio" },
];

const LOCAL_FALLBACK_IMAGES = ["/casa1.jpg", "/casa2.jpg", "/casa3.jpg"];
const ZONE_NAME_PATTERN = /^[A-Za-z0-9]+$/;
const ZONE_NAME_MAX_LENGTH = 50;
const POST_AUTH_REDIRECT_KEY = "postAuthRedirect";
const POST_AUTH_LOADED_ZONE_KEY = "loadedZona";
const POST_AUTH_MAP_OPEN_KEY = "searchMapOpen";
const MIN_ZONE_POINTS = 4;
const MAX_ZONE_POINTS = 10;
const POST_AUTH_EDIT_ZONE_KEY = "loadedZonaEditMode";

// ── Pagination config ──
const ITEMS_PER_PAGE_GRID = 6;
const ITEMS_PER_PAGE_LIST = 5;
const ITEMS_PER_PAGE_MAP_GRID = 3;
const ITEMS_PER_PAGE_MAP_LIST = 4;

function isValidLatLng(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    (lat as number) >= -90 &&
    (lat as number) <= 90 &&
    (lng as number) >= -180 &&
    (lng as number) <= 180
  );
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getQueryValues(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBrowserCoordinates(): Promise<BrowserCoordinates | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: 1500,
      },
    );
  });
}

function normalizeZoneName(value: string): string {
  return value.trim().toLowerCase();
}

function isValidZoneCoordinates(
  coordinates: unknown,
): coordinates is [number, number][] {
  return (
    Array.isArray(coordinates) &&
    coordinates.length >= MIN_ZONE_POINTS &&
    coordinates.length <= MAX_ZONE_POINTS &&
    coordinates.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number" &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]),
    )
  );
}

function getPolygonSignature(coordinates: [number, number][]): string {
  return JSON.stringify(
    coordinates.map(([lat, lng]) => [
      Number(lat.toFixed(6)),
      Number(lng.toFixed(6)),
    ]),
  );
}

function getZoneNameError(
  value: string,
  savedZones: SavedZone[],
  excludedZoneId?: number,
): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Ingresa un nombre para la zona.";
  }

  if (trimmedValue.length > ZONE_NAME_MAX_LENGTH) {
    return `El nombre no puede superar ${ZONE_NAME_MAX_LENGTH} caracteres.`;
  }

  if (!ZONE_NAME_PATTERN.test(trimmedValue)) {
    return "Usa solo letras y números, sin espacios ni caracteres especiales.";
  }

  const normalizedValue = normalizeZoneName(trimmedValue);
  const hasDuplicateName = savedZones.some(
    (zone) =>
      zone.id_mi_zona !== excludedZoneId &&
      typeof zone.nombre_zona === "string" &&
      normalizeZoneName(zone.nombre_zona) === normalizedValue,
  );

  if (hasDuplicateName) {
    return "Ya tienes una zona guardada con ese nombre.";
  }

  return null;
}

function getZoneStats(
  coordinates: [number, number][],
  publications: PublicacionBusqueda[],
  currency: Currency,
): ZoneStats {
  if (!isValidZoneCoordinates(coordinates)) {
    return { propertyCount: 0, averagePriceLabel: null };
  }

  const turfCoords = coordinates.map(([lat, lng]) => [lng, lat]);
  turfCoords.push(turfCoords[0]);
  const area = turf.polygon([turfCoords]);

  let propertyCount = 0;
  let totalPrice = 0;

  publications.forEach((publication) => {
    const lat = Number(publication.ubicacion?.latitud);
    const lng = Number(publication.ubicacion?.longitud);
    const price = Number(publication.precio);

    if (!isValidLatLng(lat, lng) || !Number.isFinite(price) || price <= 0) {
      return;
    }

    const point = turf.point([lng, lat]);
    if (!turf.booleanPointInPolygon(point, area)) {
      return;
    }

    propertyCount += 1;
    totalPrice += price;
  });

  if (propertyCount === 0) {
    return { propertyCount: 0, averagePriceLabel: null };
  }

  return {
    propertyCount,
    averagePriceLabel: formatPropertyPrice(totalPrice / propertyCount, currency),
  };
}

function persistSearchStateForAuth(drawnPolygon: [number, number][] | null) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, "/search");
  localStorage.setItem(POST_AUTH_MAP_OPEN_KEY, JSON.stringify(true));

  if (drawnPolygon && isValidZoneCoordinates(drawnPolygon)) {
    localStorage.setItem(
      POST_AUTH_LOADED_ZONE_KEY,
      JSON.stringify(drawnPolygon),
    );
  }
}

function mapQueryOperationToValue(value: string | null): OperationTypeValue {
  return getQueryValues(value)
    .map((item) => normalizeText(item))
    .map((item) => {
      switch (item) {
        case "venta":
        case "compra":
        case "en venta":
          return "venta";
        case "alquiler":
        case "en alquiler":
          return "alquiler";
        case "anticretico":
          return "anticretico";
        default:
          return null;
      }
    })
    .filter(
      (item, index, array): item is NonNullable<typeof item> =>
        item !== null && array.indexOf(item) === index,
    );
}

function mapQueryPropertyTypeToIds(
  value: string | null,
  options: TipoInmueble[],
): number[] {
  const normalizedValues = getQueryValues(value).map((item) =>
    normalizeText(item),
  );
  return options
    .filter((option) =>
      normalizedValues.includes(normalizeText(option.nombre_inmueble ?? "")),
    )
    .map((option) => option.id_tipo_inmueble);
}

function getPropertyTypeLabelsFromIds(
  ids: number[],
  options: TipoInmueble[],
): string[] {
  return options
    .filter(
      (option) =>
        ids.includes(option.id_tipo_inmueble) && option.nombre_inmueble,
    )
    .map((option) => option.nombre_inmueble as string);
}

function hasPropertyDiscount(property: Property): boolean {
  return (
    typeof property.previousPrice === "number" &&
    property.previousPrice > property.price
  );
}

function getPropertyDiscountPercent(property: Property): number {
  if (!hasPropertyDiscount(property)) return 0;

  return Math.round(
    ((property.previousPrice! - property.price) / property.previousPrice!) * 100,
  );
}

function sortProperties(properties: Property[], sortBy: string): Property[] {
  const sorted = [...properties];
  sorted.sort((first, second) => {
    switch (sortBy) {
      case "precio-asc":
        return first.price - second.price;
      case "precio-des":
        return second.price - first.price;
      case "rebajas-desc":
        return getPropertyDiscountPercent(second) - getPropertyDiscountPercent(first);
      case "m2-menor":
        return first.terrainArea - second.terrainArea;
      case "m2-mayor":
        return second.terrainArea - first.terrainArea;
      case "fecha-antigua":
        return new Date(first.publishedDateRaw || first.publishedDate).getTime() - new Date(second.publishedDateRaw || second.publishedDate).getTime();
      default:
        if (first.isPromoted && !second.isPromoted) return -1;
        if (!first.isPromoted && second.isPromoted) return 1;
        return new Date(second.publishedDateRaw || second.publishedDate).getTime() - new Date(first.publishedDateRaw || first.publishedDate).getTime();
    }
  });
  return sorted;
}

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function getOperationLabel(value: OperationTypeValue): string {
  if (value.length === 0) return "Todas las Operaciones";
  return operationTypeOptions
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)
    .join(", ");
}

function isRenderableImage(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname !== "example.com";
  } catch {
    return false;
  }
}

function getSafeImages(publication: PublicacionBusqueda): string[] {
  const validImages = (publication.imagenes ?? []).filter(isRenderableImage);
  if (validImages.length > 0) return validImages;
  const fallbackIndex =
    publication.id_publicacion % LOCAL_FALLBACK_IMAGES.length;
  return [LOCAL_FALLBACK_IMAGES[fallbackIndex]];
}

function formatPublishedDate(date: Date | string | null | undefined): string {
  try {
    const publishedDate = date ? (typeof date === "string" ? new Date(date) : date) : new Date();
    if (isNaN(publishedDate.getTime())) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    }

    const day = String(publishedDate.getDate()).padStart(2, '0');
    const month = String(publishedDate.getMonth() + 1).padStart(2, '0');
    const year = publishedDate.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
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
    .join(", ");
 const currentPrice = toNumber(publication.precio);
 const previousPrice = toNumber(publication.precio_anterior);
 const discountPercent =
    previousPrice > currentPrice
      ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
      : 0;

  return {
    id: publication.id_publicacion,
    title: publication.titulo ?? "Sin título",
    type: `${publication.tipo_inmueble ?? "Inmueble"} en ${publication.tipo_operacion ?? getOperationLabel(selectedOperation)}`,
    location: location || "Ubicación no disponible",
    terrainArea: toNumber(publication.superficie),
    bedrooms: publication.habitaciones ?? 0,
    bathrooms: publication.banos ?? 0,
    garajes: publication.garajes ?? 0,
    floors: publication.plantas ?? 0,
    price: currentPrice,
    previousPrice: previousPrice,
    discountPercent: discountPercent,
    /*price: toNumber(publication.precio),*/
    currencySymbol: publication.moneda_simbolo ?? "$us",
    publishedDate: formatPublishedDate(publication.fecha_creacion),
    publishedDateRaw: publication.fecha_creacion,
    whatsappContact: publication.usuario?.telefono ?? "",
    images: getSafeImages(publication),
    usuarioTelefono: publication.usuario?.telefono ?? undefined,
    caracteristicas: publication.caracteristicas || [],
    etiquetas: publication.etiquetas || [],
    isPromoted: publication.es_promocionada ?? false,
  };
}

// ── Pagination component ──
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map((page, idx) => {
        const prev = visiblePages[idx - 1];
        const showEllipsis = prev !== undefined && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-[#C26E5A] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { trackSearch } = useTracking();
  const skipNextZoneUrlLoadRef = useRef(false);
  const lastRecommendationsFetchRef = useRef<number>(0);
  const RECOMMENDATIONS_COOLDOWN_MS = 90 * 1000; // 90 seconds

  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [appliedPriceFilter, setAppliedPriceFilter] =
    useState<AppliedPriceFilter | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [caracteristicasDB, setCaracteristicasDB] = useState<
    SearchCharacteristicOption[]
  >([]);
  const [advancedFilterValues, setAdvancedFilterValues] =
    useState<SearchAdvancedFilterValues>({
    habitaciones: "",
    banos: "",
    piscina: "",
    });
  const [selectedOperation, setSelectedOperation] =
    useState<OperationTypeValue>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<number[]>(
    [],
  );
  const [selectedSort, setSelectedSort] = useState("fecha-reciente");
  const [searchResults, setSearchResults] = useState<PublicacionBusqueda[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isShowingGlobalRecommendations, setIsShowingGlobalRecommendations] = useState(false);
  const [globalRecommendationIds, setGlobalRecommendationIds] = useState<number[]>([]);
  const [globalRecommendationZone, setGlobalRecommendationZone] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileFiltersVisible, setIsMobileFiltersVisible] = useState(false);
  const [advancedFiltersKey, setAdvancedFiltersKey] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [hoveredPos, setHoveredPos] = useState<[number, number] | null>(null);

  // --- Estados para la vista de comparación ---
  const [appView, setAppView] = useState<"listings" | "compare">("listings");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSelectionLoaded, setIsSelectionLoaded] = useState(false);

  const MAX_COMPARE_PROPERTIES = 4;

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const isAlreadySelected = prev.includes(id);

      if (isAlreadySelected) {
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= MAX_COMPARE_PROPERTIES) {
        setToastMessage(
          "El límite máximo de comparación es de 4 propiedades.",
        );
        return prev;
      }

      return [...prev, id];
    });
  };

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Recuperar y guardar seleccion en 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("compareSelectedIds");
      if (saved) {
        try {
          const parsedIds = JSON.parse(saved);

          if (Array.isArray(parsedIds)) {
            setSelectedIds(parsedIds.slice(0, MAX_COMPARE_PROPERTIES));
          }
        } catch (e) {
          console.error("Error parsing saved selected IDs:", e);
          localStorage.removeItem("compareSelectedIds");
        }
      }
      setIsSelectionLoaded(true);
    }
  }, []);

  useEffect(() => {
  const fetchCaracteristicas = async () => {
    try {
      const res = await fetch("/api/etiquetas");
      const payload = await res.json();

      const rawCaracteristicas = Array.isArray(payload)
        ? payload
        : payload.caracteristicas || payload.data || [];

      setCaracteristicasDB(rawCaracteristicas);

      console.log("Características cargadas:", rawCaracteristicas);
    } catch (error) {
      console.error("Error cargando características de la DB:", error);
    }
  };

  fetchCaracteristicas();
}, []);

  useEffect(() => {
    if (isSelectionLoaded && typeof window !== "undefined") {
      localStorage.setItem("compareSelectedIds", JSON.stringify(selectedIds));
    }
  }, [selectedIds, isSelectionLoaded]);

  // Estados de paginación y recomendaciones
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);

  // Estado colapso sidebar desktop (v2)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estados de zona dibujada y fullscreen
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][] | null>(
    null,
  );

  // Datos de usuario y autenticación
  const { user: objUser, isLoading: bolIsAuthLoading } = useAuth();
  const [bolShowAuth, setBolShowAuth] = useState(false);
  const [bolShowProtected, setBolShowProtected] = useState(false);
  const [strAuthMode, setStrAuthMode] = useState<"login" | "register">("login");

  // Modales para zonas
  const [showZoneNameModal, setShowZoneNameModal] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [savedZones, setSavedZones] = useState<SavedZone[]>([]);
  const [defaultZones, setDefaultZones] = useState<DefaultZone[]>([]);
  const [zoneNameError, setZoneNameError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDefaultZones, setShowDefaultZones] = useState(true);
  const [zoneModalMode, setZoneModalMode] = useState<ZoneModalMode>("create");
  const [isZoneMenuOpen, setIsZoneMenuOpen] = useState(false);
  const [isEditingSavedZone, setIsEditingSavedZone] = useState(false);
  const [zonePendingDelete, setZonePendingDelete] = useState<SavedZone | null>(
    null,
  );
  const [shouldAutoEditLoadedZone, setShouldAutoEditLoadedZone] =
    useState(false);

  // Reset page when filters/sort/view change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSort, viewMode, isMapOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchDefaultZones = async () => {
      try {
        const response = await fetch("/api/zonas");
        if (!response.ok) return;

        const payload = await response.json();
        if (!isMounted || !Array.isArray(payload.data)) return;

        setDefaultZones(
          payload.data.filter((zone: DefaultZone) =>
            isValidZoneCoordinates(zone.coordenadas),
          ),
        );
      } catch (error) {
        console.error("Error al cargar zonas predeterminadas:", error);
      }
    };

    void fetchDefaultZones();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!objUser) return;

    let isMounted = true;

    const fetchSavedZones = async () => {
      try {
        const response = await fetch("/api/perfil/mis-zonas", {
          credentials: "include",
        });

        if (!response.ok) return;

        const payload = await response.json();
        if (!isMounted || !Array.isArray(payload.data)) return;

        setSavedZones(
          payload.data.filter((zone: SavedZone) =>
            isValidZoneCoordinates(zone.coordenadas),
          ),
        );
      } catch (error) {
        console.error("Error al cargar zonas guardadas:", error);
      }
    };

    void fetchSavedZones();

    return () => {
      isMounted = false;
    };
  }, [objUser]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      selectedOperation.length > 0 ||
        selectedPropertyTypes.length > 0 ||
        advancedFilterValues.habitaciones ||
        advancedFilterValues.banos ||
        advancedFilterValues.piscina ||
        advancedFilterValues.minSurface !== undefined ||
        advancedFilterValues.maxSurface !== undefined ||
        (advancedFilterValues.caracteristicasIds &&
          advancedFilterValues.caracteristicasIds.length > 0) ||
        appliedPriceFilter?.minPrice !== undefined ||
        appliedPriceFilter?.maxPrice !== undefined ||
        advancedFilterValues.soloOfertas,
    );
  }, [
    advancedFilterValues.banos,
    advancedFilterValues.habitaciones,
    advancedFilterValues.piscina,
    advancedFilterValues.minSurface,
    advancedFilterValues.maxSurface,
    advancedFilterValues.soloOfertas,
    advancedFilterValues.caracteristicasIds,
    appliedPriceFilter?.maxPrice,
    appliedPriceFilter?.minPrice,
    selectedOperation,
    selectedPropertyTypes,
  ]);

  const activeFiltersCount = useMemo(() => {
    return countActiveFilters({
      searchLocation,
      selectedOperation,
      selectedPropertyTypes,
      advancedFilterValues,
      appliedPriceFilter,
    });
  }, [
    searchLocation,
    selectedOperation,
    selectedPropertyTypes,
    advancedFilterValues,
    appliedPriceFilter,
  ]);

  const currentPolygonSignature = useMemo(
    () => (drawnPolygon ? getPolygonSignature(drawnPolygon) : null),
    [drawnPolygon],
  );

  const currentSavedZone = useMemo(
    () =>
      currentPolygonSignature === null
        ? null
        : (savedZones.find(
            (zone) =>
              isValidZoneCoordinates(zone.coordenadas) &&
              getPolygonSignature(zone.coordenadas) === currentPolygonSignature,
          ) ?? null),
    [currentPolygonSignature, savedZones],
  );

  const isCurrentPolygonSaved = currentSavedZone !== null;

  const currentZoneNameError = getZoneNameError(
    zoneName,
    savedZones,
    zoneModalMode === "rename" ? currentSavedZone?.id_mi_zona : undefined,
  );

  useEffect(() => {
    if (shouldAutoEditLoadedZone && currentSavedZone) {
      setIsEditingSavedZone(true);
      setShouldAutoEditLoadedZone(false);
    }
  }, [currentSavedZone, shouldAutoEditLoadedZone]);

  // Filtrar por zona dibujada con Turf.js
  const filteredSearchResults = useMemo(() => {
    if (!drawnPolygon || drawnPolygon.length < MIN_ZONE_POINTS) {
      return searchResults;
    }

    const turfCoords = drawnPolygon.map((p) => [p[1], p[0]]);
    turfCoords.push(turfCoords[0]);
    const searchArea = turf.polygon([turfCoords]);

    return searchResults.filter((pub) => {
      const lat = pub.ubicacion?.latitud;
      const lng = pub.ubicacion?.longitud;
      if (!lat || !lng) return false;
      const pt = turf.point([Number(lng), Number(lat)]);
      return turf.booleanPointInPolygon(pt, searchArea);
    });
  }, [searchResults, drawnPolygon]);

  // Mapear, ordenar y paginar
  const allProperties = useMemo(() => {
    let mapped = filteredSearchResults.map((publication) =>
      mapPublicationToProperty(publication, selectedOperation),
    );

    if (advancedFilterValues.soloOfertas || selectedSort === "rebajas-desc") {
      mapped = mapped.filter(hasPropertyDiscount);
    }

    if (isShowingGlobalRecommendations && globalRecommendationIds.length > 0) {
      return mapped.slice().sort((a, b) => {
        const indexA = globalRecommendationIds.indexOf(a.id);
        const indexB = globalRecommendationIds.indexOf(b.id);

        if (indexA !== -1 && indexB === -1) return -1;
        if (indexA === -1 && indexB !== -1) return 1;
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        return 0;
      });
    }

    if (selectedSort === "mas-recomendados" && recommendedIds.length > 0) {
      return mapped.slice().sort((a, b) => {
        const indexA = recommendedIds.indexOf(a.id);
        const indexB = recommendedIds.indexOf(b.id);

        if (indexA !== -1 && indexB === -1) return -1;
        if (indexA === -1 && indexB !== -1) return 1;
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        return 0;
      });
    }

    return sortProperties(mapped, selectedSort);
  }, [
    filteredSearchResults,
    selectedOperation,
    selectedSort,
    recommendedIds,
    advancedFilterValues.soloOfertas,
    isShowingGlobalRecommendations,
    globalRecommendationIds,
  ]);

  const defaultZonesWithStats = useMemo(
    () =>
      defaultZones.map((zone) => ({
        ...zone,
        stats: getZoneStats(zone.coordenadas, searchResults, selectedCurrency),
      })),
    [defaultZones, searchResults, selectedCurrency],
  );

  const activeDrawnZoneSummary = useMemo(() => {
    if (!drawnPolygon) return null;

    return {
      nombre:
        currentSavedZone?.nombre_zona?.trim() &&
        currentSavedZone.nombre_zona.trim().length > 0
          ? currentSavedZone.nombre_zona.trim()
          : "Zona dibujada",
      stats: getZoneStats(drawnPolygon, searchResults, selectedCurrency),
    };
  }, [currentSavedZone, drawnPolygon, searchResults, selectedCurrency]);

// Paginación con soporte de sidebar colapsado (v2)
  const itemsPerPage = isMapOpen
    ? viewMode === "grid"
      ? ITEMS_PER_PAGE_MAP_GRID
      : ITEMS_PER_PAGE_MAP_LIST
    : viewMode === "grid"
      ? isSidebarCollapsed
        ? 9
        : ITEMS_PER_PAGE_GRID
      : ITEMS_PER_PAGE_LIST;

  const totalPages = Math.max(
    1,
    Math.ceil(allProperties.length / itemsPerPage),
  );

  const displayedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allProperties.slice(start, start + itemsPerPage);
  }, [allProperties, currentPage, itemsPerPage]);

  // Manejadores de autenticación
  const handleOpenLogin = () => {
    persistSearchStateForAuth(drawnPolygon);
    setStrAuthMode("login");
    setBolShowAuth(true);
    setBolShowProtected(false);
  };

  const handleOpenRegister = () => {
    persistSearchStateForAuth(drawnPolygon);
    setStrAuthMode("register");
    setBolShowAuth(true);
    setBolShowProtected(false);
  };

  const handleCloseAuth = () => setBolShowAuth(false);

  const upsertSavedZone = (updatedZone: SavedZone) => {
    setSavedZones((current) => {
      const zoneExists = current.some(
        (zone) => zone.id_mi_zona === updatedZone.id_mi_zona,
      );

      if (!zoneExists) {
        return [updatedZone, ...current];
      }

      return current.map((zone) =>
        zone.id_mi_zona === updatedZone.id_mi_zona ? updatedZone : zone,
      );
    });
  };

  const openCreateZoneModal = () => {
    setZoneModalMode("create");
    setZoneName("");
    setZoneNameError(null);
    setShowZoneNameModal(true);
  };

  const openRenameZoneModal = () => {
    if (!currentSavedZone) return;
    setZoneModalMode("rename");
    setZoneName(currentSavedZone.nombre_zona);
    setZoneNameError(null);
    setShowZoneNameModal(true);
    setIsZoneMenuOpen(false);
  };

  const handleSaveZone = async () => {
    if (!drawnPolygon) return;

    if (isCurrentPolygonSaved) {
      setZoneNameError("Esta zona ya está guardada en tu perfil.");
      return;
    }

    if (currentZoneNameError) {
      setZoneNameError(currentZoneNameError);
      return;
    }

    try {
      const cleanZoneName = zoneName.trim();
      const response = await fetch("/api/perfil/mis-zonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre_zona: cleanZoneName,
          coordenadas: drawnPolygon,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        upsertSavedZone({
          id_mi_zona: data.data.id_mi_zona,
          nombre_zona: data.data.nombre_zona,
          coordenadas: data.data.coordenadas,
          fecha_creacion: data.data.fecha_creacion,
        });
        setShowZoneNameModal(false);
        setZoneName("");
        setZoneNameError(null);
        setShowSuccessModal(true);
      } else {
        console.error("Error from API:", data);
        setZoneNameError(data.error || "No se pudo guardar la zona.");
      }
    } catch (error) {
      console.error("Error:", error);
      setZoneNameError(
        error instanceof Error
          ? error.message
          : "Error desconocido al guardar la zona.",
      );
    }
  };

  const handleRenameZone = async () => {
    if (!currentSavedZone) return;

    if (currentZoneNameError) {
      setZoneNameError(currentZoneNameError);
      return;
    }

    try {
      const response = await fetch("/api/perfil/mis-zonas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_mi_zona: currentSavedZone.id_mi_zona,
          nombre_zona: zoneName.trim(),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        upsertSavedZone(data.data);
        setShowZoneNameModal(false);
        setZoneName("");
        setZoneNameError(null);
      } else {
        setZoneNameError(data.error || "No se pudo cambiar el nombre.");
      }
    } catch (error) {
      console.error("Error al renombrar zona:", error);
      setZoneNameError("Error desconocido al renombrar la zona.");
    }
  };

  const handleUpdateSavedZoneCoordinates = async (
    nextCoordinates: [number, number][],
  ) => {
    if (!currentSavedZone || !isValidZoneCoordinates(nextCoordinates)) return;

    setDrawnPolygon(nextCoordinates);

    try {
      const response = await fetch("/api/perfil/mis-zonas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_mi_zona: currentSavedZone.id_mi_zona,
          coordenadas: nextCoordinates,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        upsertSavedZone(data.data);
      } else {
        console.error("No se pudo actualizar la zona:", data.error);
        setDrawnPolygon(currentSavedZone.coordenadas);
        setIsEditingSavedZone(false);
      }
    } catch (error) {
      console.error("Error al actualizar zona:", error);
      setDrawnPolygon(currentSavedZone.coordenadas);
      setIsEditingSavedZone(false);
    }
  };

  const handleDeleteSavedZone = async () => {
    if (!zonePendingDelete) return;

    try {
      const response = await fetch(
        `/api/perfil/mis-zonas?id_mi_zona=${zonePendingDelete.id_mi_zona}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("No se pudo eliminar la zona:", data.error);
        return;
      }

      setSavedZones((current) =>
        current.filter(
          (zone) => zone.id_mi_zona !== zonePendingDelete.id_mi_zona,
        ),
      );

      if (currentSavedZone?.id_mi_zona === zonePendingDelete.id_mi_zona) {
        setDrawnPolygon(null);
        setIsEditingSavedZone(false);
      }

      setZonePendingDelete(null);
      setIsZoneMenuOpen(false);
    } catch (error) {
      console.error("Error al eliminar zona:", error);
    }
  };

  const handleCloseZoneNameModal = () => {
    setShowZoneNameModal(false);
    setZoneName("");
    setZoneNameError(null);
  };

  const breadcrumbPropertyLabel =
    getPropertyTypeLabelsFromIds(
      selectedPropertyTypes,
      PROPERTY_TYPE_OPTIONS,
    ).join(", ") || "Inmuebles";
  const breadcrumbLocationLabel =
    searchLocation.trim() ||
    (isShowingGlobalRecommendations && globalRecommendationZone
      ? globalRecommendationZone
      : "Bolivia");
  const breadcrumb = `${breadcrumbPropertyLabel} / ${getOperationLabel(selectedOperation)} / ${breadcrumbLocationLabel}`;

  const saveFiltersToUrl = () => {
    const urlParams = new URLSearchParams();
    if (searchLocation) urlParams.set("ciudad", searchLocation);
    if (selectedOperation.length > 0) {
      const selectedOperationLabels = operationTypeOptions
        .filter((option) => selectedOperation.includes(option.value))
        .map((option) => {
          switch (option.value) {
            case "venta":
              return "Venta";
            case "alquiler":
              return "Alquiler";
            case "anticretico":
              return "Anticrético";
          }
        })
        .join(",");
      urlParams.set("operaciones", selectedOperationLabels);
    }
    if (selectedPropertyTypes.length > 0) {
      const labels = getPropertyTypeLabelsFromIds(
        selectedPropertyTypes,
        PROPERTY_TYPE_OPTIONS,
      ).join(",");
      urlParams.set("tipo", labels);
    }
    if (appliedPriceFilter?.minPrice !== undefined)
      urlParams.set("minPrice", appliedPriceFilter.minPrice.toString());
    if (appliedPriceFilter?.maxPrice !== undefined)
      urlParams.set("maxPrice", appliedPriceFilter.maxPrice.toString());
    if (selectedCurrency !== "USD") urlParams.set("currency", selectedCurrency);
    if (selectedSort !== "fecha-reciente") urlParams.set("sort", selectedSort);
    if (
      advancedFilterValues.caracteristicasIds &&
      advancedFilterValues.caracteristicasIds.length > 0
    ) {
      urlParams.set("caracteristicas", advancedFilterValues.caracteristicasIds.join(","));
    }
    window.history.pushState(null, "", `/search?${urlParams.toString()}`);
  };

  const handleApplyRange = (priceFilter: AppliedPriceFilter) =>
    setAppliedPriceFilter(priceFilter);
  const handleCurrencyChange = (currency: Currency) =>
    setSelectedCurrency(currency);
  const handleAdvancedFiltersChange = (values: {
    habitaciones?: string;
    banos?: string;
    piscina?: string;
    minSurface?: string | number;
    maxSurface?: string | number;
  }) => {
    const minSurfaceValue =
      values.minSurface === undefined ? "" : String(values.minSurface);
    const maxSurfaceValue =
      values.maxSurface === undefined ? "" : String(values.maxSurface);

    setAdvancedFilterValues((current) => ({
      ...current,
      habitaciones: values.habitaciones ?? "",
      banos: values.banos ?? "",
      piscina: values.piscina ?? "",
      minSurface:
        minSurfaceValue.trim() === "" ? undefined : Number(minSurfaceValue),
      maxSurface:
        maxSurfaceValue.trim() === "" ? undefined : Number(maxSurfaceValue),
    }));
  };

  const runGlobalLocationRecommendations = async () => {
    setIsApplyingFilters(true);
    try {
      const coordinates = await getBrowserCoordinates();
      const response = await fetch("/api/recommendations/global-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...coordinates,
          limit: 36,
        }),
      });

      const payload = (await response.json()) as GlobalLocationRecommendationsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ?? "No se pudieron consultar las recomendaciones globales",
        );
      }

      const publications = payload.publications ?? [];
      setSearchResults(publications);
      setGlobalRecommendationIds(publications.map((item) => item.id_publicacion));
      setGlobalRecommendationZone(payload.zone ?? null);
      setIsShowingGlobalRecommendations(true);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setGlobalRecommendationIds([]);
      setGlobalRecommendationZone(null);
      setIsShowingGlobalRecommendations(false);
      await runSearch({
        ubicacion: "",
        operacion: undefined,
        tipoInmueble: undefined,
        habitaciones: "",
        banos: "",
        piscina: "",
        minPrice: undefined,
        maxPrice: undefined,
        minSurface: undefined,
        maxSurface: undefined,
        caracteristicasIds: [],
      });
    } finally {
      setIsApplyingFilters(false);
    }
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
        operacion:
          selectedOperation.length > 0
            ? selectedOperation.join(",")
            : undefined,
        tipoInmueble: selectedPropertyLabels.join(","),
        habitaciones: advancedFilterValues.habitaciones,
        banos: advancedFilterValues.banos,
        piscina: advancedFilterValues.piscina,
        minPrice: appliedPriceFilter?.minPrice,
        maxPrice: appliedPriceFilter?.maxPrice,
        minSurface: advancedFilterValues.minSurface,
        maxSurface: advancedFilterValues.maxSurface,
        soloOfertas: Boolean(advancedFilterValues.soloOfertas),
        sort: selectedSort,
        currency: selectedCurrency,
        caracteristicasIds: advancedFilterValues.caracteristicasIds,
        ...overrides,
      };

      const resultados = await buscarPublicaciones(filtros);
      setSearchResults(resultados);
      setGlobalRecommendationIds([]);
      setGlobalRecommendationZone(null);
      setIsShowingGlobalRecommendations(false);
      setHasSearched(true);

      const OPERACION_ID: Record<string, number> = {
        alquiler: 1,
        venta: 2,
        anticretico: 3,
      };

      const trackPayload = {
        texto_busqueda: searchLocation,
        id_tipo_operacion:
          selectedOperation.length === 1
            ? OPERACION_ID[selectedOperation[0]]
            : undefined,
        id_tipo_inmueble:
          selectedPropertyTypes.length === 1
            ? selectedPropertyTypes[0]
            : undefined,
        habitaciones: advancedFilterValues.habitaciones
          ? parseInt(advancedFilterValues.habitaciones)
          : undefined,
        banos: advancedFilterValues.banos
          ? parseInt(advancedFilterValues.banos)
          : undefined,
        precio_min: appliedPriceFilter?.minPrice,
        precio_max: appliedPriceFilter?.maxPrice,
        cant_resultados: resultados.length,
      };
      trackSearch(trackPayload);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // Cargar estado del mapa y zona guardada desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMapState = localStorage.getItem("searchMapOpen");
      if (savedMapState !== null) setIsMapOpen(JSON.parse(savedMapState));

      const loadedZona = localStorage.getItem("loadedZona");
      const editLoadedZona = localStorage.getItem(POST_AUTH_EDIT_ZONE_KEY);
      if (loadedZona) {
        try {
          const coordenadas = JSON.parse(loadedZona);
          if (isValidZoneCoordinates(coordenadas)) {
            setDrawnPolygon(coordenadas);
            setIsDrawingMode(false);
            setIsMapOpen(true);
            setShouldAutoEditLoadedZone(editLoadedZona === "true");
          }
          localStorage.removeItem("loadedZona");
          localStorage.removeItem(POST_AUTH_EDIT_ZONE_KEY);
        } catch (error) {
          console.error("Error al cargar zona:", error);
        }
      }
    }
  }, []);

  // Persistir estado del mapa
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("searchMapOpen", JSON.stringify(isMapOpen));
    }
  }, [isMapOpen]);

  // Ejecutar búsqueda al cambiar URL
  useEffect(() => {
    const nextLocation = searchParams.get("ciudad")?.trim() ?? "";
    const nextOperation = mapQueryOperationToValue(
      searchParams.get("operaciones"),
    );
    const nextPropertyTypes = mapQueryPropertyTypeToIds(
      searchParams.get("tipo"),
      PROPERTY_TYPE_OPTIONS,
    );
    const nextPropertyLabels = getPropertyTypeLabelsFromIds(
      nextPropertyTypes,
      PROPERTY_TYPE_OPTIONS,
    );
    const rawPropertyType = searchParams.get("tipo")?.trim() ?? "";
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const currencyParam = searchParams.get("currency");
    const sortParam = searchParams.get("sort")?.trim();
    const nextSort = sortParam || "fecha-reciente";
    // --- PASO 2: Leer las caracteristicas de la URL (NUEVO) ---
    const caracteristicasParam = searchParams.get("caracteristicas");
    const nextCaracteristicas = caracteristicasParam
      ? caracteristicasParam.split(",").map(Number).filter((n) => !isNaN(n))
      : [];

    const nextMinPrice =
      minPriceParam !== null && minPriceParam.trim() !== ""
        ? Number(minPriceParam)
        : undefined;
    const nextMaxPrice =
      maxPriceParam !== null && maxPriceParam.trim() !== ""
        ? Number(maxPriceParam)
        : undefined;
    const nextCurrency: Currency = currencyParam === "BS" ? "BS" : "USD";

    setAppliedPriceFilter(
      nextMinPrice !== undefined || nextMaxPrice !== undefined
        ? { minPrice: nextMinPrice, maxPrice: nextMaxPrice }
        : null,
    );
    setSelectedCurrency(nextCurrency);
    setSearchLocation(nextLocation);
    setSelectedOperation(nextOperation);
    setSelectedPropertyTypes(nextPropertyTypes);
    setSelectedSort(nextSort);

    // ACTUALIZAMOS EL ESTADO PARA QUE LOS BOTONES DE COLORES SE PINTEN
    setAdvancedFilterValues(prev => ({
      ...prev,
      caracteristicasIds: nextCaracteristicas
    }));

    if (nextSort === "recomendados-zona") {
      if (skipNextZoneUrlLoadRef.current) {
        skipNextZoneUrlLoadRef.current = false;
        return;
      }
      void runGlobalLocationRecommendations();
      return;
    }

    void runSearch({
      ubicacion: nextLocation,
      operacion: nextOperation.length > 0 ? nextOperation.join(",") : undefined,
      tipoInmueble:
        nextPropertyLabels.join(",") || rawPropertyType || undefined,
      minPrice: nextMinPrice,
      maxPrice: nextMaxPrice,
      caracteristicasIds: nextCaracteristicas,
      sort: nextSort,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  // Bloquear scroll del body cuando filtros móvil están abiertos
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileFiltersOpen]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const candidate_ids = searchResults.map((item) => item.id_publicacion);
      
      const response = await fetch("/api/recommendations/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          candidate_ids,
          id_usuario: objUser?.id // Include authenticated user ID
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { id_publicacion: number }[];
        setRecommendedIds(data.map((item) => item.id_publicacion));
        // Update fetch timestamp after successful fetch
        lastRecommendationsFetchRef.current = Date.now();
      } else {
        const errorBody = await response.text();
        console.error("Recommendations request failed:", response.status, errorBody);
        setRecommendedIds([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendedIds([]);
    }
  }, [searchResults, objUser?.id]);

  // Cargar recomendaciones cuando se selecciona ese sort.
  useEffect(() => {
    if (selectedSort === "mas-recomendados") {
      const id = setTimeout(() => void fetchRecommendations(), 0);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => setRecommendedIds([]), 0);
      return () => clearTimeout(id);
    }
  }, [fetchRecommendations, selectedSort]);

  // Refrescar recomendaciones si el usuario interactúa mientras está activo el ordenamiento.
  // Con cooldown de 90 segundos entre refetches.
  useEffect(() => {
    if (selectedSort !== "mas-recomendados") return;
    if (typeof window === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cooldownTimer: ReturnType<typeof setInterval> | null = null;

    const onInteraction = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        // Only refetch if 90 seconds have passed since last fetch
        const timeSinceLastFetch = Date.now() - lastRecommendationsFetchRef.current;
        if (timeSinceLastFetch >= RECOMMENDATIONS_COOLDOWN_MS) {
          void fetchRecommendations();
        }
      }, 650);
    };

    // Also set up a 90-second interval to auto-refetch while on "mas-recomendados"
    cooldownTimer = setInterval(() => {
      if (selectedSort === "mas-recomendados") {
        void fetchRecommendations();
      }
    }, RECOMMENDATIONS_COOLDOWN_MS);

    window.addEventListener("tracking:interaction", onInteraction as EventListener);
    return () => {
      window.removeEventListener("tracking:interaction", onInteraction as EventListener);
      if (timer) clearTimeout(timer);
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  }, [fetchRecommendations, selectedSort]);

  const openMobileFilters = () => {
    setIsMobileFiltersOpen(true);
    requestAnimationFrame(() => setIsMobileFiltersVisible(true));
  };

  const closeMobileFilters = () => {
    setIsMobileFiltersVisible(false);
    setTimeout(() => setIsMobileFiltersOpen(false), 250);
  };

  const handleClearFilters = () => {
    setSearchLocation("");
    setSelectedOperation([]);
    setSelectedPropertyTypes([]);
    setAdvancedFilterValues({
      habitaciones: "",
      banos: "",
      piscina: "",
      minSurface: undefined,
      maxSurface: undefined,
      soloOfertas: false,
      caracteristicasIds: [],
    });
    setAppliedPriceFilter(null);
    setSelectedCurrency("USD");
    setSelectedSort("fecha-reciente");
    setGlobalRecommendationIds([]);
    setGlobalRecommendationZone(null);
    setIsShowingGlobalRecommendations(false);
    setAdvancedFiltersKey((prev) => prev + 1);
    setCurrentPage(1);
    window.history.pushState(null, "", "/search");
    void runSearch({
      ubicacion: "",
      operacion: undefined,
      tipoInmueble: undefined,
      habitaciones: "",
      banos: "",
      piscina: "",
      minPrice: undefined,
      maxPrice: undefined,
      minSurface: undefined,
      maxSurface: undefined,
      caracteristicasIds: [], 
    });
  };

  const handleSort = (sortOption: string) => {
    setSelectedSort(sortOption);

    if (sortOption === "recomendados-zona") {
      skipNextZoneUrlLoadRef.current = true;
      void runGlobalLocationRecommendations();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasSearched || hasActiveFilters) {
        saveFiltersToUrl();
        if (selectedSort === "recomendados-zona") {
          return;
        }
        void runSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchLocation,
    selectedOperation,
    selectedPropertyTypes,
    appliedPriceFilter,
    advancedFilterValues,
    selectedSort,
    selectedCurrency,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full py-3">
      {/* ══════════════════ MOBILE BAR ══════════════════ */}
      <div className="relative z-[60] mb-4 flex items-center justify-between gap-3 border-b pb-3 px-4 lg:hidden">
        <Button
          variant="secondary"
          onClick={openMobileFilters}
          className="h-10 px-3 flex items-center gap-1 text-sm"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          Mostrar Filtros
        </Button>

        <CurrencySwitch
          currentCurrency={selectedCurrency}
          setCurrentCurrency={handleCurrencyChange}
        />

        <div className="flex items-center gap-2 shrink-0">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isMapOpen}
              onChange={() => setIsMapOpen(!isMapOpen)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-checked:bg-[#C26E5A] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
          </label>
          <Map className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* ══════════════════ MOBILE INFO + SORT ══════════════════ */}
      {appView === "listings" && (
        <div className="block lg:hidden px-4 mb-3">
          <nav className="mb-1 text-sm text-gray-500 underline">
            {breadcrumb}
          </nav>
          <h1 className="text-base font-semibold mb-2">
            {allProperties.length} inmuebles disponibles
          </h1>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <SortSelect onSortChange={handleSort} />
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0 justify-end">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-[#C26E5A] text-white" : "bg-gray-200 text-gray-700"}`}
                aria-label="vista grilla"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-[#C26E5A] text-white" : "bg-gray-200 text-gray-700"}`}
                aria-label="vista lista"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MOBILE FILTERS DRAWER ══════════════════ */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className={`absolute inset-0 bg-black/45 transition-opacity duration-250 ease-out ${isMobileFiltersVisible ? "opacity-100" : "opacity-0"}`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 top-[92px] overflow-hidden rounded-t-[28px] bg-[#F6F4EF] transition-all duration-250 ease-out ${isMobileFiltersVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <div className="h-full overflow-y-auto px-4 py-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[32px] font-semibold text-[#2E2E2E]">
                  Filtros
                </h2>
                <button
                  type="button"
                  onClick={closeMobileFilters}
                  className="flex h-10 w-10 items-center justify-center text-[#2E2E2E]"
                  aria-label="Cerrar filtros"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>
              <div className="my-4 h-px bg-[#D8D2C8]" />
              <p className="mb-3 text-sm font-medium text-[#2E2E2E]">
                Filtros Básicos
              </p>
              <div className="space-y-3">
                <SearchAutocomplete
                  value={searchLocation}
                  onChange={setSearchLocation}
                />
                <OperationTypeFilter
                  value={selectedOperation}
                  onChange={setSelectedOperation}
                />
                <FilterTypeProperty
                  tipos={PROPERTY_TYPE_OPTIONS}
                  selected={selectedPropertyTypes}
                  onChange={setSelectedPropertyTypes}
                />

                <CharacteristicsFilter
                  allTags={caracteristicasDB}
                  value={advancedFilterValues}
                  onChange={(values) => setAdvancedFilterValues(values)}
                />

                <AdvancedFilters
                  value={advancedFilterValues}
                  key={advancedFiltersKey}
                  onChange={handleAdvancedFiltersChange}
                />
                <div className="my-4 h-px bg-[#D8D2C8]" />
                <PriceDropdown
                  selectedCurrency={selectedCurrency}
                  appliedPriceFilter={appliedPriceFilter}
                  onCurrencyChange={handleCurrencyChange}
                  onApplyRange={handleApplyRange}
                />
              </div>
              <div className="my-4 h-px bg-[#D8D2C8]" />
              <div className="mt-4 pb-6">
                <ClearFiltersButton
                  hasActiveFilters={hasActiveFilters}
                  activeFiltersCount={activeFiltersCount}
                  onClear={handleClearFilters}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MOBILE RESULTS ══════════════════ */}
      <div className="block lg:hidden px-4">
        {appView === "listings" ? (
          !isMapOpen && (
            <>
              {!hasSearched && isApplyingFilters ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                  Cargando inmuebles...
                </div>
              ) : allProperties.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                  {advancedFilterValues.soloOfertas
                    ? "No hay propiedades en oferta disponibles por el momento."
                    : "No se encontraron inmuebles con los filtros aplicados."}
                </div>
              ) : (
                <>
                  <div className="grid gap-2 grid-cols-1">
                    {displayedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        selectedCurrency={selectedCurrency}
                        viewMode={viewMode}
                        isHovered={hoveredId === property.id}
                        isSelected={selectedIds.includes(property.id)}
                        onToggleCompare={() => toggleSelection(property.id)}
                        onMouseEnter={() => setHoveredId(property.id)}
                        onMouseLeave={() => {}}
                        onClick={() => {}}
                        isMapOpen={isMapOpen}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )
              }
            </>
          )
        ) : (
          <CompareTable
            properties={allProperties}
            selectedCurrency={selectedCurrency}
            selectedIds={selectedIds}
            onBack={() => setAppView("listings")}
          />
        )}
      </div>

      {/* ══════════════════ MOBILE MAP ══════════════════ */}
      {isMapOpen && appView === "listings" && (
        <div className="fixed inset-x-0 bottom-0 top-[140px] z-40 lg:hidden">
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[998]">
            {!drawnPolygon ? (
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg ${
                  isDrawingMode
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-[#C26E5A] hover:bg-[#b05e4a]"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
                  />
                </svg>
                {isDrawingMode ? "Cancelar dibujo" : "Dibujar zona"}
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl bg-white p-3 border border-gray-200 shadow-lg">
                <span className="text-sm font-medium text-slate-900 text-center">
                  Zona aplicada: {allProperties.length} inmuebles
                </span>
                <button
                  onClick={() => {
                    if (!objUser) {
                      setBolShowProtected(true);
                      return;
                    }
                    if (isCurrentPolygonSaved) return;
                    openCreateZoneModal();
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
                    isCurrentPolygonSaved
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-[#C26E5A] hover:bg-[#b05e4a]"
                  }`}
                  disabled={isCurrentPolygonSaved}
                >
                  {isCurrentPolygonSaved ? "Zona ya guardada" : "Guardar en mi Perfil"}
                </button>
                <button
                  onClick={() => {
                    setDrawnPolygon(null);
                    setIsDrawingMode(false);
                    setIsEditingSavedZone(false);
                    setIsZoneMenuOpen(false);
                  }}
                  className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
                >
                  Limpiar mapa
                </button>
              </div>
            )}
          </div>

          <SearchMapClient
            locations={
              isDrawingMode
                ? []
                : convertPublicacionesToLocations(
                    filteredSearchResults,
                    selectedCurrency,
                  )
            }
            defaultZones={defaultZonesWithStats}
            drawnZoneSummary={activeDrawnZoneSummary}
            showDefaultZones={showDefaultZones}
            onToggleDefaultZones={setShowDefaultZones}
            hoveredId={hoveredId}
            selectedPos={selectedPos}
            hoveredPos={hoveredPos}
            setSelectedPos={setSelectedPos}
            isDrawingMode={isDrawingMode}
            drawnPolygon={drawnPolygon}
            isEditingPolygon={isEditingSavedZone && Boolean(currentSavedZone)}
            onPolygonEdit={handleUpdateSavedZoneCoordinates}
            onPolygonComplete={(points: [number, number][]) => {
              setDrawnPolygon(points);
              setIsDrawingMode(false);
            }}
          />
        </div>
      )}

      {/* ══════════════════ DESKTOP LAYOUT ══════════════════ */}
      <div className="hidden lg:flex items-stretch min-h-screen">

        {/* ── Sidebar filtros (colapsable - v2) ── */}
        <aside
          className={`relative shrink-0 border-r border-gray-200 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed
              ? "w-0 px-0 pt-0 overflow-visible"
              : "w-[280px] xl:w-[320px] px-4 pt-6"
          }`}
        >
          {/* Pestaña para reabrir cuando está colapsado */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute left-0 top-24 z-10 flex flex-col items-center justify-center gap-1 rounded-r-xl bg-[#C26E5A] px-1.5 py-4 text-white shadow-md hover:bg-[#b05e4a] transition-colors"
              title="Mostrar filtros"
              aria-label="Mostrar filtros"
            >
              <ChevronRight className="h-4 w-4" />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                Filtros
              </span>
            </button>
          )}

          {/* Contenido del sidebar */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed
                ? "invisible opacity-0 w-0 overflow-hidden"
                : "visible opacity-100 w-full"
            }`}
          >
            <div className="sticky top-6">
              {/* Controles de zona dibujada */}
              <div className="mb-4">
                {!drawnPolygon ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsDrawingMode(!isDrawingMode);
                        if (!isMapOpen) setIsMapOpen(true);
                      }}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                        isDrawingMode
                          ? "bg-slate-800 hover:bg-slate-900"
                          : "bg-[#C26E5A] hover:bg-[#b05e4a]"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
                        />
                      </svg>
                      {isDrawingMode ? "Cancelar dibujo" : "Dibujar zona"}
                    </button>

                    {savedZones.length > 0 && (
                      <select
                        value={currentSavedZone?.id_mi_zona?.toString() ?? ""}
                        onChange={(event) => {
                          const selectedZone = savedZones.find(
                            (zone) =>
                              zone.id_mi_zona.toString() === event.target.value,
                          );

                          if (!selectedZone) return;

                          setDrawnPolygon(selectedZone.coordenadas);
                          setIsDrawingMode(false);
                          setIsEditingSavedZone(false);
                          setIsZoneMenuOpen(false);
                          if (!isMapOpen) setIsMapOpen(true);

                          if (typeof window !== "undefined") {
                            localStorage.setItem(
                              POST_AUTH_LOADED_ZONE_KEY,
                              JSON.stringify(selectedZone.coordenadas),
                            );
                          }
                        }}
                        className="w-full rounded-xl border border-[#D8D2C8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-[#C26E5A] focus:outline-none"
                      >
                        <option value="">Mis zonas guardadas</option>
                        {savedZones.map((zone) => (
                          <option
                            key={zone.id_mi_zona}
                            value={zone.id_mi_zona.toString()}
                          >
                            {zone.nombre_zona}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 rounded-xl bg-white p-3 border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-slate-900 text-center">
                      Zona aplicada: {allProperties.length} inmuebles
                    </span>
                    <button
                      onClick={() => {
                        if (!objUser) {
                          setBolShowProtected(true);
                          return;
                        }
                        if (isCurrentPolygonSaved) return;
                        openCreateZoneModal();
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
                        isCurrentPolygonSaved
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-[#C26E5A] hover:bg-[#b05e4a]"
                      }`}
                      disabled={isCurrentPolygonSaved}
                    >
                      {isCurrentPolygonSaved ? "Zona ya guardada" : "Guardar en mi Perfil"}
                    </button>
                    <button
                      onClick={() => {
                        setDrawnPolygon(null);
                        setIsDrawingMode(false);
                        setIsEditingSavedZone(false);
                        setIsZoneMenuOpen(false);
                      }}
                      className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
                    >
                      Limpiar mapa
                    </button>
                  </div>
                )}
              </div>

              <div className="flex h-[min(604px,calc(100vh_-_120px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                {/* Título Filtros + botón ocultar */}
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#2E2E2E]">Filtros</h2>
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold  border  text-[#C26E5A] hover:bg-[#C26E5A]/10 transition-colors"
                    title="Ocultar filtros"
                    aria-label="Ocultar filtros"
                  >
                    Ocultar
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex mb-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMapOpen}
                        onChange={() => setIsMapOpen(!isMapOpen)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C26E5A]" />
                    </label>
                    <span className="text-sm font-medium text-gray-700">
                      Mapa
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-[#C26E5A] text-white" : "bg-gray-200 text-gray-700"}`}
                      aria-label="vista grilla"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-[#C26E5A] text-white" : "bg-gray-200 text-gray-700"}`}
                      aria-label="vista lista"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="my-3 h-px bg-[#F4EFE6]" />
                <SearchAutocomplete
                  value={searchLocation}
                  onChange={setSearchLocation}
                />
                <div className="my-3 h-px bg-[#F4EFE6]" />

                <div className="min-h-0 flex-1">
                  <ScrollArea className="h-full pr-3">
                    <OperationTypeFilter
                      value={selectedOperation}
                      onChange={setSelectedOperation}
                    />

                    <FilterTypeProperty
                      tipos={PROPERTY_TYPE_OPTIONS}
                      selected={selectedPropertyTypes}
                      onChange={setSelectedPropertyTypes}
                    />

                    <CharacteristicsFilter
                      allTags={caracteristicasDB}
                      value={advancedFilterValues}
                      onChange={(values) => setAdvancedFilterValues(values)}
                    />

                    <AdvancedFilters
                      value={advancedFilterValues}
                      key={advancedFiltersKey}
                      onChange={handleAdvancedFiltersChange}
                    />

                    <div className="my-3 h-px bg-[#F4EFE6]" />

                    <PriceDropdown
                      selectedCurrency={selectedCurrency}
                      appliedPriceFilter={appliedPriceFilter}
                      onCurrencyChange={handleCurrencyChange}
                      onApplyRange={handleApplyRange}
                    />
                  </ScrollArea>
                </div>

                <div className="mt-3 shrink-0 border-t border-[#F4EFE6] bg-white pt-3">
                  <ClearFiltersButton
                    hasActiveFilters={hasActiveFilters}
                    activeFiltersCount={activeFiltersCount}
                    onClear={handleClearFilters}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Results area ── */}
        <main
          className={`flex flex-col pt-6 pl-4 flex-1 min-w-0 ${
            isMapOpen ? "pr-2" : "pr-4"
          }`}
        >
          {appView === "listings" ? (
            <>
              <div
                className={`mb-3 flex shrink-0 gap-3 ${
                  isMapOpen
                    ? "flex-col items-start"
                    : "items-center justify-between"
                }`}
              >
                <div className="min-w-0">
                  <nav className="mb-0.5 text-sm text-gray-500">
                    {breadcrumb}
                  </nav>

                  <h1 className="text-base font-semibold leading-snug">
                    {allProperties.length} inmuebles disponibles
                  </h1>
                </div>

                <div className={isMapOpen ? "w-full" : "shrink-0"}>
                  <SortSelect onSortChange={handleSort} />
                </div>
              </div>

              <div className="flex-1">
                {!hasSearched && isApplyingFilters ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                    Cargando inmuebles...
                  </div>
                ) : allProperties.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                    No se encontraron inmuebles con los filtros aplicados.
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-2 ${
                        isMapOpen
                          ? "grid-cols-1"
                          : viewMode === "grid"
                            ? isSidebarCollapsed
                              ? "grid-cols-3"
                              : "grid-cols-2"
                            : "grid-cols-1"
                      }`}
                    >
                      {displayedProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          selectedCurrency={selectedCurrency}
                          viewMode={viewMode}
                          isHovered={hoveredId === property.id}
                          isSelected={selectedIds.includes(property.id)}
                          onToggleCompare={() => toggleSelection(property.id)}
                          isMapOpen={isMapOpen}
                          onMouseEnter={() => {
                            setHoveredId(property.id);
                            const loc = searchResults.find(
                              (p) => p.id_publicacion === property.id,
                            )?.ubicacion;
                            const lat = Number(loc?.latitud);
                            const lng = Number(loc?.longitud);
                            if (isValidLatLng(lat, lng))
                              setHoveredPos([lat, lng]);
                          }}
                          onMouseLeave={() => {}}
                          onClick={() => {
                            setHoveredId(property.id);
                            const loc = searchResults.find(
                              (p) => p.id_publicacion === property.id,
                            )?.ubicacion;
                            const lat = Number(loc?.latitud);
                            const lng = Number(loc?.longitud);
                            if (isValidLatLng(lat, lng)) {
                              setHoveredPos([lat, lng]);
                              setSelectedPos([lat, lng]);
                            }
                          }}
                        />
                      ))}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <CompareTable
              properties={allProperties}
              selectedCurrency={selectedCurrency}
              selectedIds={selectedIds}
              onBack={() => setAppView("listings")}
            />
          )}
        </main>

        {/* ── Map panel (fullscreen + drawing controls) ── */}
        {isMapOpen && appView === "listings" && (
          <div
            className={`${
              isMapFullscreen
                ? "fixed inset-0 z-[200]"
                : "shrink-0 sticky top-0 self-start"
            }`}
            style={
              !isMapFullscreen
                ? {
                    width: isSidebarCollapsed
                      ? "calc(70% - 40px)"
                      : "calc(50% - 40px)",
                    height: "90vh",
                  }
                : undefined
            }
          >
            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="absolute top-3 right-3 z-[999] flex items-center justify-center h-9 w-9 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
              title={isMapFullscreen ? "Compactar mapa" : "Expandir mapa"}
            >
              {isMapFullscreen ? (
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>

            {currentSavedZone && (
              <div className="absolute left-3 top-3 z-[999]">
                <div className="relative">
                  <button
                    onClick={() => setIsZoneMenuOpen((current) => !current)}
                    className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md transition-colors hover:bg-white"
                  >
                    <Menu className="h-4 w-4" />
                    {currentSavedZone.nombre_zona}
                  </button>

                  {isZoneMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      <button
                        onClick={() => {
                          setIsEditingSavedZone((current) => !current);
                          setIsZoneMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                        {isEditingSavedZone ? "Terminar edicion" : "Editar zona"}
                      </button>
                      <button
                        onClick={openRenameZoneModal}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Type className="h-4 w-4" />
                        Cambiar nombre
                      </button>
                      <button
                        onClick={() => {
                          setZonePendingDelete(currentSavedZone);
                          setIsZoneMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar zona
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEditingSavedZone && currentSavedZone && (
              <div className="absolute left-3 top-16 z-[999] rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md">
                Selecciona un punto y arrastralo a su nueva posicion.
              </div>
            )}

            <SearchMapClient
              key={isMapFullscreen ? "fullscreen" : "normal"}
              locations={
                isDrawingMode
                  ? []
                  : convertPublicacionesToLocations(
                      filteredSearchResults,
                      selectedCurrency,
                    )
              }
              defaultZones={defaultZonesWithStats}
              drawnZoneSummary={activeDrawnZoneSummary}
              showDefaultZones={showDefaultZones}
              hoveredId={hoveredId}
              selectedPos={selectedPos}
              hoveredPos={hoveredPos}
              setSelectedPos={setSelectedPos}
              isDrawingMode={isDrawingMode}
              drawnPolygon={drawnPolygon}
              isEditingPolygon={isEditingSavedZone && Boolean(currentSavedZone)}
              onPolygonEdit={handleUpdateSavedZoneCoordinates}
              onPolygonComplete={(points: [number, number][]) => {
                setDrawnPolygon(points);
                setIsDrawingMode(false);
              }}
              onToggleDefaultZones={setShowDefaultZones}
            />
          </div>
        )}
      </div>

      {/* ══════════════════ FLOATING BAR DE COMPARACIÓN ══════════════════ */}
      {appView === "listings" && selectedIds.length > 0 && (
        <CompareFloatingBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onCompare={() => setAppView("compare")}
        />
      )}
      {toastMessage && (
        <div className="fixed bottom-28 left-1/2 z-[9999] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* ══════════════════ MODALES ══════════════════ */}

      {bolShowProtected && (
        <ProtectedFeatureModal
          isOpen={bolShowProtected}
          featureName="guardar zonas en tu perfil"
          onClose={() => setBolShowProtected(false)}
          onLoginClick={handleOpenLogin}
          onRegisterClick={handleOpenRegister}
        />
      )}

      {bolShowAuth && (
        <AuthModal
          isOpen={bolShowAuth}
          initialMode={strAuthMode}
          onClose={handleCloseAuth}
        />
      )}

      {showZoneNameModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4 text-slate-800 uppercase tracking-tight">
              {zoneModalMode === "rename"
                ? "Cambiar nombre"
                : "Nombre de la zona"}
            </h3>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => {
                setZoneName(e.target.value);
                setZoneNameError(
                  getZoneNameError(
                    e.target.value,
                    savedZones,
                    zoneModalMode === "rename"
                      ? currentSavedZone?.id_mi_zona
                      : undefined,
                  ),
                );
              }}
              placeholder="Ingresa el nombre de la zona"
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                zoneNameError ? "mb-2 border-red-400" : "mb-6 border-slate-300"
              }`}
            />
            {zoneNameError && (
              <p className="mb-4 text-left text-sm font-medium text-red-500">
                {zoneNameError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCloseZoneNameModal}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={
                  zoneModalMode === "rename" ? handleRenameZone : handleSaveZone
                }
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  currentZoneNameError ||
                  (zoneModalMode === "create" && isCurrentPolygonSaved)
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                }`}
                disabled={
                  Boolean(currentZoneNameError) ||
                  (zoneModalMode === "create" && isCurrentPolygonSaved)
                }
              >
                {zoneModalMode === "rename" ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {zonePendingDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-300">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">
              Eliminar zona
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              Se eliminara la zona{" "}
              <span className="font-semibold text-slate-700">
                {zonePendingDelete.nombre_zona}
              </span>
              . Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setZonePendingDelete(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSavedZone}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center animate-in zoom-in-95 duration-200">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 uppercase tracking-tight">
              Zona guardada
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Se guardó la zona correctamente en tu perfil.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
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
