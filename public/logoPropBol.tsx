import React from 'react';
/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 12/04/2026
 * Logo PropBol creado en figma con url de svg para que cambie sus colores en base la paleta de colores
 */
interface LogoPropBolProps {
  className?: string;
}

export const LogoPropBol = ({ className }: LogoPropBolProps) => {
  return (
    <svg
      viewBox="0 0 189 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* cuerpo y ventanas */}
      <g fill="var(--primary)">
        <path d="M151.574 45H118.088L88.7871 24L59.4863 45H59.25V45.2236L58.7188 45.5869L43.5 55.9668V65.9717L59.25 54.7178V86.0811C68.4208 85.3803 78.2472 85 88.4668 85C98.8041 85 108.739 85.3892 118 86.1055V60H138V88.3037C156.343 90.9927 170.126 95.1321 176.161 100.001C150.651 97.7668 120.215 96.4678 87.5322 96.4678C55.7401 96.4678 26.0745 97.6969 1 99.8203C5.58205 96.2507 14.3392 93.0821 26 90.5996V74H26.25V45H26L88.7871 0L151.574 45Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M88 78H77V67H88V78ZM80.5 74.5H84.5V70.5H80.5V74.5Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M102 78H91V67H102V78ZM94.5 74.5H98.5V70.5H94.5V74.5Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M88 64H77V53H88V64ZM80.5 60.5H84.5V56.5H80.5V60.5Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M102 64H91V53H102V64ZM94.5 60.5H98.5V56.5H94.5V60.5Z" />
      </g>

      {/* flecha */}
      <path
        d="M188.479 50.5L141.604 86.3115V66.1826L150.105 60H118L83.3701 34.8389L123.359 49H163.856L122.604 19H147.247L188.479 50.5Z"
        fill="var(--secondary)"
      />
    </svg>
  );
};