/**
 
Dev: Gabriel
Fecha: 25/03/2026
Description: Type definitions and Mock Data for Payment Verification.
Updated: Aligned with Prisma Schema (intStatus for @db.SmallInt).
Standards: Alpha Ros (arr, obj, str, int, bol prefixes).*/

export type PaymentRecord = {
  intId: number;
  strClientName: string;
  strPlanType: string;
  strDate: string;
  strPaymentMethod: string;
  intStatus: number; // 0: PENDING, 1: ACCEPTED, 2: REJECTED
};

// --- MOCK DATA FOR FRONTEND TESTING ---

export const arrPendingPaymentsMock: PaymentRecord[] = [
  {
    intId: 101,
    strClientName: "Juan Perez",
    strPlanType: "Plan Estandar",
    strDate: "24/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 0
  },
  {
    intId: 102,
    strClientName: "Ana Gomez",
    strPlanType: "Plan Avanzado",
    strDate: "25/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 0
  },
  {
    intId: 103,
    strClientName: "Luis Mamani",
    strPlanType: "Plan Profecional",
    strDate: "25/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 0
  }
];

export const arrAcceptedPaymentsMock: PaymentRecord[] = [
  {
    intId: 99,
    strClientName: "Carlos Rodriguez",
    strPlanType: "Plan Profesional",
    strDate: "20/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 1
  },
  {
    intId: 97,
    strClientName: "Roberto Claros",
    strPlanType: "Plan Estandar",
    strDate: "15/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 1
  }
];

export const arrRejectedPaymentsMock: PaymentRecord[] = [
  {
    intId: 98,
    strClientName: "Maria Lopez",
    strPlanType: "Plan Estandar",
    strDate: "18/03/2026",
    strPaymentMethod: "QR Transferencia",
    intStatus: 2
  }
];