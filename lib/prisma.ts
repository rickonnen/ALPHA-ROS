/**
 * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Instancia global de Prisma Client para evitar múltiples conexiones (HU4 - Task 4.2)
 */
import { PrismaClient } from "@prisma/client";

// Evitar múltiples instancias de Prisma en desarrollo con hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;