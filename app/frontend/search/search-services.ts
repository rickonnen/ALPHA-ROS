/**
 * publicaciones.service.ts
 *
 * Servicio principal para consultar publicaciones con filtros combinados.
 *
 * CÓMO AGREGAR FILTROS DE OTRO COMPONENTE 
 * 1. Agrega el campo correspondiente a la interfaz `FiltrosPublicacion`.
 * 2. En `buildQuery()`, agrega la condición al array `conditions` siguiendo
 *    el mismo patrón (columna, operador, valor).
 * 3. Desde tu componente, incluye el valor en el objeto que pasas a
 *    `buscarPublicaciones(filtros)`.
 * 
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export interface FiltrosPublicacion {
  ubicacion?: string;
  operacion?: string;
  tipoInmueble?: string;
  habitaciones?: string;
  banos?: string;
  piscina?: string;

  //Filtros de componente corvo 
  /**
   * Corvo: agrega aquí los campos de tu componente.
   * Ejemplo:
   *   precioMin?: number;
   *   precioMax?: number;
   *   superficieMin?: number;
   *   ciudad?: string;
   */
}

// ajustar id

const OPERACION_ID: Record<string, number> = {
  "En venta": 1,
  "En alquiler": 2,
  "Anticrético": 3,
};

const TIPO_INMUEBLE_ID: Record<string, number> = {
  Casa: 1,
  Departamento: 2,
  Terreno: 3,
  "Local Comercial": 4,
  Oficina: 5,
};

function parsearMinimo(valor: string): number | null {
  const match = valor.match(/\+?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}


export async function buscarPublicaciones(filtros: FiltrosPublicacion) {
  let query = supabase
    .from("PUBLICACION")
    .select(
      `
      id_publicacion,
      titulo,
      descripcion,
      precio,
      superficie,
      habitaciones,
      banos,
      garajes,
      plantas,
      TIPOINMUEBLE ( id_tipo_inmueble, descripcion ),
      TIPOOPERACION ( id_tipo_operacion, descripcion ),
      ESTADOCONSTRUCCION ( id_estado_construccion, descripcion ),
      ESTADOPUBLICACION ( id_estado, descripcion ),
      MONEDA ( id_moneda, descripcion, simbolo ),
      ETIQUETAS ( id_etiqueta, descripcion ),
      ZONA ( id_zona, descripcion ),
      UBICACION (
        id_ubicacion,
        direccion,
        zona,
        latitud,
        longitud,
        CIUDAD ( id_ciudad, descripcion ),
        PAIS ( id_pais, descripcion )
      ),
      IMAGEN ( url ),
      PUBLICACIONCARACTERISTICA (
        CARACTERISTICA ( nombre, descripcion )
      )
    `
    )
    .eq("id_estado", 1);

  if (filtros.operacion) {
    const id = OPERACION_ID[filtros.operacion];
    if (id) query = query.eq("id_tipo_operacion", id);
  }

  if (filtros.tipoInmueble) {
    const id = TIPO_INMUEBLE_ID[filtros.tipoInmueble];
    if (id) query = query.eq("id_tipo_inmueble", id);
  }

  if (filtros.habitaciones && filtros.habitaciones !== "Sin ambientes") {
    const min = parsearMinimo(filtros.habitaciones);
    if (min !== null) query = query.gte("habitaciones", min);
  } else if (filtros.habitaciones === "Sin ambientes") {
    query = query.eq("habitaciones", 0);
  }

  // Baños  
  if (filtros.banos) {
    const min = parsearMinimo(filtros.banos);
    if (min !== null) query = query.gte("banos", min);
  }
  if (filtros.ubicacion?.trim()) {
    query = query.ilike("UBICACION.direccion", `%${filtros.ubicacion.trim()}%`);
  }

  // Filtros corvito
  // Ejemplo precio:
  //   if (filtros.precioMin) query = query.gte("precio", filtros.precioMin);
  //   if (filtros.precioMax) query = query.lte("precio", filtros.precioMax);
  //

  const { data, error } = await query;

  if (error) {
    console.error("[publicaciones.service] Error en la consulta:", error.message);
    throw new Error(error.message);
  }

  if (filtros.piscina === "Sí") {
    return (data ?? []).filter((pub: any) =>
      pub.PUBLICACIONCARACTERISTICA?.some(
        (pc: any) =>
          pc.CARACTERISTICA?.nombre?.toLowerCase() === "piscina"
      )
    );
  }

  if (filtros.piscina === "No") {
    return (data ?? []).filter(
      (pub: any) =>
        !pub.PUBLICACIONCARACTERISTICA?.some(
          (pc: any) =>
            pc.CARACTERISTICA?.nombre?.toLowerCase() === "piscina"
        )
    );
  }

  return data ?? [];
}