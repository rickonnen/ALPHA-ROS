/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Estado de carga del perfil mientras llegan datos de BD (HU4 - Task 4.9)
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