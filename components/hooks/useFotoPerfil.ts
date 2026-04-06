"use client";

import { useState, useEffect } from "react";

/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 06/04/2026
 * Funcionalidad: custom hook para obtener la foto de perfil de un usuario
 * Gestiona el estado de carga y consume la API de perfil, retornando la 
 * URL de la imagen o una imagen por defecto en caso de ausencia o error
 */
export const useFotoPerfil = (idUsuario: string | undefined) => {
  const [strFotoPerfil, setStrFotoPerfil] = useState<string>("https://github.com/shadcn.png");
  const [bolLoading, setBolLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!idUsuario) {
      setStrFotoPerfil("https://github.com/shadcn.png");
      setBolLoading(false);
      return;
    }

    const fetchFoto = async () => {
      try {
        setBolLoading(true);
        // usamos la API (route.ts) David - StackOverFlow
        const res = await fetch(`/api/perfil/getFoto?id_usuario=${idUsuario}`);
        if (!res.ok) throw new Error("Error en la red");
        
        const json = await res.json();
        setStrFotoPerfil(json.url_foto_perfil);
      } catch (error) {
        // el estado ya tiene la imagen por defecto
        console.error("Error al cargar la foto:", error);
      } finally {
        setBolLoading(false);
      }
    };

    fetchFoto();
  }, [idUsuario]);

  return { strFotoPerfil, bolLoading };
};