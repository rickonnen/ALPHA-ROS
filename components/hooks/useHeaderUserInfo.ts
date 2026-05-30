"use client";

import { useState, useEffect } from "react";

/**
 * Dev: Rodrigo Saul Zarate Villarroel       Fecha: 15/05/2026
 * funcionalidad: hook unificado para obtener nombre, iniciales y foto de perfil del usuario.
 * Escucha eventos de actualización de perfil para sincronizar en tiempo real.
 * @param objUser Objeto del usuario autenticado proveniente del contexto
 * @return Objeto con strNombreCompleto, strFotoPerfil, strIniciales y bolLoading
 */
export const useHeaderUserInfo = (objUser: any) => {
  const [strNombreCompleto, setStrNombreCompleto] = useState("");
  const [strIniciales, setStrIniciales] = useState("");
  const [strFotoPerfil, setStrFotoPerfil] = useState("");
  const [bolLoading, setBolLoading] = useState(true);

  useEffect(() => {
    // si no hay id de usuario establecemos valores por defecto para estado no logeado
    if (!objUser?.id) {
      setStrNombreCompleto("");
      setStrIniciales("");
      setStrFotoPerfil("");
      setBolLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setBolLoading(true);
        // Usamos la nueva ruta api/home/getHeaderInfo
        const res = await fetch(`/api/home/getHeaderInfo?id_usuario=${objUser.id}&r=${Date.now()}`, { 
          cache: "no-store" 
        });
        
        if (!res.ok) throw new Error("Error en la petición");
        
        const json = await res.json();
        const objData = json?.data;

        // Extraer y limpiar datos
        const strNombres = objData?.nombres?.trim() || "";
        const strApellidos = objData?.apellidos?.trim() || "";
        
        const truncate = (str: string, limit: number): string => {
          if (!str) return "";
          return str.length > limit ? str.substring(0, limit) + "." : str;
        };

        const strNombresCortos = truncate(strNombres, 7);
        const strApellidosCortos = truncate(strApellidos, 7);
        const strNombreArmado = `${strNombresCortos} ${strApellidosCortos}`.trim();
        
        // Determinar el nombre final
        const strNombreFinal = strNombreArmado || objData?.username?.trim() || objUser.name || "";
        
        // Generar iniciales
        let strInicialesCalculadas = "US";
        if (strNombres && strApellidos) {
          strInicialesCalculadas = `${strNombres.charAt(0)}${strApellidos.charAt(0)}`.toUpperCase();
        } else if (strNombreFinal) {
          strInicialesCalculadas = strNombreFinal.substring(0, 2).toUpperCase();
        }

        // Actualizar estados
        setStrNombreCompleto(strNombreFinal);
        setStrIniciales(strInicialesCalculadas);
        setStrFotoPerfil(objData?.url_foto_perfil || "");

      } catch (error) {
        console.error("Error obteniendo info de usuario:", error);
        setStrIniciales("US");
      } finally {
        setBolLoading(false);
      }
    };

    fetchUserInfo();

    const handlePerfilActualizado = () => void fetchUserInfo();
    window.addEventListener("perfil:foto-actualizada", handlePerfilActualizado);
    
    // limpiamos el listener cuando el componente se desmonta
    return () => window.removeEventListener("perfil:foto-actualizada", handlePerfilActualizado);
  }, [objUser?.id, objUser?.name]);

  return { strNombreCompleto, strFotoPerfil, strIniciales, bolLoading };
};