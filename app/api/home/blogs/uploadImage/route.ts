/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: API endpoint for uploading blog images to Cloudinary.
 * It validates the authenticated user through the auth_token cookie, receives
 * an image file from FormData, validates that the file is an image and checks
 * its maximum allowed size. If the validation is successful, the image is
 * uploaded to the Cloudinary folder used for blog images.
 * @return JSON response with the secure Cloudinary image URL or an error message.
 */

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar si existe la cookie de autenticación
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // 2. Validar el JWT usando el mismo secret del proyecto
    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "No autorizado. Token inválido." },
        { status: 401 }
      );
    }

    // 3. Leer la imagen enviada desde el formulario
    const objFormData = await request.formData();
    const objFile = objFormData.get("file") as File | null;

    if (!objFile) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    // 4. Validar que sea una imagen
    if (!objFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo seleccionado debe ser una imagen." },
        { status: 400 }
      );
    }

    // 5. Validar tamaño máximo, ejemplo: 5 MB
    const intMaxSize = 5 * 1024 * 1024;

    if (objFile.size > intMaxSize) {
      return NextResponse.json(
        { error: "La imagen no debe superar los 5 MB." },
        { status: 400 }
      );
    }

    // 6. Convertir imagen a buffer
    const arrBuffer = await objFile.arrayBuffer();
    const objBuffer = Buffer.from(arrBuffer);

    // 7. Subir imagen a Cloudinary
    const objUploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "propbol/blogs",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        )
        .end(objBuffer);
    });

    // 8. Responder con la URL segura de la imagen
    return NextResponse.json(
      {
        success: true,
        imageUrl: objUploadResult.secure_url,
      },
      { status: 200 }
    );
  } catch (objError) {
    console.error("[UPLOAD_BLOG_IMAGE_ERROR]", objError);

    return NextResponse.json(
      { error: "No autorizado o error al subir la imagen." },
      { status: 500 }
    );
  }
}