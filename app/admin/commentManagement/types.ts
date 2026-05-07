import { blogState } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Definición de interfaces, tipos, constantes y funciones de utilidad visual compartidas
 */
export interface CommentBlogData {
  id: string;
  strTitle: string;
  numComments: number;
  enumState: blogState;
}

export type TabFilterState = "TODOS" | blogState.PUBLICADO | blogState.NOVISIBLE;

export const INT_ITEMS_PER_PAGE = 9;
export const CLS_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const getBadgeStyles = (state: blogState) => {
  switch (state) {
    case blogState.PUBLICADO:
      return "bg-success text-success-foreground";
    case blogState.NOVISIBLE:
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};