/* Dev: Alvarado Alisson Dalet - sow-AlissonA
   Fecha: 08/04/2026
   Funcionalidad: Subir fotos
*/
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_PROFILE_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_PROFILE_API_KEY,
  api_secret: process.env.CLOUDINARY_PROFILE_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("foto") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const arrTiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!arrTiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    // Validar tamaño máximo (2MB)
    const intMaxBytes = 2 * 1024 * 1024;
    if (file.size > intMaxBytes) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 2MB." },
        { status: 400 }
      );
    }

    const arrBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrBuffer);

    const objResultado = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "profile-pictures" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json(
      { url: objResultado.secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al subir foto a Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}