// ----------------------------------------------------------------------
/**
 * @Modificacion
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Archivo especial de Next.js (loading.tsx) que intercepta automáticamente
 * la navegación y muestra un estado de carga (Skeleton) mientras el servidor resuelve
 * la petición de 'page.tsx'. Mejora la experiencia de usuario (UX) evitando pantallas en blanco.
 * @return {JSX.Element} Pantalla de carga con la estructura base del inmueble (PropertySkeleton).
 */
import { PropertySkeleton } from "@/features/publicacion/[id_publicacion]/components/PropertySkeleton";

export default function LoadingPerfilInmueble() {
  return (
    <main className="min-h-screen bg-[#F4EFE6] p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PropertySkeleton />
      </div>
    </main>
  );
}