import { prisma } from "@/lib/prisma";

export async function emailNotificacionesActivas(
  userId: string
): Promise<boolean> {
  try {
    const pref = await prisma.preferenciaNotificacionCanal.findFirst({
      where: {
        id_usuario: userId,
        canal: "GMAIL",
      },
      select: { activo: true },
    });
    return pref ? Boolean(pref.activo) : true;
  } catch (error) {
    console.error("emailNotificacionesActivas error:", error);
    return true;
  }
}