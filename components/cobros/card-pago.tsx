"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useDollarRate } from "@/components/hooks/getDollarRate";

export interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado" | "rechazado";
}

export default function CardPago({ pago }: { pago: Pago }) {
  const [openModal, setOpenModal] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { venta } = useDollarRate();
  const tipoDeCambio = venta !== null ? venta : 6.96;

  const getHeaderText = () => {
    switch (pago.estado) {
      case "realizado": return "TRANSACCIÓN REALIZADA";
      case "rechazado": return "TRANSACCIÓN RECHAZADA";
      default: return "TRANSACCIÓN PENDIENTE";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpenModal(false);
      }
    };
    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  const handleCopiarCorreo = () => {
    navigator.clipboard.writeText("propBol.support.payments@gmail.com");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <>
      <div className="bg-[#f9f5f1] border border-[#d6cfc3] p-5 space-y-3 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm uppercase text-[#2e2e2e] leading-snug tracking-tight">
            {getHeaderText()}
          </h2>
          {pago.estado === "pendiente" && <span className="bg-[#7a756d]/20 text-[#7a756d] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">VERIFICANDO PAGO</span>}
          {pago.estado === "rechazado" && <span className="bg-[#7a756d]/20 text-[#7a756d] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">PAGO RECHAZADO</span>}
          {pago.estado === "realizado" && <span className="bg-[#7a756d]/20 text-[#7a756d] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">PAGO EXITOSO</span>}
        </div>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-[#7a756d]">Fecha y hora:</span>
            <span className="text-[#2e2e2e]">{pago.fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7a756d]">Detalle:</span>
            <span className="text-[#2e2e2e]">{pago.detalle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7a756d]">{pago.estado === "realizado" ? "Total pagado:" : "Monto:"}</span>
            <span className="text-[#2e2e2e] font-bold">
              ${Number(pago.monto).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
              <span className="text-sm font-medium text-[#c26e5a] ml-1">(≈ Bs {(pago.monto * tipoDeCambio).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </span>
          </div>
        </div>
        {pago.estado === "rechazado" && (
          <div className="flex justify-end">
            <Button onClick={() => setOpenModal(true)} className="bg-[#1f3a4d] hover:opacity-90 text-[#f4efe6] text-xs rounded-md shadow-sm transition-all border-none">CONTACTAR CON SOPORTE</Button>
          </div>
        )}
      </div>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm min-h-dvh w-screen">
          <div ref={modalRef} className="bg-[#f9f5f1] border border-[#d6cfc3] w-full max-w-md p-6 rounded-md space-y-5 text-center relative shadow-xl">
            <button onClick={() => setOpenModal(false)} className="absolute top-2 right-3 text-[#7a756d] hover:text-[#2e2e2e] text-2xl font-light transition-colors">&times;</button>
            <h2 className="text-lg font-bold text-[#1f3a4d]">¿Problema con tu pago?</h2>
            <p className="text-sm text-[#7a756d]">Si crees que hubo un error, contáctanos por medio de nuestras redes sociales y te ayudaremos lo antes posible.</p>
            <div className="flex justify-center gap-3 pt-2 flex-wrap">
              <a href="https://www.facebook.com/share/1Fgy1caBsd/" target="_blank" rel="noopener noreferrer" className="bg-[#1f3a4d] text-[#f4efe6] hover:opacity-90 px-4 py-2 text-xs font-medium rounded-sm transition-colors">Facebook</a>
              <a href="https://www.instagram.com/propbol.inmo/" target="_blank" rel="noopener noreferrer" className="bg-[#1f3a4d] text-[#f4efe6] hover:opacity-90 px-4 py-2 text-xs font-medium rounded-sm transition-colors">Instagram</a>
              <a href="https://www.tiktok.com/@propbolinmo" target="_blank" rel="noopener noreferrer" className="bg-[#1f3a4d] text-[#f4efe6] hover:opacity-90 px-4 py-2 text-xs font-medium rounded-sm transition-colors">TikTok</a>
              <button onClick={handleCopiarCorreo} className="bg-[#c26e5a] text-[#f4efe6] hover:opacity-90 px-4 py-2 text-xs font-medium rounded-sm transition-colors">{copiado ? "¡Copiado!" : "Correo"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}