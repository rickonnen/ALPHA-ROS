/**
 * Dev: Marcela C.
 * Date: 02/04/2026
 * Funcionalidad: Siluetas de carga mientras se obtienen los datos del inmueble
 *                (HU4 - Task 4.9)
 * @return JSX con skeletons que replican la estructura del perfil
 */
import { Skeleton } from "@/components/ui/skeleton";

export const PropertySkeleton = () => {
  return (
    <div className="space-y-10">
      {/* Title skeleton */}
      <Skeleton className="h-12 w-2/3 bg-[#E7E1D7] rounded-lg" />

      {/* Gallery skeleton — single slot */}
<Skeleton className="hidden md:block h-125 w-full bg-[#E7E1D7] rounded-2xl" />

      {/* Price and surface skeleton */}
      <div className="flex justify-between py-8 border-y border-black/10">
        <Skeleton className="h-8 w-1/3 bg-[#E7E1D7] rounded-lg" />
        <Skeleton className="h-8 w-1/3 bg-[#E7E1D7] rounded-lg" />
      </div>

      {/* Address skeleton */}
      <Skeleton className="h-6 w-1/2 bg-[#E7E1D7] rounded-lg" />

      {/* Details skeleton */}
      <Skeleton className="h-64 w-full bg-[#E7E1D7] rounded-3xl" />

      {/* Description skeleton */}
      <div className="bg-[#E7E1D7]/40 p-8 rounded-3xl space-y-3">
        <Skeleton className="h-7 w-1/4 bg-[#E7E1D7] rounded-lg" />
        <Skeleton className="h-4 w-full bg-[#E7E1D7] rounded-lg" />
        <Skeleton className="h-4 w-full bg-[#E7E1D7] rounded-lg" />
        <Skeleton className="h-4 w-3/4 bg-[#E7E1D7] rounded-lg" />
      </div>

      {/* Buttons skeleton */}
      <div className="flex justify-between pt-10 border-t border-black/10">
        <Skeleton className="h-12 w-48 bg-[#E7E1D7] rounded-lg" />
        <Skeleton className="h-12 w-48 bg-[#E7E1D7] rounded-lg" />
      </div>
    </div>
  );
};