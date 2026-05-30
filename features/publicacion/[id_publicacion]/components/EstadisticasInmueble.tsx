/**
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Componente orquestador que recibe el historial de datos de la DB, 
 * procesa la matemática de totales, formatea las fechas a hora UTC pura 
 * y decide dinámicamente si renderizar el gráfico Desktop o Mobile.
 * @param {EstadisticaData[]} estadisticas - Arreglo con el historial de rendimiento de la DB.
 * @return {JSX.Element} Contenedor principal de la sección de estadísticas y gráficos.
 */
"use client";
import React, { useMemo } from "react";
import { EstadisticasDesktop } from "./EstadisticasDesktop";
import { EstadisticasMobile } from "./EstadisticasMobile";
interface EstadisticaData {
  fecha: Date;
  vistas: number;
  compartidas: number;
}
interface EstadisticasInmuebleProps {
  estadisticas: EstadisticaData[];
}
export const EstadisticasInmueble = ({ estadisticas }: EstadisticasInmuebleProps) => {
  const { chartData, totalVistas, totalCompartidas } = useMemo(() => {
    if (!estadisticas || estadisticas.length === 0) {
      return { chartData: [], totalVistas: 0, totalCompartidas: 0 };
    }
    const tVistas = estadisticas.reduce((acc, est) => acc + est.vistas, 0);
    const tCompartidas = estadisticas.reduce((acc, est) => acc + est.compartidas, 0);
    const primeraFecha = new Date(estadisticas[0].fecha);
    const ultimaFecha = new Date(estadisticas[estadisticas.length - 1].fecha);
    const diferenciaDias = (ultimaFecha.getTime() - primeraFecha.getTime()) / (1000 * 3600 * 24);
    const formattedData = estadisticas.map((est) => {
      const dateObj = new Date(est.fecha);
      const dia = dateObj.getUTCDate();
      const mesCorto = dateObj.toLocaleDateString("es-ES", { timeZone: "UTC", month: "short" });
      const mesMayus = mesCorto.charAt(0).toUpperCase() + mesCorto.slice(1);
      const fechaCompleta = dateObj.toLocaleDateString("es-ES", { 
        timeZone: "UTC", 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
      const etiquetaX = diferenciaDias <= 31 ? `${dia} ${mesMayus}` : mesMayus;
      return {
        mes: etiquetaX,
        fechaCompleta: fechaCompleta,
        vistas: est.vistas,
        compartidas: est.compartidas,
      };
    });
    return { chartData: formattedData, totalVistas: tVistas, totalCompartidas: tCompartidas };
  }, [estadisticas]);

  if (chartData.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] p-8 md:p-10 rounded-3xl shadow-sm border border-[var(--card-border)] text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--primary)] mb-2 text-left">Estadísticas</h2>
        <p className="text-[var(--muted-foreground)] mt-4">Aún no hay datos de rendimiento para esta publicación.</p>
      </div>
    );
  }
  return (
    <div className="bg-[var(--card-bg)] p-8 md:p-10 rounded-3xl shadow-sm border border-[var(--card-border)] mb-8">
      
      {/* HEADER: Títulos y Totales */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
        
        {/* Título alineado perfectamente con "Contacto" */}
        <h2 className="text-2xl font-bold text-[var(--primary)]">
          Estadísticas
        </h2>
        
        <div className="flex gap-4 w-full md:w-auto">
          {/* Card Total Vistas */}
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-[var(--card-border)] flex-1 md:flex-none flex flex-col items-center min-w-[130px]">
            <p className="text-sm text-[var(--muted-foreground)] font-medium pb-2 w-full text-center">Vistas</p>
            {/* Línea separadora sutil */}
            <div className="w-full border-t border-[var(--card-border)] opacity-60 mb-2"></div>
            {/* Número en Azul Petróleo */}
            <p className="text-2xl font-bold text-[var(--primary)]">{totalVistas.toLocaleString("de-DE")}</p>
          </div>
          
          {/* Card Total Compartidas */}
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-[var(--card-border)] flex-1 md:flex-none flex flex-col items-center min-w-[130px]">
            <p className="text-sm text-[var(--muted-foreground)] font-medium pb-2 w-full text-center">Compartidas</p>
            {/* Línea separadora sutil */}
            <div className="w-full border-t border-[var(--card-border)] opacity-60 mb-2"></div>
            {/* Número en Azul Petróleo */}
            <p className="text-2xl font-bold text-[var(--primary)]">{totalCompartidas.toLocaleString("de-DE")}</p>
          </div>
        </div>
      </div>
      {/* CONTENEDORES DE GRÁFICOS */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[var(--card-border)]">
        <div className="h-[250px] md:h-[350px] w-full">
          <div className="hidden md:block w-full h-full">
            <EstadisticasDesktop data={chartData} />
          </div>
          <div className="block md:hidden w-full h-full">
            <EstadisticasMobile data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};