/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Definición de tipos y constantes para la vista de detalle de comentarios de un blog.
 */
export interface CommentDetailData {
  id: number;
  username: string;
  content: string;
  createdAt: string;
  deletedAt: string | null;
  parentId: number | null;
}

export type CommentTabFilter = "TODOS" | "VISIBLES" | "BORRADOS";

export const INT_COMMENTS_PER_PAGE = 10;
export const CLS_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";