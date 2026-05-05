import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// dev: Rodrigo Saul Zarate Villarroel  fecha: 03/05/2026
export function ArticleCardSkeleton() {
  return (
    <div className="w-full">
      <Card className="flex flex-col h-full overflow-hidden rounded-2xl border-border/50 bg-card-bg/30 backdrop-blur-md">
        {/* Skeleton de la Imagen (4:3) */}
        <Skeleton className="flex items-center justify-center aspect-[4/3] w-full rounded-none">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
        </Skeleton>

        {/* Skeleton del Contenido */}
        <div className="flex flex-col flex-1 gap-4 p-5">
          <div className="space-y-3 flex-1">
            {/* Título */}
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            {/* Descripción */}
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Skeleton del Footer (Autor y Tiempo) */}
          <div className="flex items-center justify-between border-t border-card-border/60 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full bg-secondary-fund" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </Card>
    </div>
  );
}