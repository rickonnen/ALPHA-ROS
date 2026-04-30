/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: API endpoint for retrieving the authenticated user's pending
 * blog post. It validates the auth_token cookie, identifies the current user
 * and returns the blog information only if it has NOPUBLICADO status. This data
 * is used to display the pending blog page.
 * @return JSON response with the pending blog data or an error message.
 */

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";

export async function GET(request: NextRequest) {
  try {
    // ======================================================
    // 1. Leer cookie de autenticación
    // ======================================================
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // ======================================================
    // 2. Validar JWT
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

    // ======================================================
    // 3. Buscar el blog pendiente del usuario autenticado
    // ======================================================
    const objPendingBlog = await prisma.blogs.findFirst({
      where: {
        id_user: decoded.userId,
        estado: blogState.NOPUBLICADO,
      },
      select: {
        id_blog: true,
        titulo: true,
        descripcion: true,
        imagen_url: true,
        contenido: true,
        fecha_creacion: true,
        estado: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    if (!objPendingBlog) {
      return NextResponse.json(
        { error: "No tienes blogs pendientes." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: objPendingBlog,
      },
      { status: 200 }
    );
  } catch (objError) {
    console.error("[GET_PENDING_BLOG_ERROR]", objError);

    return NextResponse.json(
      { error: "Error al obtener el blog pendiente." },
      { status: 500 }
    );
  }
}