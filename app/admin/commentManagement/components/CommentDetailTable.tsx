import { Loader2, Trash2, ShieldAlert, CornerDownRight } from "lucide-react";
import { CommentDetailData, CLS_FOCUS } from "../[commentId]/types";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Componente de presentación
 * encargado de renderizar la tabla de comentarios detallados de un post, 
 * mostrar el estado visual (activo/borrado) e hilos de respuesta
 */
interface CommentDetailTableProps {
  BolIsLoading: boolean;
  ArrPaginated: CommentDetailData[];
  onAction: (commentId: number, isSoftDelete: boolean) => void;
}

export default function CommentDetailTable({ BolIsLoading, ArrPaginated, onAction }: CommentDetailTableProps) {
  return (
    <div className="bg-secondary-fund p-6 sm:p-8 rounded-sm w-full min-h-[25rem] border border-card-border shadow-sm mt-2">
      <div className="overflow-x-auto scrollbar-custom rounded-lg border border-card-border bg-card">
        <table className="w-full min-w-[37.5rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-card-border bg-secondary-fund/50 text-body-info">
              <th className="p-4 font-bold text-foreground w-[15%]">Usuario</th>
              <th className="p-4 font-bold text-foreground w-[50%]">Comentario</th>
              <th className="p-4 font-bold text-center text-foreground w-[15%]">Estado</th>
              <th className="p-4 font-bold text-center text-foreground w-[20%]">Acción</th>
            </tr>
          </thead>
          <tbody>
            {BolIsLoading ? (
              <tr>
                <td colSpan={4} className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-foreground/70">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-body-info font-bold">Cargando comentarios...</span>
                  </div>
                </td>
              </tr>
            ) : ArrPaginated.length > 0 ? (
              ArrPaginated.map((objComment) => {
                const isDeleted = objComment.deletedAt !== null;
                const isReply = objComment.parentId !== null;

                return (
                  <tr
                    key={objComment.id}
                    className={`group border-b border-card-border last:border-0 transition-colors ${
                      isDeleted ? "bg-secondary-fund/60 opacity-80" : "hover:bg-secondary-fund/30"
                    }`}
                  >
                    <td className="p-4 text-body-info font-medium text-foreground">
                      @{objComment.username}
                    </td>

                    <td className="p-4 text-body-info text-foreground">
                      <div className="flex flex-col gap-1">
                        {isReply && (
                          <span className="flex items-center gap-1 text-xs font-bold text-primary">
                            <CornerDownRight className="h-3 w-3" />
                            Respuesta
                          </span>
                        )}
                        <span className={isDeleted ? "line-through text-muted-foreground" : ""}>
                          "{objComment.content}"
                        </span>
                        {isDeleted && (
                          <span className="text-xs font-bold text-destructive mt-1">
                            *Borrado el {new Date(objComment.deletedAt!).toLocaleDateString()}*
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                          isDeleted ? "bg-muted text-muted-foreground" : "bg-success text-success-foreground"
                        }`}
                      >
                        {isDeleted ? "ELIMINADO" : "OK"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => onAction(objComment.id, !isDeleted)}
                        className={`inline-flex items-center justify-center gap-2 rounded px-4 py-1.5 text-xs font-bold uppercase shadow-sm transition-transform duration-200 hover:scale-105 ${CLS_FOCUS} ${
                          isDeleted
                            ? "bg-destructive text-destructive-foreground border border-destructive hover:bg-destructive/90"
                            : "bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/90"
                        }`}
                      >
                        {isDeleted ? (
                          <>
                            Permanente <ShieldAlert className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Borrar <Trash2 className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-body-info font-bold text-foreground/70">
                  No se encontraron comentarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}