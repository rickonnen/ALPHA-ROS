import Link from "next/link";
import { Settings2, Loader2 } from "lucide-react";
import { blogState } from "@/types/blogType";
import { CommentBlogData, getBadgeStyles, CLS_FOCUS } from "../types";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Componente de presentación
 * encargado exclusivamente de renderizar la interfaz visual de la tabla de publicaciones
 */
interface CommentTableProps {
  BolIsLoadingBlo: boolean;
  ArrPaginatedBlogsBlo: CommentBlogData[];
}

export default function CommentTable({ BolIsLoadingBlo, ArrPaginatedBlogsBlo }: CommentTableProps) {
  return (
    <div className="bg-secondary-fund p-6 sm:p-8 rounded-sm w-full min-h-[25rem] border border-card-border shadow-sm mt-2">
      <div className="overflow-x-auto scrollbar-custom rounded-lg border border-card-border bg-card">
        <table className="w-full min-w-[37.5rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-card-border bg-secondary-fund/50 text-body-info">
              <th className="p-4 font-bold text-foreground">Título del Post</th>
              <th className="p-4 font-bold text-center text-foreground">Comentarios</th>
              <th className="p-4 font-bold text-center text-foreground">Estado</th>
              <th className="p-4 font-bold text-center text-foreground">Acción</th>
            </tr>
          </thead>
          <tbody>
            {BolIsLoadingBlo ? (
              <tr>
                <td colSpan={4} className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-foreground/70">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-body-info font-bold">Cargando publicaciones...</span>
                  </div>
                </td>
              </tr>
            ) : ArrPaginatedBlogsBlo.length > 0 ? (
              ArrPaginatedBlogsBlo.map((objBlog) => (
                <tr
                  key={objBlog.id}
                  className="group border-b border-card-border last:border-0 hover:bg-secondary-fund/30 transition-colors"
                >
                  <td className="p-4 text-body-info font-medium text-foreground">
                    {objBlog.strTitle}
                  </td>
                  <td className="p-4 text-center text-body-info font-semibold text-muted-foreground">
                    [ {objBlog.numComments.toString().padStart(2, "0")} ]
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${getBadgeStyles(
                        objBlog.enumState
                      )}`}
                    >
                      {objBlog.enumState === blogState.NOVISIBLE
                        ? "NO VISIBLE"
                        : objBlog.enumState}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/commentManagement/${objBlog.id}`}
                      className={`inline-flex items-center gap-2 rounded bg-secondary px-4 py-1.5 text-xs font-bold uppercase text-secondary-foreground shadow-sm transition-transform duration-200 hover:scale-105 ${CLS_FOCUS}`}
                    >
                      Gestionar
                      <Settings2 className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-body-info font-bold text-foreground/70">
                  No se encontraron publicaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}