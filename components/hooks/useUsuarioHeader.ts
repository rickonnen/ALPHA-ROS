/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 12/04/2026
 * Hook personalizado para obtener y gestionar el nombre del usuario en el encabezado
 * Escucha eventos de actualización de perfil para mantener el dato sincronizado sin recargar
 * @param objUser Objeto del usuario autenticado proveniente del contexto AuthContext
 * @return Un objeto que contiene strNombreHeader con el nombre
 */
import { useState, useEffect } from "react";

export const useUsuarioHeader = (objUser: any) => {
  const [objNombreHeader, setObjNombreHeader] = useState({ idUsuario: "", nombre: "" });

  useEffect(() => {
    // si no existe un id de usuario cancelamos la ejecución
    if (!objUser?.id) return;

    const fetchNombreActualizado = async () => {
      try {
        const res = await fetch(`/api/perfil/getUsuario?id_usuario=${objUser.id}`, { cache: "no-store" });
        // si la petición a la API falla salimos de la función
        if (!res.ok) return;

        const json = await res.json();
        const strNombreCompleto = `${json?.data?.nombres?.trim() ?? ""} ${json?.data?.apellidos?.trim() ?? ""}`.trim();
        
        setObjNombreHeader({
          idUsuario: objUser.id,
          nombre: strNombreCompleto || json?.data?.username?.trim() || objUser.name || "",
        });
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };

    const handlePerfilActualizado = () => void fetchNombreActualizado();
    window.addEventListener("perfil:foto-actualizada", handlePerfilActualizado);
    // limpiamos el listener cuando el componente se desmonta
    return () => window.removeEventListener("perfil:foto-actualizada", handlePerfilActualizado);
  }, [objUser?.id, objUser?.name]);

  const strNombreHeader = objNombreHeader.idUsuario === (objUser?.id ?? "") && objNombreHeader.nombre
    ? objNombreHeader.nombre
    : (objUser?.name ?? "");

  return { strNombreHeader };
};