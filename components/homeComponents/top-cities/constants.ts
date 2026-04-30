import type { OperationTab, OperationType } from "./types";
 
export const OPERATION_TABS: OperationTab[] = [
  { strType: "venta",       strLabel: "En Venta"    },
  { strType: "alquiler",    strLabel: "Alquiler"    },
  { strType: "anticretico", strLabel: "Anticrético" },
];
 
export const VALID_OPERATIONS: OperationType[] = [
  "venta",
  "alquiler",
  "anticretico",
];
 
export const OPERATION_LABEL: Record<OperationType, string> = {
  venta:        "En Venta",
  alquiler:     "Alquiler",
  anticretico:  "Anticrético",
};
 
export const MIN_SWIPE_DISTANCE = 50;
export const AUTOPLAY_DELAY     = 7_000;
export const ANIMATION_DURATION = 260;
export const TOP_CITIES_LIMIT   = 3;