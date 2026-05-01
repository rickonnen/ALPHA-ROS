/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: API endpoint for uploading blog images to Cloudinary.
 * It validates the authenticated user, validates the image extension, MIME type,
 * file name length, file size and image ratio before uploading to Cloudinary.
 * @return JSON response with the secure Cloudinary image URL or an error message.
 */

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

const INT_MAX_IMAGE_SIZE_BLO = 5 * 1024 * 1024;
const INT_MAX_IMAGE_NAME_LENGTH_BLO = 12;

const ARR_ALLOWED_IMAGE_EXTENSIONS_BLO = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "No autorizado. Token inválido." },
        { status: 401 }
      );
    }

    const objFormData = await request.formData();
    const objFile = objFormData.get("file") as File | null;

    if (!objFile) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    const strFileNameBlo = objFile.name;
    const arrFilePartsBlo = strFileNameBlo.split(".");
    const strFileExtensionBlo =
      arrFilePartsBlo.length > 1
        ? arrFilePartsBlo.pop()?.toLowerCase()
        : "";

    const strFileNameWithoutExtensionBlo = arrFilePartsBlo.join(".");

    if (!strFileExtensionBlo) {
      return NextResponse.json(
        { error: "La imagen debe tener una extensión válida." },
        { status: 400 }
      );
    }

    if (!ARR_ALLOWED_IMAGE_EXTENSIONS_BLO.includes(strFileExtensionBlo)) {
      return NextResponse.json(
        {
          error:
            "Formato de imagen no permitido. Solo se aceptan JPG, JPEG, PNG, WEBP o GIF.",
        },
        { status: 400 }
      );
    }

    if (!objFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo seleccionado debe ser una imagen." },
        { status: 400 }
      );
    }

    if (
      strFileNameWithoutExtensionBlo.trim().length >
      INT_MAX_IMAGE_NAME_LENGTH_BLO
    ) {
      return NextResponse.json(
        { error: "El nombre de la imagen no debe exceder 12 caracteres." },
        { status: 400 }
      );
    }

    if (objFile.size > INT_MAX_IMAGE_SIZE_BLO) {
      return NextResponse.json(
        { error: "La imagen no debe superar los 5 MB." },
        { status: 400 }
      );
    }

    const arrBuffer = await objFile.arrayBuffer();
    const objBuffer = Buffer.from(arrBuffer);

    // ======================================================
    // Validar proporción 4:3 en backend con tolerancia
    // ======================================================
    const objMetadataBlo = await sharp(objBuffer).metadata();

    const intWidthBlo = objMetadataBlo.width;
    const intHeightBlo = objMetadataBlo.height;

    if (!intWidthBlo || !intHeightBlo) {
      return NextResponse.json(
        { error: "No se pudieron leer las dimensiones de la imagen." },
        { status: 400 }
      );
    }

    const numCurrentRatioBlo = intWidthBlo / intHeightBlo;
    const numExpectedRatioBlo = 4 / 3;
    const numToleranceBlo = 0.03;

    const bolIsValidRatioBlo =
      Math.abs(numCurrentRatioBlo - numExpectedRatioBlo) <= numToleranceBlo;

    if (!bolIsValidRatioBlo) {
      return NextResponse.json(
        {
          error:
            "Mal formato de imagen. La imagen debe tener proporción 4:3 o muy cercana, por ejemplo 1440x1080, 1200x900, 1024x768 u 800x600.",
        },
        { status: 400 }
      );
    }

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