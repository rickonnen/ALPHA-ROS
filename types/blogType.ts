/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: definicion centralizada de tipos, interfaces y estados para el modulo de blogs
 */

// enumerador para el control estricto de estados
export enum blogState {
  NOPUBLICADO = "NOPUBLICADO",
  PUBLICADO = "PUBLICADO",
  NOVISIBLE = "NOVISIBLE",
  RECHAZADO = "RECHAZADO"
}

// interface para las tarjetas del listado publico
export interface blogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  StrAuthorBlo: string;
}

// interface para la vista completa de un blog individual
export interface singleBlogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrContentBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  StrAuthorBlo: string;
}

// interface para la tabla de gestion del administrador
export interface adminBlogListResponse {
  IntIdBlo: number;
  StrTitleBlo: string | null;
  StrStateBlo: string | null;
  StrAuthorNameBlo: string;
  StrDateBlo: string;
  BolIsDeletedBlo: boolean;
}