"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="bg-[#F4EFE6] border border-[#E5E0D8] p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm uppercase text-[#2E2E2E]">{getHeaderText()}</h2>
          {pago.estado === "pendiente" && <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">VERIFICANDO PAGO</span>}
          {pago.estado === "rechazado" && <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">PAGO RECHAZADO</span>}
          {pago.estado === "realizado" && <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">PAGO EXITOSO</span>}
        </div>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Fecha y hora:</span>
            <span className="text-[#2E2E2E]">{pago.fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Detalle:</span>
            <span className="text-[#2E2E2E]">{pago.detalle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">{pago.estado === "realizado" ? "Total pagado:" : "Monto:"}</span>
            <span className="text-[#2E2E2E]">
              ${Number(pago.monto).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-gray-400">(≈ Bs {(pago.monto * 6.96).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </span>
          </div>
        </div>
        {pago.estado === "rechazado" && (
          <div className="flex justify-end">
            <Button onClick={() => setOpenModal(true)} className="bg-[#1F3A4D] hover:bg-[#162c3a] text-white text-xs">CONTACTAR CON SOPORTE</Button>
          </div>
        )}
      </div>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm min-h-[100dvh] w-screen">
          <div ref={modalRef} className="bg-[#F4EFE6] border border-[#E5E0D8] w-full max-w-md p-6 rounded-md space-y-5 text-center relative shadow-xl">
            <button onClick={() => setOpenModal(false)} className="absolute top-2 right-3 text-gray-400 hover:text-[#2E2E2E] text-2xl font-light transition-colors">&times;</button>
            <h2 className="text-lg font-bold text-[#1F3A4D]">¿Problema con tu pago?</h2>
            <p className="text-sm text-[#6B7280]">Si crees que hubo un error, contáctanos por medio de nuestras redes sociales y te ayudaremos lo antes posible.</p>
            <div className="flex justify-center gap-3 pt-2 flex-wrap">
              <a href="https://www.facebook.com/share/1Fgy1caBsd/" target="_blank" rel="noopener noreferrer" className="bg-[#1F3A4D] text-white hover:bg-[#162c3a] px-4 py-2 text-xs font-medium rounded-sm transition-colors">Facebook</a>
              <a href="https://www.instagram.com/propbol.inmo/" target="_blank" rel="noopener noreferrer" className="bg-[#1F3A4D] text-white hover:bg-[#162c3a] px-4 py-2 text-xs font-medium rounded-sm transition-colors">Instagram</a>
              <a href="https://www.tiktok.com/@propbolinmo" target="_blank" rel="noopener noreferrer" className="bg-[#1F3A4D] text-white hover:bg-[#162c3a] px-4 py-2 text-xs font-medium rounded-sm transition-colors">TikTok</a>
              <button onClick={handleCopiarCorreo} className="bg-[#C26E5A] text-white hover:bg-[#a65d4c] px-4 py-2 text-xs font-medium rounded-sm transition-colors">{copiado ? "¡Copiado!" : "Correo"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}