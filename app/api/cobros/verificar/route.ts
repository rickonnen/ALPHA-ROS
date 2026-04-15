import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const id_usuario = data.get("id_usuario") as string;
    const id_plan = data.get("id_plan") as string;
    const file = data.get("file") as File;
   

    if (!file) {
      return NextResponse.json({ error: "No se envió el comprobante" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    //convertir las imagenes de comprobante en webp 500x500px
    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "comprobantes_pagos",
          format: "webp", 
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "center" }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    
    await prisma.detallePago.create({
      data: {
        id_plan: parseInt(id_plan),
        id_usuario: id_usuario,
        estado: 1,
        metodo_pago: "Transferencia QR",
        fecha_detalle: new Date(),
        comprobante_url: uploadResponse.secure_url
      }
    });

    

    return NextResponse.json({
      success: true,
      mensaje: "Registro creado (Imagen en consola)",
      url_detectada: uploadResponse.secure_url 
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}