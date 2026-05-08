/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: API endpoint for creating blog posts in the real estate platform.
 * It validates the authenticated user through the auth_token cookie, prevents
 * users from having more than one pending blog, validates the submitted data,
 * and creates the blog with NOPUBLICADO status for administrative review.
 * The image field is optional and fecha_publicacion is not used at this stage.
 * @return JSON response with the created blog identifier or an error message.
 */

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";

const INT_MAX_TITLE_LENGTH_BLO = 80;
const INT_MAX_DESCRIPTION_LENGTH_BLO = 120;
const INT_MAX_CONTENT_LENGTH_BLO = 400;
const INT_MAX_IMAGE_URL_LENGTH_BLO = 200;

export async function POST(request: NextRequest) {
  try {
    // ======================================================
    // 1. Leer la cookie de autenticación real del proyecto
    // ======================================================
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // ======================================================
    // 2. Validar el token JWT
    // ======================================================
    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "No autorizado. Token inválido." },
        { status: 401 }
      );
    }

    const strUserIdFromToken = decoded.userId;

    // ======================================================
    // 3. Verificar si el usuario ya tiene un blog pendiente
    // ======================================================
    const objPendingBlog = await prisma.blogs.findFirst({
      where: {
        id_user: strUserIdFromToken,
        estado: blogState.NOPUBLICADO,
      },
      select: {
        id_blog: true,
      },
    });

    if (objPendingBlog) {
      return NextResponse.json(
        { error: "Ya tienes un blog pendiente de revisión." },
        { status: 409 }
      );
    }

    // ======================================================
    // 4. Leer datos enviados desde el formulario
    // ======================================================
    const objBody = await request.json();

    const { StrTitleBlo, StrDescriptionBlo, StrImageUrlBlo, StrContentBlo } =
      objBody;

    // ======================================================
    // 5. Validar título
    // ======================================================
    if (!StrTitleBlo || typeof StrTitleBlo !== "string") {
      return NextResponse.json(
        { error: "El título es obligatorio." },
        { status: 400 }
      );
    }

    if (StrTitleBlo.trim().length > INT_MAX_TITLE_LENGTH_BLO) {
      return NextResponse.json(
        { error: "El título excede 80 caracteres." },
        { status: 400 }
      );
    }

    // ======================================================
    // 6. Validar descripción
    // ======================================================
    if (!StrDescriptionBlo || typeof StrDescriptionBlo !== "string") {
      return NextResponse.json(
        { error: "La descripción es obligatoria." },
        { status: 400 }
      );
    }

    if (StrDescriptionBlo.trim().length > INT_MAX_DESCRIPTION_LENGTH_BLO) {
      return NextResponse.json(
        { error: "La descripción excede 120 caracteres." },
        { status: 400 }
      );
    }

    // ======================================================
    // 7. Validar contenido
    // ======================================================
    if (!StrContentBlo || typeof StrContentBlo !== "string") {
      return NextResponse.json(
        { error: "El contenido es obligatorio." },
        { status: 400 }
      );
    }

    if (StrContentBlo.trim().length > INT_MAX_CONTENT_LENGTH_BLO) {
      return NextResponse.json(
        { error: "El contenido excede 400 caracteres." },
        { status: 400 }
      );
    }

    // ======================================================
    // 8. Validar imagen opcional
    // Si no llega imagen, se guarda null.
    // Si llega imagen, validamos la longitud de la URL.
    // ======================================================
    let strImageUrlBlo: string | null = null;

    if (StrImageUrlBlo && typeof StrImageUrlBlo === "string") {
      if (StrImageUrlBlo.trim().length > INT_MAX_IMAGE_URL_LENGTH_BLO) {
        return NextResponse.json(
          { error: "La URL de imagen excede 200 caracteres." },
          { status: 400 }
        );
      }

      strImageUrlBlo = StrImageUrlBlo.trim();
    }

    // ======================================================
    // 9. Crear blog como pendiente de revisión
    // No se usa fecha_publicacion porque el admin lo aprobará luego.
    // ======================================================
    const objUserExists = await prisma.usuario.findUnique({
      where: { id_usuario: strUserIdFromToken },
      select: { id_usuario: true },
    });

    console.log("[DEBUG] userId del token:", strUserIdFromToken);
    console.log("[DEBUG] Usuario encontrado en DB:", objUserExists);

    if (!objUserExists) {
      return NextResponse.json(
        { error: "Usuario no encontrado. Vuelve a iniciar sesión." },
        { status: 404 }
      );
    }
    const objNewBlog = await prisma.blogs.create({
      data: {
        id_user: strUserIdFromToken,
        titulo: StrTitleBlo.trim(),
        descripcion: StrDescriptionBlo.trim(),
        imagen_url: strImageUrlBlo,
        contenido: StrContentBlo.trim(),
        estado: blogState.NOPUBLICADO,
        fecha_creacion: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blog enviado a revisión correctamente.",
        data: {
          IntIdBlo: objNewBlog.id_blog,
        },
      },
      { status: 201 }
    );
  } catch (objError) {
    console.error("[CREATE_BLOG_ERROR]", objError);

    return NextResponse.json(
      { error: "No autorizado o error interno al crear el blog." },
      { status: 500 }
    );
  }
}