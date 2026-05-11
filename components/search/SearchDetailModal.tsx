'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Building2,
  Mail,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicacionDetalleBusqueda } from '@/features/search/search-services';
import { useTracking } from '@/components/hooks/useTracking';

type Currency = "USD" | "BS";

interface SearchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicacionId: number;
  selectedCurrency: Currency;
}

interface ApiResponse {
  ok: boolean;
  datos?: PublicacionDetalleBusqueda;
  error?: string;
  mensaje?: string;
}

export default function SearchDetailModal({
  isOpen,
  onClose,
  publicacionId,
  selectedCurrency,
}: SearchDetailModalProps) {
  const [data, setData] = useState<PublicacionDetalleBusqueda | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { trackEvent } = useTracking();

  useEffect(() => {
    if (isOpen && publicacionId) {
      trackEvent(publicacionId, 'detalle');
      cargarDatos();
    }
  }, [isOpen, publicacionId, trackEvent]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/search/publicacion/${publicacionId}`);
      const response: ApiResponse = await res.json();

      if (!response.ok) {
        setError(response.mensaje || 'Error al cargar');
        return;
      }

      setData(response.datos || null);
      setCurrentImageIndex(0);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar la publicación');
    } finally {
      setLoading(false);
    }
  };

  const imagenes = data?.imagenes || [];
  const actualImage = imagenes[currentImageIndex]?.url_imagen;

  // Convertir precio según moneda seleccionada
  const exchangeRate = 6.96;
  const convertedPrice = data
    ? selectedCurrency === "USD"
      ? (data.precio ?? 0)
      : Math.round((data.precio ?? 0) * exchangeRate * 100) / 100
    : 0;
  const displayCurrencySymbol = selectedCurrency === "USD" ? "$us" : "Bs";

  const handlePrevImg = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    setCurrentImageIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  // Generar enlace WhatsApp con el número del usuario
  const whatsappLink = data?.usuario?.telefono
    ? `https://wa.me/${data.usuario.telefono.replace(/\D/g, '')}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 z-100 mt-8">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white p-4 rounded-t-lg flex items-center justify-between">
          <DialogTitle>Detalles de la Propiedad</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 space-y-6">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#a67c52]" />
                <p className="text-gray-600 text-sm">Cargando...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Galería */}
              {imagenes.length > 0 && (
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                  <div className="relative w-full h-64 sm:h-80">
                    {actualImage && (
                      <Image
                        src={actualImage}
                        alt="Propiedad"
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>

                  {imagenes.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevImg}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextImg}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                        {currentImageIndex + 1} / {imagenes.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Info Principal */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{data.titulo}</h1>
                <p className="text-xl font-bold text-[#a67c52] mt-2">
                  {displayCurrencySymbol} {Number(convertedPrice).toLocaleString('es-BO')}
                </p>
              </div>

              {/* Grid Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.habitaciones !== undefined && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <BedDouble className="w-4 h-4" />
                        <span className="text-xs font-medium">Habitaciones</span>
                      </div>
                      <p className="text-lg font-bold">{data.habitaciones}</p>
                    </CardContent>
                  </Card>
                )}
                {data.banos !== undefined && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Bath className="w-4 h-4" />
                        <span className="text-xs font-medium">Baños</span>
                      </div>
                      <p className="text-lg font-bold">{data.banos}</p>
                    </CardContent>
                  </Card>
                )}
                {data.superficie && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Square className="w-4 h-4" />
                        <span className="text-xs font-medium">Área</span>
                      </div>
                      <p className="text-lg font-bold">
                        {Number(data.superficie).toLocaleString('es-BO')} m²
                      </p>
                    </CardContent>
                  </Card>
                )}
                {data.garajes !== undefined && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Garajes</span>
                      </div>
                      <p className="text-lg font-bold">{data.garajes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Información General */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {data.tipo_inmueble && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium text-sm">Tipo:</span>
                      <span className="text-sm">{data.tipo_inmueble}</span>
                    </div>
                  )}
                  {data.tipo_operacion && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium text-sm">Operación:</span>
                      <span className="text-sm">{data.tipo_operacion}</span>
                    </div>
                  )}
                  {data.estado_construccion && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 font-medium text-sm">Estado:</span>
                      <span className="text-sm">{data.estado_construccion}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Descripción */}
              {data.descripcion && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-3 text-sm">Descripción</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {data.descripcion}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Ubicación */}
              {data.ubicacion && (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-bold text-sm">Ubicación</h3>
                    {data.ubicacion.direccion && (
                      <div className="flex gap-3 items-start">
                        <MapPin className="w-4 h-4 text-[#a67c52] mt-1 shrink-0" />
                        <div className="text-sm">
                          <p>{data.ubicacion.direccion}</p>
                          {data.ubicacion.zona && (
                            <p className="text-xs text-gray-600 mt-1">{data.ubicacion.zona}</p>
                          )}
                          {data.ubicacion.ciudad && (
                            <p className="text-xs text-gray-600">{data.ubicacion.ciudad}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Espacio reservado para mapa - Otro equipo está trabajando en esto */}
                    {data.ubicacion.latitud && data.ubicacion.longitud && (
                      <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-sm text-gray-600">
                        <p className="text-xs">
                          Coordenadas: {data.ubicacion.latitud}, {data.ubicacion.longitud}
                        </p>
                        <p className="text-xs mt-2 text-gray-500">[Mapa integrado próximamente]</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Características */}
              {data.caracteristicas && data.caracteristicas.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-3 text-sm">Características</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.caracteristicas.map((car, idx) => (
                        <Badge key={idx} variant="secondary">
                          {car.nombre_caracteristica}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vendedor */}
              {data.usuario && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-bold text-sm">Contacto</h3>
                    <div className="flex items-center gap-3">
                      {data.usuario.url_foto_perfil && (
                        <Image
                          src={data.usuario.url_foto_perfil}
                          alt="Vendedor"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm">
                          {data.usuario.nombres} {data.usuario.apellidos}
                        </p>
                        {data.usuario.email && (
                          <p className="text-xs text-gray-600">{data.usuario.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t flex-col sm:flex-row">
                      {whatsappLink && (
                        <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            WhatsApp
                          </a>
                        </Button>
                      )}
                      {data.usuario.email && (
                        <Button
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={`mailto:${data.usuario.email}`}
                            className="flex items-center justify-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
