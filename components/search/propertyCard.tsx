'use client';

import { useCallback, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import {
  MapPin,
  BedDouble,
  Bath,
  CalendarDays,
  MessageCircle,
  Square,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCardViewTracking, useTracking } from '@/components/hooks/useTracking';
import { useDollarRate } from '@/components/hooks/getDollarRate';
import { formatPropertyPrice } from '@/lib/locations';

type Currency = 'USD' | 'BS';

export interface Property {
  id: number;
  title: string;
  type: string;
  location: string;
  terrainArea: number;
  constructionArea?: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currencySymbol: string;
  publishedDate: string;
  whatsappContact: string;
  images: string[];
  usuarioTelefono?: string;
}

interface PropertyCardProps {
  property: Property;
  selectedCurrency: Currency;
  viewMode?: 'grid' | 'list';
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

function PropertyCard({
  property,
  selectedCurrency,
  viewMode = 'grid',
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: PropertyCardProps) {
  const { trackEvent } = useTracking();
  const { compra } = useDollarRate();

  const canHover =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
      trackEvent(property.id, 'ignorar');
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
        trackEvent(property.id, 'hover', { duracion_ms: duration });
      }
    }
    onMouseLeave?.();
  }, [canHover, clearIgnoreTimer, onMouseLeave, property.id, trackEvent]);

  const exchangeRate = compra ?? 6.96;
  const convertedPrice =
    selectedCurrency === 'USD'
      ? property.price
      : Math.round(property.price * exchangeRate * 100) / 100;
  const displayCurrencySymbol = selectedCurrency === 'USD' ? '$us' : 'Bs';
  const displayPrice = `${displayCurrencySymbol} ${convertedPrice.toLocaleString('es-BO')}`;

  const isContactAvailable = !!property.whatsappContact;
  const telefonoParaWhatsapp = property.usuarioTelefono || property.whatsappContact;

  if (viewMode === 'list') {
    return (
      <div
        ref={viewRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          window.open(`/publicacion/Vista_del_Inmueble/${property.id}`, '_blank');
          trackEvent(property.id, 'click');
          onClick?.();
        }}
        className={`group flex w-full cursor-pointer flex-row items-center gap-2 overflow-hidden rounded-xl border-2 bg-white p-1 shadow-sm transition-all hover:shadow-md sm:gap-4 sm:p-3 ${
          isHovered ? 'border-[#C26E5A] bg-orange-50/30 shadow-lg' : 'border-transparent'
        }`}
        >
          <div className="relative h-[75px] w-[90px] shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-[85px] sm:w-[130px]">
            <img
              src={property.images[0]}
              alt={`Imagen de ${property.title}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-lg border-gray-200 p-1 sm:hidden">
            <div className="flex items-start justify-between">
              <span className="truncate text-[17px] font-bold leading-tight text-gray-950">
                {displayPrice}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.5} />
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
              {property.terrainArea.toLocaleString('es-BO')} m² Terreno / {property.bathrooms} Baños
            </p>
          </div>

          <div className="hidden min-w-0 flex-1 items-center overflow-hidden sm:flex">
            <div className="flex w-[200px] shrink-0 flex-col justify-center overflow-hidden pr-4">
              <span className="text-[18px] font-bold leading-tight text-gray-950">
                {displayPrice}
              </span>
              <span className="mt-1 text-[12px] font-medium text-gray-500">{property.type}</span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center border-l border-gray-200 pl-4">
              <h3 className="mb-1 truncate text-[14px] font-semibold text-[#a67c52] transition-colors group-hover:text-[#C26E5A]">
                {property.title}
              </h3>
              <p className="mb-1 flex items-center gap-1 truncate text-[12px] text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                {property.location}
              </p>
              <p className="flex items-center gap-1 truncate text-[12px] font-medium text-gray-400">
                <Square className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.terrainArea.toLocaleString('es-BO')} m² Terreno /
                <Bath className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.bathrooms} Baños /
                <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.bedrooms} Rec.
              </p>
            </div>

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
      onClick={() => {
        window.open(`/publicacion/Vista_del_Inmueble/${property.id}`, '_blank');
        trackEvent(property.id, 'click');
        onClick?.();
      }}
      className={`group flex h-auto min-h-[12rem] cursor-pointer flex-row overflow-hidden rounded-xl border-2 bg-white shadow-sm outline-none transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-[#a67c52] sm:h-48 ${
        isHovered ? 'border-[#C26E5A] bg-orange-50/30 shadow-lg' : 'border-gray-100'
      }`}
    >
      <div className="relative h-48 w-2/5 shrink-0 overflow-hidden sm:w-1/3">
        <Carousel className="h-full w-full">
          <CarouselContent className="-ml-0 h-full">
            {property.images.map((img, index) => (
              <CarouselItem key={index} className="basis-full pl-0">
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
          {property.images.length > 1 && (
            <>
              <CarouselPrevious className="pointer-events-auto absolute left-1 top-1/2 z-20 h-6 w-6 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white sm:h-7 sm:w-7" />
              <CarouselNext className="pointer-events-auto absolute right-1 top-1/2 z-20 h-6 w-6 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white sm:h-7 sm:w-7" />
            </>
          )}
        </Carousel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden p-3 sm:p-4">
        <div>
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-[#8c6c4c] sm:text-xs">
            {property.type}
          </p>
          <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#a67c52] sm:text-base">
            {property.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500 sm:text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            {property.location}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-700 sm:text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <Square className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{property.terrainArea.toLocaleString('es-BO')} m² Terreno</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{property.bedrooms} Rec.</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Bath className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{property.bathrooms} Baños</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-2 border-t pt-2 lg:flex-nowrap">
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-lg font-bold leading-tight text-gray-950 sm:text-xl">
              {displayPrice}
            </p>
            <div className="mt-1 flex items-center gap-1 truncate text-[10px] text-gray-500 sm:text-[11px]">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.publishedDate}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1 px-2 text-[11px]"
              onClick={() => {
                window.open(`/publicacion/Vista_del_Inmueble/${property.id}`, '_blank');
                trackEvent(property.id, 'click');
                onClick?.();
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

export default memo(PropertyCard, (prevProps, nextProps) => {
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.selectedCurrency === nextProps.selectedCurrency
  );
});
