"use client";

import { useState, useEffect } from "react";

/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 06/04/2026
 * Funcionalidad: custom hook para obtener la foto de perfil de un usuario
 * Gestiona el estado de carga y consume la API de perfil, retornando la 
 * URL de la imagen o una imagen por defecto en caso de ausencia o error
 */
export const useFotoPerfil = (idUsuario: string | undefined) => {
  const [strFotoPerfil, setStrFotoPerfil] = useState<string>("/account_avatar.svg");
  const [bolLoading, setBolLoading] = useState<boolean>(true);
  const [intRefreshKey, setIntRefreshKey] = useState(0);

  useEffect(() => {
    const handleFotoActualizada = () => {
      setIntRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("perfil:foto-actualizada", handleFotoActualizada);
    return () => {
      window.removeEventListener("perfil:foto-actualizada", handleFotoActualizada);
    };
  }, []);

  useEffect(() => {
    if (!idUsuario) {
      setStrFotoPerfil("/account_avatar.svg");
      setBolLoading(false);
      return;
    }

    const fetchFoto = async () => {
      try {
        setBolLoading(true);
        const res = await fetch(`/api/perfil/getFoto?id_usuario=${idUsuario}&r=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Error en la red");
        
        const json = await res.json();

        // verificamos que la propiedad exista y no sea nula/vacía
        if (json.url_foto_perfil) {
          setStrFotoPerfil(json.url_foto_perfil);
        } else {
          setStrFotoPerfil("/account_avatar.svg");
        }
      } catch (error) {
        console.error("Error al cargar la foto:", error);
        setStrFotoPerfil("/account_avatar.svg");
      } finally {
        setBolLoading(false);
      }
    };

    fetchFoto();
  }, [idUsuario, intRefreshKey]);

  return { strFotoPerfil, bolLoading };
};