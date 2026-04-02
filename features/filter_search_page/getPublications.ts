import { prisma } from "./prismaClient";

export async function getPublications() {

   return prisma.publicacion.findMany({
        take: 5,
        select: {
            id_publicacion: true,
            titulo: true,
            precio: true,
            Moneda: {
                select: {
                id_moneda: true,
                nombre: true,
                simbolo: true,
                tasa_cambio: true,
                },
            },
        },
    });
}