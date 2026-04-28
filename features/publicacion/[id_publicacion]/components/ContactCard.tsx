/**
 * Dev: Gustavo Montaño
 * Date: 17/04/2026
 * Funcionalidad: Componente orquestador que gestiona la visualización de la 
 *                tarjeta de contacto del anunciante según el tamaño de la 
 *                pantalla (Desktop o Mobile).
 * @param props - Propiedades que incluyen la información del propietario y 
 *                el título del inmueble.
 * @return JSX.Element con la renderización condicional de la vista Desktop 
 *         y Mobile.
 */
"use client";

import React from "react";
import { ContactCardDesktop } from "./ContactCardDesktop";
import { ContactCardMobile } from "./ContactCardMobile";

export interface ContactoProps {
  objPropietario: {
    strNombres: string;
    strApellidos: string;
    strUsername: string;
    strEmail: string;
    strFotoUrl: string | null;
    arrTelefonos: string[]; 
    strDireccion?: string | null;
  };
  strTituloInmueble: string;
}

export const ContactCard = (props: ContactoProps) => {
  return (
    <>
      <ContactCardDesktop {...props} />
      <ContactCardMobile {...props} />
    </>
  );
};