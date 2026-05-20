"use client";

import { useCallback, useEffect, useRef, memo } from "react";
import Image from "next/image";
import {
  MapPin,
  BedDouble,
  Bath,
  CalendarDays,
  Square,
  ArrowRight,
  Check,
  ArrowRightLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCardViewTracking, useTracking } from "@/components/hooks/useTracking";
import { useDollarRate } from "@/components/hooks/getDollarRate";

type Currency = "USD" | "BS";

const FALLBACK_PROPERTY_IMAGE = "/casa1.jpg";

export interface Property {
  id: number;
  title: string;
  type: string;
  location: string;
  terrainArea: number;
  constructionArea?: number;
  bedrooms: number;
  bathrooms: number;
  garajes?: number;
  floors?: number;
  price: number;
  previousPrice?: number | null;
  discountPercent?: number;
  currencySymbol: string;
  publishedDate: string;
  whatsappContact: string;
  images: string[];
  usuarioTelefono?: string;
  etiquetas?: { id: number; nombre: string; color: string }[];
  caracteristicas?: { id: number; nombre: string }[];
  isPromoted?: boolean;
}

interface PropertyCardProps {
  property: Property;
  selectedCurrency: Currency;
  viewMode?: "grid" | "list";
  isMapOpen?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
  isCompareDisabled?: boolean;
  onToggleCompare?: () => void;
  onCaracteristicaClick?: (idCaracteristica: number) => void;
  selectedCaracteristicasIds?: number[];
}

function getSafePropertyImages(images: string[] | undefined): string[] {
  if (!Array.isArray(images)) return [FALLBACK_PROPERTY_IMAGE];

  const validImages = images.filter((image) => Boolean(image?.trim()));

  return validImages.length > 0 ? validImages : [FALLBACK_PROPERTY_IMAGE];
}

function getValidDiscountPercent(
  price: number,
  previousPrice?: number | null,
  discountPercent?: number,
): number {
  if (
    typeof previousPrice !== "number" ||
    !Number.isFinite(previousPrice) ||
    !Number.isFinite(price) ||
    previousPrice <= price
  ) {
    return 0;
  }

  if (
    typeof discountPercent === "number" &&
    Number.isFinite(discountPercent) &&
    discountPercent > 0
  ) {
    return discountPercent;
  }

  return Math.round(((previousPrice - price) / previousPrice) * 100);
}

function PropertyCard({
  property,
  selectedCurrency,
  viewMode = "grid",
  isMapOpen = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isSelected = false,
  isCompareDisabled = false,
  onToggleCompare,
  onCaracteristicaClick,
  selectedCaracteristicasIds = [],
}: PropertyCardProps) {
  const { trackEvent } = useTracking();
  const { compra } = useDollarRate();

  const handleCaracteristicaClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    idCaracteristica?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!idCaracteristica) return;

    onCaracteristicaClick?.(idCaracteristica);
  };

  const propertyImages = getSafePropertyImages(property.images);
  const mainImage = propertyImages[0];

  const canHover =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const hoverStartAt = useRef<number | null>(null);
  const hasHovered = useRef(false);
  const hasIgnored = useRef(false);
  const ignoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIgnoreTimer = useCallback(() => {
    if (ignoreTimer.current) {
      clearTimeout(ignoreTimer.current);
      ignoreTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearIgnoreTimer();
  }, [clearIgnoreTimer]);

  const scheduleIgnoreIfNeeded = useCallback(() => {
    if (!canHover) return;

    clearIgnoreTimer();

    ignoreTimer.current = setTimeout(() => {
      if (hasHovered.current || hasIgnored.current) return;

      hasIgnored.current = true;
      trackEvent(property.id, "ignorar");
    }, 30_000);
  }, [canHover, clearIgnoreTimer, property.id, trackEvent]);

  const viewRef = useCardViewTracking(property.id, 0, () => {
    scheduleIgnoreIfNeeded();
  });

  const handleMouseEnter = useCallback(() => {
    if (canHover) {
      hasHovered.current = true;
      hoverStartAt.current = Date.now();
      clearIgnoreTimer();
    }

    onMouseEnter?.();
  }, [canHover, clearIgnoreTimer, onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    if (canHover) {
      const start = hoverStartAt.current;
      hoverStartAt.current = null;
      clearIgnoreTimer();

      if (start != null) {
        const duration = Math.max(0, Date.now() - start);
        trackEvent(property.id, "hover", { duracion_ms: duration });
      }
    }

    onMouseLeave?.();
  }, [canHover, clearIgnoreTimer, onMouseLeave, property.id, trackEvent]);

  const handleOpenDetail = useCallback(() => {
    window.open(`/publicacion/Vista_del_Inmueble/${property.id}`, "_blank");
    trackEvent(property.id, "click");
    onClick?.();
  }, [onClick, property.id, trackEvent]);

  const exchangeRate = compra ?? 6.96;

  const convertedPrice =
    selectedCurrency === "USD"
      ? property.price
      : Math.round(property.price * exchangeRate * 100) / 100;

  const displayCurrencySymbol = selectedCurrency === "USD" ? "$us" : "Bs";

  const displayPrice = `${displayCurrencySymbol} ${convertedPrice.toLocaleString(
    "es-BO",
  )}`;

  const discountPercent = getValidDiscountPercent(
    property.price,
    property.previousPrice,
    property.discountPercent,
  );

  const hasDiscount = discountPercent > 0;

  const convertedPreviousPrice =
    hasDiscount && selectedCurrency === "USD"
      ? property.previousPrice!
      : hasDiscount
        ? Math.round(property.previousPrice! * exchangeRate * 100) / 100
        : null;

  const displayPreviousPrice = convertedPreviousPrice
    ? `${displayCurrencySymbol} ${convertedPreviousPrice.toLocaleString(
        "es-BO",
      )}`
    : null;

  const DiscountBadge = () =>
    hasDiscount ? (
      <span className="absolute left-2 top-2 z-[70] rounded-md bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white shadow">
        -{discountPercent}%
      </span>
    ) : null;

  const PriceBlock = ({ className = "" }: { className?: string }) => (
    <div className="flex min-w-0 flex-col">
      {hasDiscount && displayPreviousPrice && (
        <span className="truncate text-xs text-gray-400 line-through">
          {displayPreviousPrice}
        </span>
      )}

      <span className={className}>{displayPrice}</span>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div
        ref={viewRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleOpenDetail}
        className={`relative group flex w-full cursor-pointer flex-row items-center gap-2 overflow-hidden rounded-xl border-2 bg-white p-1 shadow-sm transition-all hover:shadow-md sm:gap-4 sm:p-3 ${
          isSelected
            ? "border-[#C26E5A] ring-1 ring-[#C26E5A]/30 shadow-md bg-orange-50/10"
            : isHovered
              ? "border-[#C26E5A] bg-orange-50/30 shadow-lg"
              : "border-transparent"
        }`}
      >
        <div className="relative h-[75px] w-[90px] shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-[85px] sm:w-[130px]">
          <DiscountBadge />

          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                if (isCompareDisabled) return;

                onToggleCompare();
              }}
              disabled={isCompareDisabled}
              className={`absolute top-1 right-1 z-[30] p-1.5 shrink-0 
                rounded-md backdrop-blur border shadow-sm transition-all hover:scale-105 
                ${!isMapOpen ? "flex sm:hidden" : "flex"} 
                ${
                  isSelected
                    ? "bg-[#1a2b4c] text-white border border-[#1a2b4c]"
                    : isCompareDisabled
                      ? "bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70"
                      : "bg-white/95 text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              title={
                isSelected
                  ? "Quitar de comparación"
                  : "Seleccionar para comparar"
              }
            >
              {isSelected ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={3} />
              ) : (
                <ArrowRightLeft
                  className="h-3 w-3 sm:h-4 sm:w-4"
                  strokeWidth={2}
                />
              )}
            </button>
          )}

          <Image
            src={mainImage}
            alt={`Imagen de ${property.title}`}
            width={160}
            height={120}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-lg border-gray-200 p-1 sm:hidden">
          <div className="flex items-start justify-between">
            <PriceBlock className="truncate text-[17px] font-bold leading-tight text-gray-950" />
            <ArrowRight
              className="h-5 w-5 shrink-0 text-gray-400"
              strokeWidth={1.5}
            />
          </div>

          <span className="block truncate text-[13px] font-medium text-gray-500">
            {property.type}
          </span>

          <h3 className="mb-0.5 truncate text-[11px] font-semibold text-[#a67c52]">
            {property.title}
          </h3>

          <p className="mb-0.5 flex items-center gap-1 truncate text-[10px] text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{property.location}</span>
          </p>

          <p className="truncate text-[10px] font-medium text-gray-400">
            {property.terrainArea.toLocaleString("es-BO")} m² Terreno /{" "}
            {property.bathrooms} Baños
          </p>

          <div className="mt-1 flex flex-wrap gap-1">
            {property.caracteristicas?.map((caracteristica: any, index: number) => {
              const caracteristicaId = caracteristica?.id;
              const caracteristicaNombre = caracteristica?.nombre || caracteristica;
              const isCaracteristicaSelected =
                typeof caracteristicaId === "number" &&
                selectedCaracteristicasIds.includes(caracteristicaId);

              return (
                <button
                  key={`${caracteristicaId ?? caracteristicaNombre}-mobile-${index}`}
                  type="button"
                  onClick={(event) =>
                    handleCaracteristicaClick(event, caracteristicaId)
                  }
                  className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase transition ${
                    isCaracteristicaSelected
                      ? "bg-[#1F3A4D] text-white"
                      : "bg-[#6B7280] text-white hover:bg-[#1F3A4D]"
                  }`}
                  title={`Filtrar por ${caracteristicaNombre}`}
                >
                  {caracteristicaNombre}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center overflow-hidden sm:flex">
          <div
            className={`flex shrink-0 flex-col justify-center overflow-hidden ${
              isMapOpen ? "w-[100px] xl:w-[130px] pr-2" : "w-[200px] pr-4"
            }`}
          >
            {property.isPromoted && (
              <span className="mb-2 inline-block w-fit rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-white">
                DESTACADO
              </span>
            )}

            <PriceBlock
              className={`font-bold leading-tight text-gray-950 ${
                isMapOpen ? "text-[14px] xl:text-[15px]" : "text-[18px]"
              }`}
            />

            <span
              className={`mt-0.5 font-medium text-gray-500 ${
                isMapOpen ? "text-[10px] xl:text-[11px]" : "text-[12px]"
              }`}
            >
              {property.type}
            </span>
          </div>

          <div
            className={`flex min-w-0 flex-1 flex-col justify-center ${
              isMapOpen ? "pl-1 xl:pl-2" : "border-l border-gray-200 pl-4"
            }`}
          >
            <h3
              className={`font-semibold text-[#a67c52] transition-colors group-hover:text-[#C26E5A] ${
                isMapOpen
                  ? "mb-0.5 text-[12px] xl:text-[13px]"
                  : "mb-1 text-[14px]"
              }`}
            >
              {property.title}
            </h3>

            <p
              className={`flex items-center gap-1 truncate text-gray-500 ${
                isMapOpen
                  ? "mb-0.5 text-[10px] xl:text-[11px]"
                  : "mb-1 text-[12px]"
              }`}
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.location}</span>
            </p>

            <p
              className={`flex items-center gap-1 truncate font-medium text-gray-400 ${
                isMapOpen ? "text-[10px] xl:text-[11px]" : "text-[12px]"
              }`}
            >
              <Square className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">
                {property.terrainArea.toLocaleString("es-BO")} m²{" "}
                {isMapOpen ? "" : "Terreno"}
              </span>

              {!isMapOpen && (
                <>
                  <span className="mx-1">/</span>
                  <Bath className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {property.bathrooms}{" "}
                  <span className="hidden xl:inline">Baños</span>

                  <span className="mx-1">/</span>
                  <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {property.bedrooms}{" "}
                  <span className="hidden xl:inline">Rec.</span>
                </>
              )}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {property.caracteristicas?.map((caracteristica: any, index: number) => {
                const caracteristicaId = caracteristica?.id;
                const caracteristicaNombre = caracteristica?.nombre || caracteristica;
                const isCaracteristicaSelected =
                  typeof caracteristicaId === "number" &&
                  selectedCaracteristicasIds.includes(caracteristicaId);

                return (
                  <button
                    key={`${caracteristicaId ?? caracteristicaNombre}-list-${index}`}
                    type="button"
                    onClick={(event) =>
                      handleCaracteristicaClick(event, caracteristicaId)
                    }
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm transition ${
                      isCaracteristicaSelected
                        ? "bg-[#1F3A4D] text-white"
                        : "bg-[#6B7280] text-white hover:bg-[#1F3A4D]"
                    }`}
                    title={`Filtrar por ${caracteristicaNombre}`}
                  >
                    {caracteristicaNombre}
                  </button>
                );
              })}
            </div>
          </div>

          {onToggleCompare && !isMapOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleCompare();
              }}
              className={`right-2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 
                sm:py-1.5 rounded-full text-[13px] sm:text-xs font-bold transition-all 
                shadow-md hover:scale-105 ${
                  isSelected
                    ? "bg-[#1a2b4c] text-white border border-[#1a2b4c]"
                    : "bg-white/95 text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              title={
                isSelected
                  ? "Quitar de comparación"
                  : "Seleccionar para comparar"
              }
            >
              {isSelected ? (
                <>
                  <Check
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                    strokeWidth={3}
                  />
                  <span className="hidden text-[15px] sm:inline">
                    SELECCIONADO
                  </span>
                </>
              ) : (
                <>
                  <ArrowRightLeft
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                    strokeWidth={2}
                  />
                  <span className="hidden text-[15px] sm:inline">
                    {isCompareDisabled ? "LÍMITE" : "COMPARAR"}
                  </span>
                </>
              )}
            </button>
          )}

          <div className="flex shrink-0 items-center justify-end pl-4">
            <ArrowRight
              className="h-6 w-6 text-[#a67c52] transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOpenDetail}
      className={`relative group flex h-auto min-h-[12rem] cursor-pointer flex-row overflow-hidden rounded-xl border-2 bg-white shadow-sm outline-none transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-[#a67c52] sm:h-48 ${
        isSelected
          ? "border-[#C26E5A] ring-1 ring-[#C26E5A]/30 shadow-md bg-orange-50/10"
          : isHovered
            ? "border-[#C26E5A] bg-orange-50/30 shadow-lg"
            : "border-gray-100"
      }`}
    >
      <div className="relative h-48 w-2/5 shrink-0 overflow-hidden sm:w-1/3">
        <DiscountBadge />

        {onToggleCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleCompare();
            }}
            className={`absolute top-2 right-2 z-[30] flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md hover:scale-105 ${
              isSelected
                ? "bg-[#1a2b4c] text-white border border-[#1a2b4c]"
                : "bg-white/95 text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
            title={
              isSelected
                ? "Quitar de comparación"
                : "Seleccionar para comparar"
            }
          >
            {isSelected ? (
              <>
                <Check
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  strokeWidth={3}
                />
                <span>SELECCIONADO</span>
              </>
            ) : (
              <>
                <ArrowRightLeft
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  strokeWidth={2.5}
                />
                <span>{isCompareDisabled ? "LÍMITE" : "COMPARAR"}</span>
              </>
            )}
          </button>
        )}

        <Carousel className="h-full w-full">
          <CarouselContent className="-ml-0 h-full">
            {propertyImages.map((img, index) => (
              <CarouselItem key={`${img}-${index}`} className="basis-full pl-0">
                <Image
                  src={img}
                  alt={`Imagen ${index + 1} de ${property.title}`}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {propertyImages.length > 1 && (
            <>
              <CarouselPrevious className="pointer-events-auto absolute left-1 top-1/2 z-20 h-6 w-6 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white sm:h-7 sm:w-7" />
              <CarouselNext className="pointer-events-auto absolute right-1 top-1/2 z-20 h-6 w-6 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white sm:h-7 sm:w-7" />
            </>
          )}
        </Carousel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden p-3 sm:p-4">
        <div>
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8c6c4c] sm:text-[11px]">
            {property.type}
          </p>

          <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#a67c52] sm:text-base">
            {property.title}
          </h3>

          <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-gray-500 sm:text-[11px]">
            <MapPin className="h-3 w-3 shrink-0" />
            {property.location}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-gray-700 sm:text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <Square className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">
                {property.terrainArea.toLocaleString("es-BO")} m²
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <BedDouble className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{property.bedrooms} Rec.</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Bath className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{property.bathrooms} Baños</span>
            </div>
          </div>

          {property.caracteristicas && property.caracteristicas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.caracteristicas.map((caracteristica: any, index: number) => {
                const caracteristicaId = caracteristica?.id;
                const caracteristicaNombre = caracteristica?.nombre || caracteristica;
                const isCaracteristicaSelected =
                  typeof caracteristicaId === "number" &&
                  selectedCaracteristicasIds.includes(caracteristicaId);

                return (
                  <button
                    key={`${caracteristicaId ?? caracteristicaNombre}-grid-${index}`}
                    type="button"
                    onClick={(event) =>
                      handleCaracteristicaClick(event, caracteristicaId)
                    }
                    className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase shadow-sm transition ${
                      isCaracteristicaSelected
                        ? "bg-[#1F3A4D] text-white"
                        : "bg-[#6B7280] text-white hover:bg-[#1F3A4D]"
                    }`}
                    title={`Filtrar por ${caracteristicaNombre}`}
                  >
                    {caracteristicaNombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-end justify-between gap-1 border-t pt-2 lg:flex-nowrap">
          <div className="flex min-w-0 flex-col">
            <PriceBlock className="truncate text-base font-bold leading-tight text-gray-950 sm:text-lg" />

            <div className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-gray-400 sm:text-[10px]">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.publishedDate}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <Button
              variant="default"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px] sm:h-8 sm:text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetail();
              }}
            >
              Ver Detalle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyCard);