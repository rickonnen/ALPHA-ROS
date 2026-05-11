import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// Elimina: import sharp from "sharp";

const INT_MAX_IMAGE_SIZE_BLO = 5 * 1024 * 1024;
const INT_MAX_IMAGE_NAME_LENGTH_BLO = 12;
const ARR_ALLOWED_IMAGE_EXTENSIONS_BLO = ["jpg", "jpeg", "png", "webp", "gif"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_BLOGS,
  api_key: process.env.CLOUDINARY_API_KEY_BLOGS,
  api_secret: process.env.CLOUDINARY_API_SECRET_BLOGS,
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
        { error: "Formato de imagen no permitido. Solo se aceptan JPG, JPEG, PNG, WEBP o GIF." },
        { status: 400 }
      );
    }

    if (!objFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo seleccionado debe ser una imagen." },
        { status: 400 }
      );
    }

    if (strFileNameWithoutExtensionBlo.trim().length > INT_MAX_IMAGE_NAME_LENGTH_BLO) {
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

    // ======================================================
    // La validación 4:3 ya se hace en el frontend.
    // Aquí solo subimos directamente a Cloudinary.
    // ======================================================
    const arrBuffer = await objFile.arrayBuffer();
    const objBuffer = Buffer.from(arrBuffer);

    const objUploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "propbol/blogs", resource_type: "image" },
          (error, result) => {
            if (error) { reject(error); return; }
            resolve(result);
          }
        )
        .end(objBuffer);
    });

    return NextResponse.json(
      { success: true, imageUrl: objUploadResult.secure_url },
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