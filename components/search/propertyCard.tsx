'use client';
import { memo } from 'react';
import Image from 'next/image';
import { MapPin, BedDouble, Bath, CalendarDays, MessageCircle, Square, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCardViewTracking, useTracking } from '@/components/hooks/useTracking';
import { formatPropertyPrice } from '@/lib/locations';


type Currency = "USD" | "BS";
// defini esta interfaz para los datos pero esto no se si deberia ir aqui, pero por ahora aqui
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
  onClick
}: PropertyCardProps) {
  const { trackEvent } = useTracking();
  const viewRef = useCardViewTracking(property.id, 0);
  
  const displayPrice = formatPropertyPrice(property.price, selectedCurrency);
  const openPropertyDetails = () => {
    trackEvent(property.id, 'click');
    window.open(
      `/publicacion/Vista_del_Inmueble/${property.id}`,
      `tab_mi_inmueble_${property.id}`,
    );
    onClick?.();
  };

  
  const isContactAvailable = !!property.whatsappContact;
  
  // Usar teléfono del usuario si está disponible, sino usar el whatsappContact
  const telefonoParaWhatsapp = property.usuarioTelefono || property.whatsappContact;


  if(viewMode === 'list') {
    return (
      <>
        <div 
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={openPropertyDetails}
          className={`group flex flex-row items-center gap-2 sm:gap-4 p-1 sm:p-3 
            bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-2 
            cursor-pointer w-full overflow-hidden ${
            isHovered 
              ? 'border-[#C26E5A] bg-orange-50/30 shadow-lg' 
              : 'border-transparent'
          }`}
        >
          {/* izqquierda */}
          <div className="relative w-[90px] sm:w-[130px] h-[75px] sm:h-[85px] shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={property.images[0]}
              alt={`Imagen de ${property.title}`}
              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
            />
          </div>


          {/*Layout movil*/}
          <div className="flex-1 flex flex-col justify-center min-w-0 sm:hidden p-1 border-gray-200 rounded-lg
          overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[17px] font-bold text-gray-950 leading-tight truncate">
                {displayPrice}
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
            </div>
            <span className="text-[13px] text-gray-500 font-medium truncate block">
              {property.type}
            </span>
            <h3 className="text-[11px] font-semibold text-[#a67c52] truncate mb-0.5">
              {property.title}
            </h3>

            <p className="text-[10px] text-gray-500 truncate mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{property.location}</span>
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {property.terrainArea.toLocaleString('es-BO')} m² Terreno / {property.bathrooms} Baños
            </p>
          </div>

          
          {/* LAYOUT DESKTOP (Se oculta en móvil)          */}
          <div className="hidden sm:flex flex-1 items-center min-w-0 overflow-hidden">
            {/* Columna 1: Precio y Tipo */}
            <div className="w-[200px] shrink-0 flex flex-col justify-center pr-4 overflow-hidden">
              <span className="text-[18px] font-bold text-gray-950 leading-tight ">
                {displayPrice}
              </span>
              <span className="text-[12px] text-gray-500 font-medium mt-1">
                {property.type}
              </span>
            </div>

            {/* Columna 2: Detalles (Título, Ubicación, Características) */}
            <div className="flex-1 flex flex-col justify-center min-w-0 border-l border-gray-200 pl-4">
              <h3 className="text-[14px] font-semibold text-[#a67c52] truncate mb-1 transition-colors group-hover:text-[#C26E5A]">
                {property.title}
              </h3>
              <p className="text-[12px] text-gray-500 truncate mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {property.location}
              </p>
              <p className="text-[12px] text-gray-400 font-medium truncate flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {property.terrainArea.toLocaleString('es-BO')} m² Terreno /
                <Bath className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {property.bathrooms} Baños / 
                <BedDouble className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {property.bedrooms} Rec.
              </p>
            </div>

            {/* Flecha derecha */}
            <div className="flex items-center justify-end pl-4 shrink-0">
              <ArrowRight className="w-6 h-6 text-[#a67c52] transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </>
    );
  }
        
        
  return (
    <div 
      ref={viewRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={openPropertyDetails}
      className={`group flex flex-row h-auto min-h-[12rem] sm:h-48 bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden focus-within:ring-2 focus-within:ring-[#a67c52] outline-none cursor-pointer ${
        isHovered 
          ? 'border-[#C26E5A] bg-orange-50/30 shadow-lg' 
          : 'border-gray-100'
      }`}
      
    >
      
      {/*  lado izquierdo (carrusel) */}
      <div className="relative w-2/5 sm:w-1/3 h-48 shrink-0 overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent className="-ml-0 h-full">
            {property.images.map((img, index) => (
              <CarouselItem key={index} className="pl-0 basis-full h-full">
                <Image
                  src={img}
                  alt={`Imagen ${index + 1} de ${property.title}`}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {property.images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-7 sm:h-7 pointer-events-auto z-20" />
              <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-7 sm:h-7 pointer-events-auto z-20" />
            </>
          )}
        </Carousel>
      </div>

      {/*  espacio de informacion de la card */}
      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
        
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-[#8c6c4c] mb-0.5 uppercase tracking-wider">
            {property.type}
          </p>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-[#a67c52] transition-colors">
            {property.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {property.location}
          </p>
        </div>

        {/* características */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] sm:text-xs text-gray-700 mt-2">
          <div className="flex items-center gap-1.5 truncate">
            <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{property.terrainArea.toLocaleString('es-BO')} m² Terreno</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <BedDouble className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{property.bedrooms} Rec.</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Bath className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{property.bathrooms} Baños</span>
          </div>
          {/* aun hay espacio para una caracteristica mas */}
        </div>

        {/* precio y botones */}
        <div className="mt-2 pt-2 border-t flex flex-wrap lg:flex-nowrap justify-between items-end gap-2">
          
          <div className="flex flex-col min-w-0">
            <p className="text-lg sm:text-xl font-bold text-gray-950 leading-tight truncate">
              {displayPrice}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span className="truncate">{property.publishedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button 
              size="sm" 
              className="h-8 text-[11px]"
              onClick={(event) => {
                event.stopPropagation();
                openPropertyDetails();
              }}
            >
              Ver Detalle
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-1 h-8 text-[11px] px-2 ${!isContactAvailable ? 'opacity-50' : ''}`}
              disabled={!isContactAvailable}
              asChild={isContactAvailable}
            >
              {isContactAvailable ? (
                <a href={`https://wa.me/${telefonoParaWhatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="hidden xl:inline">WhatsApp</span>
                </a>
              ) : (
                <span>No disp.</span>
              )}
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
