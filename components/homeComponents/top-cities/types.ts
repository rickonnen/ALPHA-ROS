export type OperationType = "venta" | "alquiler" | "anticretico";
 
export interface CityImageData {
  strUrl: string;
  strAlt: string;
  strPublicId: string;
}
 
export interface CityData {
  strDepartamento: string;
  intContador: number;
  arrImagenes: CityImageData[];
}
 
export interface OperationTab {
  strType: OperationType;
  strLabel: string;
}
 
// Solo usados en route.ts
export interface CityImage {
  id: number;
  city_name: string;
  image_url: string;
  alt_text: string;
  order: number;
  is_active: boolean;
  public_id: string;
}
 
export interface ReporteRow {
  id: number;
  departamento: string;
  alquiler: number;
  venta: number;
  anticretico: number;
}