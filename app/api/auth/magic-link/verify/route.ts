import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * POST /api/auth/magic-link/verify
 * 
 * Valida el magic link:
 * 1. Recibe token y email del callback
 * 2. Valida que el token sea correcto
 * 3. Verifica que no esté expirado (15 min)
 * 4. Verifica que sea "pending"
 * 5. Crea/obtiene usuario en Supabase Auth
 * 6. Busca/crea usuario en Prisma (con ID de Supabase)
 * 7. Marca el intento como "consumed"
 * 8. Retorna datos para NextAuth
 */
export async function POST(req: NextRequest) {
  try {
    // 1️ Obtener datos del request
    const { token } = await req.json();

    // 2️ Validar que token no esté vacío
    if (!token || token.trim() === "") {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    // 3️ Hacer hash del token recibido para comparar con BD
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 4️ ATOMIC UPDATE: Buscar y marcar como consumed en UNA operación
    // Esto previene race condition donde dos peticiones usen el mismo token
    const ahora = new Date();
    const attemptUpdated = await prisma.magic_link_attempt.updateMany({
      where: {
        token: tokenHash,
        status: "pending",
        expires_at: {
          gt: ahora, // Token no expirado
        },
      },
      data: {
        status: "consumed",
        consumed_at: ahora,
      },
    });

    // Si no se actualizó ningún registro, significa que:
    // - El token ya fue consumido por otra petición
    // - El token expiró
    // - El token no existe
    if (attemptUpdated.count === 0) {
      console.error("[Magic Link Verify] Token inválido, expirado o ya consumido");
      return NextResponse.json(
        { 
          error: "Link inválido o expirado. Solicita uno nuevo." 
        },
        { status: 400 }
      );
    }

    console.log("[Magic Link] Token marcado como consumido de forma atómica");

    // 5️ Obtener el intento que acabamos de consumir para validaciones posteriores
    const attempt = await prisma.magic_link_attempt.findFirst({
      where: {
        token: tokenHash,
        status: "consumed",
      },
    });

    if (!attempt) {
      console.error("[Magic Link Verify] No se encontró intento consumido");
      return NextResponse.json(
        {
          error: "Error al procesar el link. Intenta nuevamente."
        },
        { status: 400 }
      );
    }

    const emailLower = attempt.email.toLowerCase();

    // 6️ IMPORTANTE: Crear/obtener usuario en Supabase Auth PRIMERO
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let userId: string;

    // Intentar crear usuario en Supabase Auth
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email: emailLower,
      email_confirm: true, // Confirmar el email automáticamente
    });

    if (authError) {
      // Si el error es que el usuario YA existe, obtener su ID desde Supabase Admin API
      if (authError.code === "email_exists" || authError.status === 422) {
        console.log("[Magic Link] Usuario ya existe en Auth, obteniendo ID...");
        
        try {
          //  Usar listUsers() con búsqueda optimizada
          // getUserByEmail() no existe en esta versión de Supabase
          const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000, // Buscar en los primeros 1000 usuarios
          });
          
          if (listError) {
            console.error("[Magic Link Verify] Error listando usuarios:", listError);
            return NextResponse.json(
              { error: "Error al obtener usuario. Intenta nuevamente." },
              { status: 500 }
            );
          }

          const existingAuthUser = usersData.users.find(u => 
            u.email?.toLowerCase() === emailLower
          );
          
          if (!existingAuthUser) {
            console.error("[Magic Link Verify] Usuario no encontrado en Auth");
            return NextResponse.json(
              { error: "Error al obtener usuario. Intenta nuevamente." },
              { status: 500 }
            );
          }

          userId = existingAuthUser.id;
          console.log("[Magic Link] Usuario existente obtenido:", userId);
        } catch (error) {
          console.error("[Magic Link Verify] Error obteniendo usuario existente:", error);
          return NextResponse.json(
            { error: "Error al obtener usuario. Intenta nuevamente." },
            { status: 500 }
          );
        }
      } else {
        // Otro error diferente
        console.error("[Magic Link Verify] Error creando usuario en Auth:", authError);
        return NextResponse.json(
          { error: "Error al crear usuario. Intenta nuevamente." },
          { status: 500 }
        );
      }
    } else if (!newAuthUser.user) {
      console.error("[Magic Link Verify] No se retornó usuario creado");
      return NextResponse.json(
        { error: "Error al crear usuario. Intenta nuevamente." },
        { status: 500 }
      );
    } else {
      userId = newAuthUser.user.id;
      console.log("[Magic Link] Nuevo usuario creado en Supabase Auth:", userId);
    }

    // 7️ Buscar usuario en Prisma por ID de Supabase
    let usuario = await prisma.usuario.findFirst({
      where: { id_usuario: userId },
    });

    // 8️ Si NO existe → CREAR usuario en Prisma
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          id_usuario: userId,
          email: emailLower,
          nombres: null, 
          apellidos: null,
          estado: 1,
          rol: null,
          ci: null,
          direccion: null,
          google_id: null,
          cant_publicaciones_restantes: null,
          url_foto_perfil: null,
          username: null,
          id_pais: null,
          fecha_nac: null,
          estado_civil: null,
          genero: null,
          publicaciones_hechas: 0,
          id_plan: null,
          dos_fa_habilitado: false,
          dos_fa_secreto: null,
          primary_provider: "magic_link",
          fecha_desactivacion: null,
        },
      });

      console.log("[Magic Link] Nuevo usuario creado en Prisma:", usuario.id_usuario);
    } else {
      // 9️ Si EXISTE → Actualizar estado a 1 si es necesario
      if (usuario.estado !== 1) {
        usuario = await prisma.usuario.update({
          where: { id_usuario: userId },
          data: { estado: 1 },
        });
        console.log("[Magic Link] Usuario reactivado:", usuario.id_usuario);
      }

      // Validar que no esté desactivado (soft delete)
      if (usuario.fecha_desactivacion !== null) {
        return NextResponse.json(
          { 
            error: "Tu cuenta ha sido desactivada. Contacta con soporte.",
          },
          { status: 403 }
        );
      }

      console.log("[Magic Link] Usuario existente verificado:", usuario.id_usuario);
    }

    // 9️ Limpiar intentos consumidos anteriores con este email para evitar conflicto de unique constraint
    await prisma.magic_link_attempt.deleteMany({
      where: {
        email: emailLower,
        status: "consumed",
        id: { not: attempt.id },
      },
    });

    // 10️ Retornar datos del usuario para NextAuth
    return NextResponse.json(
      {
        success: true,
        usuario: {
          id: usuario.id_usuario,
          email: usuario.email,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          username: usuario.username,
          url_foto_perfil: usuario.url_foto_perfil,
          estado: usuario.estado,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Magic Link Verify] Error:", error);
    return NextResponse.json(
      { error: "Error al verificar usuario. Intenta nuevamente" },
      { status: 500 }
    );
  }
}