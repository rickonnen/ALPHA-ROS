export type OperationType = "venta" | "alquiler" | "anticretico";
 
export interface CityImageData {
  strUrl:      string;
  strAlt:      string;
  strPublicId: string;
}
 
export interface CityData {
  strDepartamento: string;
  intContador:     number;
  strDescription:  string;
  arrImagenes:     CityImageData[];
}
 
export interface OperationTab {
  strType:  OperationType;
  strLabel: string;
}