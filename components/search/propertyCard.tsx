'use client';
import Image from 'next/image';
import { MapPin, BedDouble, Bath, CalendarDays, MessageCircle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
}

interface PropertyCardProps {
  property: Property;
  selectedCurrency: Currency;
}

export default function PropertyCard({ property, selectedCurrency }: PropertyCardProps) {
  
    const exchangeRate = 6.96;

    const convertedPrice =
    selectedCurrency === "USD"
        ? property.price
        : Math.round(property.price * exchangeRate * 100) / 100;

    const displayCurrencySymbol = selectedCurrency === "USD" ? "$us" : "Bs";

    const displayPrice = `${displayCurrencySymbol} ${convertedPrice.toLocaleString("es-BO")}`;

  
  const isContactAvailable = !!property.whatsappContact;

  return (
    <div className="group flex flex-row h-auto min-h-[12rem] sm:h-48 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden focus-within:ring-2 focus-within:ring-[#a67c52] outline-none">
      
      {/*  lado izquierdo (carrusel) */}
      <div className="relative w-2/5 sm:w-1/3 shrink-0 overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent className="-ml-0 h-full">
            {property.images.map((img, index) => (
              <CarouselItem key={index} className="pl-0 relative h-full w-full">
                <Image
                  src={img}
                  alt={`Imagen ${index + 1} de ${property.title}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                  placeholder="empty"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {property.images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-7 sm:h-7" />
              <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-7 sm:h-7" />
            </>
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            1/{property.images.length}
          </div>
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
            <Button size="sm" className="h-8 text-[11px]">
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
                <a href={`https://wa.me/${property.whatsappContact}`} target="_blank" rel="noopener noreferrer">
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