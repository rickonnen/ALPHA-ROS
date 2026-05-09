import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary (Asegúrate de tener esto en tu .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función auxiliar para subir a Cloudinary
async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "planes_qr" },
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
      orderBy: { id_plan: 'asc' }
    });
    return NextResponse.json(planes);
  } catch (error) {
    console.error("Error en GET planes:", error);
    return NextResponse.json({ error: "Error al obtener planes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extraer datos básicos
    const nombre = formData.get("nombre_plan") as string;
    const precio = Number(formData.get("precio_plan"));
    const cant = Number(formData.get("cant_publicaciones"));
    const tipo = formData.get("tipo") === "true"; // true = publicación, false = promo

    // 1. Crear el Plan en la BD
    const nuevoPlan = await prisma.planPublicacion.create({
      data: {
        nombre_plan: nombre,
        precio_plan: precio,
        cant_publicaciones: cant,
        activo: true,
        tipo: tipo,
      }
    });

    // 2. Procesar QRs según el tipo de plan
    const qrRecords = [];

    if (tipo) {
      // Caso Publicación: Mensual y Anual
      const fileMensual = formData.get("qr_mensual") as File;
      const fileAnual = formData.get("qr_anual") as File;

      if (fileMensual && fileMensual.size > 0) {
        const url = await uploadToCloudinary(fileMensual) as string;
        qrRecords.push({ qr_URL: url, id_plan: nuevoPlan.id_plan, modalidad: "mensual" });
      }
      if (fileAnual && fileAnual.size > 0) {
        const url = await uploadToCloudinary(fileAnual) as string;
        qrRecords.push({ qr_URL: url, id_plan: nuevoPlan.id_plan, modalidad: "anual" });
      }
    } else {
      // Caso Promoción: Modalidad Null
      const filePromo = formData.get("qr_promo") as File;
      if (filePromo && filePromo.size > 0) {
        const url = await uploadToCloudinary(filePromo) as string;
        qrRecords.push({ qr_URL: url, id_plan: nuevoPlan.id_plan, modalidad: null });
      }
    }

    // 3. Guardar registros en la tabla QrUrl
    if (qrRecords.length > 0) {
      await prisma.qrUrl.createMany({
        data: qrRecords
      });
    }

    return NextResponse.json(nuevoPlan);
  } catch (error) {
    console.error("Error en POST:", error);
    return NextResponse.json({ error: "Error al procesar el plan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_plan, activo, ...datos } = body;

    const actualizado = await prisma.planPublicacion.update({
      where: { id_plan: Number(id_plan) },
      data: { ...datos, activo }
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}