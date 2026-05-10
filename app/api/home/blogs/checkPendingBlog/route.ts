/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: API endpoint for checking whether the authenticated user already
 * has a pending blog post. It validates the auth_token cookie, identifies the
 * current user and searches for a blog with NOPUBLICADO status. This endpoint
 * is used before opening the blog creation form and before submitting a new blog.
 * @return JSON response indicating whether the user has a pending blog.
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
    // 3. Buscar blog pendiente del usuario
    // ======================================================
    const objPendingBlog = await prisma.blogs.findFirst({
      where: {
        id_user: decoded.userId,
        estado: blogState.NOPUBLICADO,
      },
      select: {
        id_blog: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        hasPendingBlog: Boolean(objPendingBlog),
      },
      { status: 200 }
    );
  } catch (objError) {
    console.error("[CHECK_PENDING_BLOG_ERROR]", objError);

    return NextResponse.json(
      { error: "Error al verificar blog pendiente." },
      { status: 500 }
    );
  }
}