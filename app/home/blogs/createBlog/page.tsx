/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: Create blog page for the real estate platform.
 * It allows authenticated users to submit a blog post for administrative review.
 * The image is optional and the blog is created with pending status.
 * @return Create blog form page content.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/auth/AuthContext";

export default function CreateBlogPage() {
  const router = useRouter();

  // ======================================================
  // AuthContext del proyecto
  // Se usa para validar desde frontend si hay usuario.
  // La validación segura real se hace también en las APIs
  // mediante la cookie auth_token.
  // ======================================================
  const auth = useAuth();
  const objUser = auth.user;
  const bolIsAuthLoading = false;

  // ======================================================
  // Estados del formulario
  // ======================================================
  const [strTitleBlo, setStrTitleBlo] = useState("");
  const [strDescriptionBlo, setStrDescriptionBlo] = useState("");
  const [strContentBlo, setStrContentBlo] = useState("");
  const [objImageFile, setObjImageFile] = useState<File | null>(null);

  const [bolIsLoading, setBolIsLoading] = useState(false);
  const [strError, setStrError] = useState("");

  // ======================================================
  // Cancelar creación
  // ======================================================
  const handleCancel = () => {
    router.push("/home/blogs");
  };

  // ======================================================
  // Crear blog
  // Flujo:
  // 1. Validar campos.
  // 2. Verificar si ya tiene blog pendiente.
  // 3. Subir imagen solo si el usuario seleccionó una.
  // 4. Crear blog como NOPUBLICADO.
  // 5. Redirigir a la página de blog pendiente.
  // ======================================================
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStrError("");

    // ======================================================
    // Validación de sesión desde frontend
    // ======================================================
    if (bolIsAuthLoading) {
      setStrError("Se está verificando tu sesión. Intenta nuevamente.");
      return;
    }

    if (!objUser) {
      setStrError("Debes iniciar sesión para crear un blog.");
      return;
    }

    // ======================================================
    // Validaciones del título
    // ======================================================
    if (!strTitleBlo.trim()) {
      setStrError("El título es obligatorio.");
      return;
    }

    if (strTitleBlo.trim().length > 100) {
      setStrError("El título no debe exceder 100 caracteres.");
      return;
    }

    // ======================================================
    // Validaciones de la descripción
    // ======================================================
    if (!strDescriptionBlo.trim()) {
      setStrError("La descripción es obligatoria.");
      return;
    }

    if (strDescriptionBlo.trim().length > 120) {
      setStrError("La descripción no debe exceder 120 caracteres.");
      return;
    }

    // ======================================================
    // Validaciones del contenido
    // ======================================================
    if (!strContentBlo.trim()) {
      setStrError("El contenido es obligatorio.");
      return;
    }

    if (strContentBlo.trim().length > 400) {
      setStrError("El contenido no debe exceder 400 caracteres.");
      return;
    }

    try {
      setBolIsLoading(true);

      // ======================================================
      // 1. Verificar si el usuario ya tiene un blog pendiente
      // ======================================================
      const objCheckResponse = await fetch("/api/home/blogs/checkPendingBlog", {
        method: "GET",
      });

      const objCheckData = await objCheckResponse.json();

      if (!objCheckResponse.ok) {
        throw new Error(
          objCheckData.error ||
            "No se pudo verificar si tienes blogs pendientes."
        );
      }

      if (objCheckData.hasPendingBlog) {
        router.push("/home/blogs/pending");
        return;
      }

      // ======================================================
      // 2. Imagen opcional
      // ======================================================
      let strImageUrlBlo: string | null = null;

      if (objImageFile) {
        const objFormData = new FormData();
        objFormData.append("file", objImageFile);

        const objUploadResponse = await fetch("/api/home/blogs/uploadImage", {
          method: "POST",
          body: objFormData,
        });

        const objUploadData = await objUploadResponse.json();

        if (!objUploadResponse.ok) {
          throw new Error(objUploadData.error || "Error al subir la imagen.");
        }

        strImageUrlBlo = objUploadData.imageUrl;
      }

      // ======================================================
      // 3. Crear blog como pendiente
      // ======================================================
      const objCreateResponse = await fetch("/api/home/blogs/createBlog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          StrTitleBlo: strTitleBlo.trim(),
          StrDescriptionBlo: strDescriptionBlo.trim(),
          StrImageUrlBlo: strImageUrlBlo,
          StrContentBlo: strContentBlo.trim(),
        }),
      });

      const objCreateData = await objCreateResponse.json();

      // ======================================================
      // Si ya tiene blog pendiente, redirigir a su blog pendiente
      // ======================================================
      if (objCreateResponse.status === 409) {
        router.push("/home/blogs/pending");
        return;
      }

      if (!objCreateResponse.ok) {
        throw new Error(objCreateData.error || "Error al crear el blog.");
      }

      // ======================================================
      // Si todo salió bien, ir a la página del blog pendiente
      // ======================================================
      router.push("/home/blogs/pending");
    } catch (error) {
      const strMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado.";

      setStrError(strMessage);
    } finally {
      setBolIsLoading(false);
    }
  };

  // ======================================================
  // Estado de carga de sesión
  // ======================================================
  if (bolIsAuthLoading) {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-12 text-foreground sm:px-6 lg:px-10">
        <section className="mx-auto max-w-xl rounded-[28px] border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-primary">
            Verificando sesión...
          </h1>

          <p className="mt-3 text-sm text-foreground/70">
            Espera un momento mientras validamos tu acceso.
          </p>
        </section>
      </main>
    );
  }

  // ======================================================
  // Usuario no autenticado
  // ======================================================
  if (!objUser) {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-12 text-foreground sm:px-6 lg:px-10">
        <section className="mx-auto max-w-xl rounded-[28px] border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Acceso requerido
          </p>

          <h1 className="text-2xl font-bold text-primary">
            Debes iniciar sesión
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground/70">
            Para enviar una publicación al blog necesitas iniciar sesión
            primero.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] hover:opacity-90"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => router.push("/home/blogs")}
              className="rounded-2xl border border-card-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary-fund"
            >
              Cancelar
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ======================================================
  // Formulario principal
  // ======================================================
  return (
    <main className="min-h-screen w-full bg-background px-4 py-12 text-foreground sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Blog inmobiliario
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Crear blog
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground/75 sm:text-base">
            Envía tu publicación para revisión. Un administrador evaluará el
            contenido antes de que aparezca en la sección pública de blogs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-card-border bg-card-bg p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-6">
            {/* ======================================================
                Campo título
            ====================================================== */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Título
              </label>

              <input
                type="text"
                value={strTitleBlo}
                onChange={(event) => setStrTitleBlo(event.target.value)}
                maxLength={100}
                placeholder="Ej: Consejos para elegir una vivienda familiar"
                className="w-full rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
              />

              <p className="mt-1 text-xs text-foreground/60">
                {strTitleBlo.length}/100 caracteres.
              </p>
            </div>

            {/* ======================================================
                Campo descripción
            ====================================================== */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Descripción
              </label>

              <textarea
                value={strDescriptionBlo}
                onChange={(event) => setStrDescriptionBlo(event.target.value)}
                maxLength={120}
                placeholder="Resume brevemente el tema principal de tu publicación."
                rows={3}
                className="w-full resize-none rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
              />

              <p className="mt-1 text-xs text-foreground/60">
                {strDescriptionBlo.length}/120 caracteres.
              </p>
            </div>

            {/* ======================================================
                Campo imagen opcional
            ====================================================== */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Imagen opcional
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setObjImageFile(event.target.files?.[0] || null)
                }
                className="w-full rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
              />

              <p className="mt-1 text-xs text-foreground/60">
                  La imagen es opcional. Si decides subir una, debe tener un formato
                  recomendado de 4:3 y el nombre del archivo debe tener como máximo
                  12 caracteres.
              </p>
            </div>

            {/* ======================================================
                Campo contenido
            ====================================================== */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Contenido
              </label>

              <textarea
                value={strContentBlo}
                onChange={(event) => setStrContentBlo(event.target.value)}
                maxLength={400}
                placeholder="Escribe el contenido principal del blog."
                rows={8}
                className="w-full resize-none rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
              />

              <p className="mt-1 text-xs text-foreground/60">
                {strContentBlo.length}/400 caracteres.
              </p>
            </div>

            {/* ======================================================
                Mensaje de error
            ====================================================== */}
            {strError && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {strError}
              </div>
            )}

            {/* ======================================================
                Botones
            ====================================================== */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={bolIsLoading}
                className="rounded-2xl border border-card-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary-fund disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={bolIsLoading}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bolIsLoading ? "Enviando..." : "Solicitar revisión"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}