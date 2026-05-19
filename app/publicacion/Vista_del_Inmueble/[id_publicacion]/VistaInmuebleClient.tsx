"use client";

import Link from "next/link";
import { Ruler, Tag } from "lucide-react";
import { MediaGallery } from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails, type PerfilDetallesProps } from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { ContactCard } from "@/features/publicacion/[id_publicacion]/components/ContactCard";
import { LocationMapClient } from "@/features/publicacion/[id_publicacion]/components/LocationMapClient";
import { PropertyDetailTracking } from "@/features/publicacion/[id_publicacion]/components/PropertyDetailTracking";
import { PublicationStatusBadge } from "@/features/publicacion/[id_publicacion]/components/PublicationStatusBadge";
import { ReferencePointsSection } from "@/features/publicacion/[id_publicacion]/components/ReferencePointsSection";
import { ViewTracker } from "@/features/publicacion/[id_publicacion]/components/ViewTracker";
import FavButton from "@/components/ui/fav";
import ReportModal from "@/features/publicacion/[id_publicacion]/components/ReportModal";
import CloseTabButton from "./CloseTabButton";
import UserAvatar from "./UserAvatar";

type PointOfInterestItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  lat: number;
  lng: number;
  distancia_metros?: number | null;
  tipo_nombre?: string | null;
  tipo_color?: string | null;
};

type PropietarioInfo = {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  fotoUrl: string | null;
  telefonos: string[];
  direccion?: string | null;
};

interface VistaInmuebleClientProps {
  idPublicacion: number;
  titulo: string;
  estado: string | null;
  disponible: boolean;
  videoId?: string;
  reelId?: string;
  imagenes: string[];
  precio: number;
  monedaSimbolo: string | null;
  superficie: number;
  direccion: string;
  lat: number | null;
  lng: number | null;
  puntosInteres: PointOfInterestItem[];
  descripcion: string;
  propietario: PropietarioInfo | null;
  detalles: PerfilDetallesProps["objInfo"];
}

export default function VistaInmuebleClient({
  idPublicacion,
  titulo,
  estado,
  disponible,
  videoId,
  reelId,
  imagenes,
  precio,
  monedaSimbolo,
  superficie,
  direccion,
  lat,
  lng,
  puntosInteres,
  descripcion,
  propietario,
  detalles,
}: VistaInmuebleClientProps) {
  return (
    <main className="min-h-screen bg-background p-4 font-[family-name:var(--font-geist-sans)] text-foreground md:p-12">
      <ViewTracker id_publicacion={idPublicacion} />
      <PropertyDetailTracking id_publicacion={idPublicacion} />
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          {propietario && (
            <Link
              href={`/otroPerfil?id=${propietario.id}`}
              className="group mb-6 inline-flex items-center gap-3"
            >
              <UserAvatar
                src={propietario.fotoUrl ?? ""}
                alt={propietario.username}
                className="h-10 w-10 rounded-full border-2 border-[#1F3A4D]/20 object-cover transition-colors group-hover:border-[#C26E5A]"
              />
              <span className="text-sm font-semibold text-[#1F3A4D] transition-colors group-hover:text-[#C26E5A]">
                @{`${propietario.nombres} ${propietario.apellidos}`.trim() || "Usuario"}
              </span>
            </Link>
          )}
          <h1 className="mb-4 break-words text-3xl font-bold tracking-tight text-primary md:text-5xl">
            {titulo}
          </h1>
          <PublicationStatusBadge strEstado={estado} />
        </header>

        <div className="relative overflow-hidden rounded-3xl">
          <MediaGallery
            id_publicacion={idPublicacion.toString()}
            arrImagenes={imagenes}
            strVideoId={videoId}
            strReelId={reelId}
            mostrarFav={false}
            mostrarShare
            tituloShare={titulo}
            disponible={disponible}
          />
          <div className="absolute bottom-14 right-8 z-20">
            <FavButton id_publicacion={idPublicacion.toString()} />
          </div>
        </div>

        <div className="mb-10 flex flex-row items-center justify-between gap-2 border-y border-black/10 py-6 md:mb-10 md:py-8">
          <div className="flex min-w-0 items-start gap-1.5 md:gap-2 min-[540px]:items-center">
            <Tag className="mt-1 h-5 w-5 shrink-0 text-foreground opacity-70 min-[540px]:mt-0 md:h-6 md:w-6" />
            <div className="flex flex-col gap-x-1.5 text-[20px] min-[540px]:flex-row min-[540px]:items-center min-[811px]:text-[24px]">
              <span className="font-bold text-primary">Precio:</span>
              <span className="whitespace-nowrap font-medium text-foreground">
                {monedaSimbolo === "B" ? "Bs." : monedaSimbolo || "Bs."}{" "}
                {precio.toLocaleString("de-DE")}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-1.5 md:gap-2 min-[540px]:items-center">
            <Ruler className="mt-1 h-5 w-5 shrink-0 text-foreground opacity-70 min-[540px]:mt-0 md:h-6 md:w-6" />
            <div className="flex flex-col gap-x-1.5 text-[20px] min-[540px]:flex-row min-[540px]:items-center min-[811px]:text-[24px]">
              <span className="font-bold text-primary">Superficie:</span>
              <span className="whitespace-nowrap font-medium text-foreground">
                {superficie.toLocaleString("de-DE")} m²
              </span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="mb-6 text-xl">
            <span className="font-bold text-primary">Dirección:</span> {direccion}
          </p>
          {lat !== null && lng !== null ? (
            <LocationMapClient lat={lat} lng={lng} puntosInteres={puntosInteres} />
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Ubicación exacta en el mapa no disponible.
            </p>
          )}
        </div>

        <PropertyDetails objInfo={detalles} />
        <ReferencePointsSection puntosInteres={puntosInteres} />

        <section className="mb-6 mt-6">
          <div className="rounded-3xl border border-card-border/20 bg-card-bg/40 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <h2 className="mb-6 border-b border-foreground/5 pb-2 text-2xl font-bold text-primary">
              Descripción
            </h2>
            <p className="whitespace-pre-line break-words text-base leading-relaxed opacity-90">
              {descripcion}
            </p>
          </div>
        </section>

        {propietario ? (
          <ContactCard
            id_publicacion={idPublicacion}
            strTituloInmueble={titulo}
            objPropietario={{
              strNombres: propietario.nombres,
              strApellidos: propietario.apellidos,
              strUsername: propietario.username,
              strEmail: propietario.email,
              strFotoUrl: propietario.fotoUrl,
              arrTelefonos: propietario.telefonos,
              strDireccion: propietario.direccion ?? null,
            }}
          />
        ) : null}

        <div className="mt-12 flex items-center justify-between gap-4">
          <CloseTabButton className="rounded-xl border-2 border-secondary px-10 py-3 font-bold text-secondary transition-colors hover:bg-secondary/10">
            Volver
          </CloseTabButton>
          <ReportModal id_publicacion={idPublicacion} />
        </div>
      </div>
    </main>
  );
}
