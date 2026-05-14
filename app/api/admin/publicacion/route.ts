import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary con variables P y optimización WebP
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_P,
  api_key: process.env.CLOUDINARY_API_KEY_P,
  api_secret: process.env.CLOUDINARY_API_SECRET_P,
  secure: true,
});

async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "planes_qr",
        format: "webp",
        // Aquí forzamos el tamaño a 300x300 píxeles
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "center" },
          { quality: "auto", fetch_format: "webp" }
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url);
      }
    ).end(buffer);
  });
}

export async function GET() {
  try {
    const planes = await prisma.planPublicacion.findMany({
      include: {
        QrUrl: true // Cargamos los QRs asociados a cada plan
      },
      orderBy: { id_plan: 'asc' }
    });
    return NextResponse.json(planes);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener planes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const nombre = formData.get("nombre_plan") as string;
    const precio = Number(formData.get("precio_plan"));
    const cant = Number(formData.get("cant_publicaciones"));
    const tipo = formData.get("tipo") === "true";

    const nuevoPlan = await prisma.planPublicacion.create({
      data: {
        nombre_plan: nombre,
        precio_plan: precio,
        cant_publicaciones: cant,
        activo: true,
        tipo: tipo,
      }
    });

    const qrRecords = [];
    if (tipo) {
      const fMensual = formData.get("qr_mensual") as File;
      const fAnual = formData.get("qr_anual") as File;
      if (fMensual?.size > 0) {
        const url = await uploadToCloudinary(fMensual);
        qrRecords.push({ qr_URL: url as string, id_plan: nuevoPlan.id_plan, modalidad: "mensual" });
      }
      if (fAnual?.size > 0) {
        const url = await uploadToCloudinary(fAnual);
        qrRecords.push({ qr_URL: url as string, id_plan: nuevoPlan.id_plan, modalidad: "anual" });
      }
    } else {
      const fPromo = formData.get("qr_promo") as File;
      if (fPromo?.size > 0) {
        const url = await uploadToCloudinary(fPromo);
        qrRecords.push({ qr_URL: url as string, id_plan: nuevoPlan.id_plan, modalidad: null });
      }
    }

    if (qrRecords.length > 0) {
      await prisma.qrUrl.createMany({ data: qrRecords });
    }

    return NextResponse.json(nuevoPlan);
  } catch (error) {
    return NextResponse.json({ error: "Error en POST" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id_plan = Number(formData.get("id_plan"));
    
    // Procesar el booleano 'activo' desde el FormData
    const activoRaw = formData.get("activo");
    const activo = activoRaw !== null ? activoRaw === "true" : undefined;

    const actualizado = await prisma.planPublicacion.update({
      where: { id_plan },
      data: {
        nombre_plan: formData.get("nombre_plan") as string,
        precio_plan: Number(formData.get("precio_plan")),
        cant_publicaciones: Number(formData.get("cant_publicaciones")),
        ...(activo !== undefined && { activo }),
      }
    });

    const processQR = async (fileKey: string, modalidad: string | null) => {
      const file = formData.get(fileKey) as File;
      if (file && file.size > 0) {
        const url = await uploadToCloudinary(file);
        await prisma.qrUrl.deleteMany({ where: { id_plan, modalidad } });
        await prisma.qrUrl.create({
            data: { qr_URL: url as string, id_plan, modalidad }
        });
      }
    };

    if (actualizado.tipo) {
      await processQR("qr_mensual", "mensual");
      await processQR("qr_anual", "anual");
    } else {
      await processQR("qr_promo", null);
    }

    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error en PATCH" }, { status: 500 });
  }
}