/**
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Componente visual que renderiza el gráfico de líneas (Recharts) adaptado 
 * para pantallas grandes (PC/Tablets). Incluye un Custom Tooltip detallado 
 * y remueve decimales en el Eje Y.
 * @param {ChartData[]} data - Arreglo de datos ya formateados y procesados por el orquestador.
 * @return {JSX.Element} Gráfico de rendimiento renderizado para resoluciones Desktop.
 */
"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
export interface ChartData {
  mes: string;
  fechaCompleta: string;
  vistas: number;
  compartidas: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: ChartData;
  }[];
  label?: string;
}
const CustomTooltipDesktop = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--card-border)] p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col gap-2 min-w-[180px]">
        {/* Fecha en 12px */}
        <p className="text-[12px] font-bold text-[var(--foreground)] mb-1">{payload[0].payload.fechaCompleta}</p>
        <div className="flex justify-between items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--muted-foreground)]">Vistas:</span>
          </div>
          <span className="font-bold text-[var(--foreground)]">{payload[0].value.toLocaleString("de-DE")}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
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
export const EstadisticasDesktop = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: "none" }}>
        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
        {/* Ejes forzados a 12px */}
        <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} minTickGap={15} />
        <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltipDesktop />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
        {/* Leyenda forzada a 12px */}
        <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: "12px", paddingBottom: "20px", color: "var(--foreground)" }} />
        <Line name="Vistas" type="monotone" dataKey="vistas" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
        <Line name="Compartidas" type="monotone" dataKey="compartidas" stroke="var(--secondary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};