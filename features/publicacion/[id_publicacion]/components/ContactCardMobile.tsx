"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useTracking } from "@/components/hooks/useTracking";
import { ContactoProps } from "./ContactCard";

export const ContactCardMobile = ({
  id_publicacion,
  objPropietario,
  strTituloInmueble,
}: ContactoProps) => {
  const { trackEvent } = useTracking();
  const strNombreCompleto =
    `${objPropietario.strNombres} ${objPropietario.strApellidos}`.trim();
  const strMensajeWs = `Hola, estoy interesado en tu propiedad "${strTituloInmueble}" publicada en PropBol.`;
  const strUrlCorreo = `mailto:${objPropietario.strEmail}?subject=Consulta sobre propiedad: ${encodeURIComponent(strTituloInmueble)}`;

  return (
    <section className="block lg:hidden bg-white/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-sm border border-black/5 mb-8 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D] border-b border-[#2E2E2E]/5 pb-2">
        Contacto
      </h2>

      <div className="flex flex-col items-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={objPropietario.strFotoUrl?.trim() || "https://i.imgur.com/WxNkK7J.png"}
          alt="Usuario Anunciante"
          className="w-28 h-28 rounded-full object-cover shadow-sm border-2 border-[#E7E1D7] mb-4"
          onError={(e) => {
            e.currentTarget.src = "https://i.imgur.com/WxNkK7J.png";
          }}
        />
        <h3 className="text-lg font-bold text-[#1F3A4D] uppercase leading-tight text-center">
          {strNombreCompleto}
        </h3>
        <p className="text-sm text-[#2E2E2E]/60 text-center mt-0.5">
          @{objPropietario.strUsername || "usuario"}
        </p>
      </div>

      <div className="flex flex-col gap-5 px-2 mb-8 border-l-2 border-black/10 ml-2 pl-4">
        <div>
          <span className="block text-base font-bold text-[#1F3A4D] mb-0.5">
            Correo
          </span>
          <span className="block text-base text-[#2E2E2E] break-all">
            {objPropietario.strEmail}
          </span>
        </div>

        {objPropietario.strDireccion && (
          <div>
            <span className="block text-base font-bold text-[#1F3A4D] mb-0.5">
              Direccion
            </span>
            <span className="block text-base text-[#2E2E2E]">
              {objPropietario.strDireccion}
            </span>
          </div>
        )}

        <div>
          <span className="block text-base font-bold text-[#1F3A4D] mb-0.5">
            Telefonos
          </span>
          {objPropietario.arrTelefonos.length > 0 ? (
            <div className="flex flex-col">
              {objPropietario.arrTelefonos.map((tel, index) => (
                <span key={index} className="block text-base text-[#2E2E2E]">
                  {tel}
                </span>
              ))}
            </div>
          ) : (
            <span className="block text-base text-[#2E2E2E]/60 italic">
              No hay telefonos disponibles
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {objPropietario.arrTelefonos.map((strTelefono, index) => {
          const strUrlWhatsapp = `https://wa.me/${strTelefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(strMensajeWs)}`;

          return (
            <a
              key={index}
              href={strUrlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              onClick={() => trackEvent(id_publicacion, "contacto")}
            >
              <Button className="w-full bg-[#1F3A4D] hover:bg-[#1F3A4D]/90 text-white h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all shadow-sm">
                <span className="text-xs font-medium text-white/80 leading-none mt-1">
                  Mensaje por WhatsApp al
                </span>
                <span className="text-base font-bold leading-none mb-1">
                  {strTelefono}
                </span>
              </Button>
            </a>
          );
        })}

        <a
          href={strUrlCorreo}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-1"
          onClick={() => trackEvent(id_publicacion, "contacto")}
        >
          <Button
            variant="outline"
            className="w-full border-2 border-[#1F3A4D] text-[#1F3A4D] bg-transparent hover:bg-[#1F3A4D]/5 font-bold h-14 text-sm sm:text-base rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            Enviar Correo Electronico
          </Button>
        </a>
      </div>
    </section>
  );
};
