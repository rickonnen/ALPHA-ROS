/**
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Componente visual que renderiza el gráfico de líneas (Recharts) optimizado 
 * para pantallas móviles. Ajusta márgenes al límite, reposiciona leyendas y 
 * utiliza un Tooltip compacto para evitar desbordamientos de pantalla.
 * @param {ChartData[]} data - Arreglo de datos ya formateados y procesados por el orquestador.
 * @return {JSX.Element} Gráfico de rendimiento renderizado para resoluciones Mobile.
 */
"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartData } from "./EstadisticasDesktop";
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: ChartData;
  }[];
  label?: string;
}
const CustomTooltipMobile = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--card-border)] p-3 rounded-lg shadow-md flex flex-col gap-1.5 min-w-[140px]">
        {/* Fecha a 12px */}
        <p className="text-[12px] font-bold text-[var(--foreground)] mb-0.5">{payload[0].payload.fechaCompleta}</p>
        <div className="flex justify-between items-center gap-2 text-[12px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--muted-foreground)]">Vistas:</span>
          </div>
          <span className="font-bold text-[var(--foreground)]">{payload[0].value.toLocaleString("de-DE")}</span>
        </div>
        <div className="flex justify-between items-center gap-2 text-[12px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--secondary)]" />
            <span className="text-[var(--muted-foreground)]">Compartidas:</span>
          </div>
          <span className="font-bold text-[var(--foreground)]">{payload[1].value.toLocaleString("de-DE")}</span>
        </div>
      </div>
    );
  }
  return null;
};
export const EstadisticasMobile = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} style={{ outline: "none" }}>
        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
        {/* Ejes forzados a 12px */}
        <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} dy={8} minTickGap={5} />
        <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} dx={-5} />
        <Tooltip content={<CustomTooltipMobile />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
        {/* Leyenda forzada a 12px */}
        <Legend verticalAlign="top" align="center" iconType="plainline" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px", color: "var(--foreground)" }} />
        <Line name="Vistas" type="monotone" dataKey="vistas" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        <Line name="Compartidas" type="monotone" dataKey="compartidas" stroke="var(--secondary)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};