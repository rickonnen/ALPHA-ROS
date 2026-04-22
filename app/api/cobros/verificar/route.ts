import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_P,
  api_key: process.env.CLOUDINARY_API_KEY_P,
  api_secret: process.env.CLOUDINARY_API_SECRET_P,
  secure: true 
});

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_P,
    api_key: process.env.CLOUDINARY_API_KEY_P,
    api_secret: process.env.CLOUDINARY_API_SECRET_P,
    secure: true
  });

  try {
    const data = await request.formData();
    const file = data.get("file") as File;
    
    if (!process.env.CLOUDINARY_API_KEY_P) {
      console.log("VARIABLES DISPONIBLES:", Object.keys(process.env).filter(k => k.includes("CLOUDINARY")));
      throw new Error("La API KEY no llegó al servidor. Revisa tu archivo .env");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "comprobantes_pagos",
          format: "webp",
          transformation: [{ quality: "auto", fetch_format: "webp" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    await prisma.detallePago.create({
      data: {
        id_plan: parseInt(data.get("id_plan") as string),
        id_usuario: data.get("id_usuario") as string,
        estado: 1, // Pendiente
        comprobante_url: uploadResponse.secure_url,
        mes_pago: data.get("mes_pago") as string,
        tiempo_pago: data.get("tiempo_pago") as string,
        metodo_pago: "Transferencia QR",
        fecha_detalle: new Date(),
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("DEBUG ERROR:", error.message);
    return NextResponse.json({ 
      error: "Error interno", 
      message: error.message 
    }, { status: 500 });
  }
}