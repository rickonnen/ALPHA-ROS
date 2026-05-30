import type { OperationTab, OperationType } from "./types";
 
export const INT_CITY_IMAGE_DELAY = 7_000;
 
export const ARR_TABS: OperationTab[] = [
  { strType: "venta",       strLabel: "En Venta"    },
  { strType: "alquiler",    strLabel: "Alquiler"    },
  { strType: "anticretico", strLabel: "Anticrético" },
];
 
export const OPERATION_LABEL: Record<OperationType, string> = {
  venta:        "En Venta",
  alquiler:     "Alquiler",
  anticretico:  "Anticrético",
};
 