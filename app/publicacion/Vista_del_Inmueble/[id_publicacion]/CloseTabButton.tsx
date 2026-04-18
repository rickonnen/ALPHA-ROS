/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Componente de cliente (Client Component) que ejecuta el cierre 
 *                 de la pestaña actual del navegador. Ideal para la acción "Volver" 
 *                 manteniendo intacto el estado de la pestaña anterior (ej. filtros 
 *                 de búsqueda).
 * @param props - Propiedades estándar de un botón HTML, incluyendo `children` para 
 *                su contenido visual (texto, íconos) y clases de estilo.
 * @return {JSX.Element} Botón interactivo con la acción nativa window.close().
 */
"use client";

import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function CloseTabButton({ children, ...props }: Props) {
  return (
    <button onClick={() => window.close()} {...props}>
      {children}
    </button>
  );
}