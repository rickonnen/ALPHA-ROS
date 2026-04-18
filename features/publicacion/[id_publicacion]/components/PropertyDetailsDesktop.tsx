/**
 * Dev: Marcela C.
 * Date: 17/04/2026
 * Funcionalidad: Vista desktop de detalles separados en Datos Generales y
 *                Datos Específicos con renderizado condicional por tipo de
 *                inmueble
 * @param objInfo - Objeto extendido con datos generales, específicos y características
 * @return JSX con dos secciones diferenciadas visibles solo en desktop
 */
import React from "react";
import { PerfilDetallesProps, DetalleItem, CaracteristicaCard } from "./PropertyDetails";

export const PropertyDetailsDesktop = ({ objInfo }: PerfilDetallesProps) => {
  const bolEsTerreno          = objInfo.strTipoInmueble === "Terreno";
  const bolTieneCaracteristicas = objInfo.arrCaracteristicas.length > 0;

  return (
    <div className="hidden md:flex flex-col gap-6">

      {/* ── DATOS GENERALES ── */}
      <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-black/5 shadow-sm">
        <h2 className="text-2xl font-bold mb-8 border-b border-[#2E2E2E]/5 pb-2 text-[#1F3A4D]">
          Datos Generales
        </h2>
        <div className="grid grid-cols-2 gap-x-20 gap-y-4">
          <DetalleItem strLabel="Estado de Construcción" strValor={objInfo.strEstadoConstruccion} />
          <DetalleItem strLabel="Departamento"           strValor={objInfo.strDepartamento} />
          <DetalleItem strLabel="Tipo de propiedad"      strValor={objInfo.strTipoInmueble} />
          <DetalleItem strLabel="Zona"                   strValor={objInfo.strZona} />
          <DetalleItem strLabel="Tipo de operación"      strValor={objInfo.strTipoOperacion} />
        </div>
      </section>

      {/* ── DATOS ESPECÍFICOS — condicional por tipo ── */}
      {(!bolEsTerreno || bolTieneCaracteristicas) && (
        <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-black/5 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 border-b border-[#2E2E2E]/5 pb-2 text-[#1F3A4D]">
            Datos Específicos
          </h2>

          {/* Métricas base — solo para construidos */}
          {!bolEsTerreno && (
            <div className="grid grid-cols-2 gap-x-20 gap-y-4 mb-6">
              <DetalleItem strLabel="Habitaciones"   strValor={objInfo.intHabitaciones} />
              <DetalleItem strLabel="Nro de Plantas" strValor={objInfo.intPlantas} />
              <DetalleItem strLabel="Baños"          strValor={objInfo.intBanos} />
              <DetalleItem strLabel="Garajes"        strValor={objInfo.intGarajes} />
            </div>
          )}

          {/* Características adicionales */}
          {bolTieneCaracteristicas && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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