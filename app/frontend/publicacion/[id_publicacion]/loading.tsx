/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Página de carga automática de Next.js mientras se resuelve
 *                la query del perfil del inmueble (HU4 - Task 4.9)
 * @return JSX con PropertySkeleton como estado de carga
 */
import { PropertySkeleton } from "@/app/frontend/publicacion/[id_publicacion]/components/PropertySkeleton";

export default function LoadingPerfilInmueble() {
  return (
    <main className="min-h-screen bg-[#F4EFE6] p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PropertySkeleton />
      </div>
    </main>
  );
}