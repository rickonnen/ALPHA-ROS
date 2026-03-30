/** * Dev: Marcela C.
 * Date: 27/03/2026
 * Funcionalidad: Siluetas de carga mientras se obtienen los datos del inmueble
 *                (HU4 - Task 4.9)
 * @return JSX con skeletons que replican la estructura del perfil
 */
import { Skeleton } from "@/components/ui/skeleton";

export const PropertySkeleton = () => {
  return (
    <div className="space-y-10 animate-pulse">
      <Skeleton className="h-12 w-2/3 bg-[#E7E1D7] rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-100">
        <Skeleton className="md:col-span-2 h-full bg-[#E7E1D7] rounded-2xl" />
        <div className="hidden md:flex flex-col gap-4">
          <Skeleton className="h-1/2 bg-[#E7E1D7] rounded-2xl" />
          <Skeleton className="h-1/2 bg-[#E7E1D7] rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-64 w-full bg-[#E7E1D7]/30 rounded-3xl" />
    </div>
  );
};