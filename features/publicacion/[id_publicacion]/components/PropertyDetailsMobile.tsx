/**
 * Dev: Marcela C.
 * Date: 17/04/2026
 * Funcionalidad: Vista mobile de detalles separados en Datos Generales y
 *                Datos Específicos con renderizado condicional por tipo de
 *                inmueble 
 * @param objInfo - Objeto extendido con datos generales, específicos y características
 * @return JSX con dos secciones diferenciadas visibles solo en mobile
 */
import React from "react";
import { PerfilDetallesProps, DetalleItem, CaracteristicaCard } from "./PropertyDetails";

export const PropertyDetailsMobile = ({ objInfo }: PerfilDetallesProps) => {
  const bolEsTerreno            = objInfo.strTipoInmueble === "Terreno";
  const bolTieneCaracteristicas = objInfo.arrCaracteristicas.length > 0;

  return (
    <div className="flex md:hidden flex-col gap-4">

      {/* ── DATOS GENERALES ── */}
      <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-black/5 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D] border-b border-[#2E2E2E]/5 pb-2">
          Datos Generales
        </h2>
        <div className="flex flex-col gap-y-2">
          <DetalleItem strLabel="Estado Construcción" strValor={objInfo.strEstadoConstruccion} />
          <DetalleItem strLabel="Departamento"        strValor={objInfo.strDepartamento} />
          <DetalleItem strLabel="Propiedad"           strValor={objInfo.strTipoInmueble} />
          <DetalleItem strLabel="Zona"                strValor={objInfo.strZona} />
          <DetalleItem strLabel="Operación"           strValor={objInfo.strTipoOperacion} />
        </div>
      </section>

      {/* ── DATOS ESPECÍFICOS — condicional por tipo ── */}
      {(!bolEsTerreno || bolTieneCaracteristicas) && (
        <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-black/5 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D] border-b border-[#2E2E2E]/5 pb-2">
            Datos Específicos
          </h2>
          {/* Métricas base — solo para construidos */}
          {!bolEsTerreno && (
            <div className="flex flex-col gap-y-2 mb-4">
              <DetalleItem strLabel="Hab."    strValor={objInfo.intHabitaciones} />
              <DetalleItem strLabel="Baños"   strValor={objInfo.intBanos} />
              <DetalleItem strLabel="Plantas" strValor={objInfo.intPlantas} />
              <DetalleItem strLabel="Garajes" strValor={objInfo.intGarajes} />
            </div>
          )}

          {/* Características adicionales */}
          {bolTieneCaracteristicas && (
            <div className="grid grid-cols-2 gap-3">
              {objInfo.arrCaracteristicas.map((item) => (
                <CaracteristicaCard
                  key={item.strNombre}
                  strNombre={item.strNombre}
                  strDetalle={item.strDetalle}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};