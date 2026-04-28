/* Dev: [Tu nombre] - HU-04
   Fecha: [fecha]
   Funcionalidad: Modal de confirmación para desactivar cuenta
   Paleta: #F4EFE6 fondo principal | #1F3A4D azul petróleo (botón primario)
           #C26E5A terracota (destructivo) | #2E2E2E texto principal | #E7E1D7 fondo secundario
   CAs: CA-1, CA-7, CA-10, CA-13, CA-15, CA-16, CA-19, CA-20, CA-21, CA-22
*/
"use client";
import { useState, useEffect, useRef } from "react";

interface ModalDesactivarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function ModalDesactivar({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ModalDesactivarProps) {
  // CA-1 / CA-19 / CA-20
  const [checkboxMarcado, setCheckboxMarcado] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Resetear checkbox cada vez que el modal se abre (CA-1)
  useEffect(() => {
    if (isOpen) setCheckboxMarcado(false);
  }, [isOpen]);

  // CA-10: cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isLoading, onClose]);

  // CA-10: cerrar al hacer clic en el fondo oscuro
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoading && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    // Overlay — CA-10: clic fuera cierra
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-desactivar-titulo"
    >
      {/* Contenedor del modal — fondo #F4EFE6 (Beige arena suave) */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200"
        style={{ backgroundColor: "#F4EFE6" }}
      >
        {/* CA-10: botón X — color texto principal #2E2E2E */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-xl leading-none transition-colors disabled:opacity-40"
          style={{ color: "#2E2E2E" }}
        >
          ✕
        </button>

        {/* Ícono de advertencia — terracota #C26E5A */}
        <div className="flex justify-center mb-4">
          <div
            className="rounded-full p-3"
            style={{ backgroundColor: "#C26E5A22" }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: "#C26E5A" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
        </div>

        {/* CA-22: título — texto principal #2E2E2E */}
        <h2
          id="modal-desactivar-titulo"
          className="text-xl font-extrabold text-center mb-2 tracking-tight"
          style={{ color: "#2E2E2E" }}
        >
          Confirmar desactivación de cuenta
        </h2>

        {/* CA-15: descripción en español */}
        <p
          className="text-sm text-center mb-4"
          style={{ color: "#2E2E2E99" }}
        >
          Esta acción suspenderá tu cuenta temporalmente. Tu información no
          será eliminada, pero permanecerá oculta hasta que se reactive.
        </p>

        {/* CA-13: lista de consecuencias — fondo secundario #E7E1D7 */}
        <ul
          className="rounded-xl px-4 py-3 mb-5 space-y-2 text-sm"
          style={{ backgroundColor: "#E7E1D7", color: "#2E2E2E" }}
        >
          <li className="flex gap-2">
            <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#C26E5A" }}>•</span>
            Tu perfil dejará de ser visible para otros usuarios.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#C26E5A" }}>•</span>
            Tu sesión se cerrará automáticamente y serás redirigido a la
            página de ofertas.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#C26E5A" }}>•</span>
            Para volver a acceder, deberás contactar a soporte técnico.
          </li>
        </ul>

        {/* CA-1 / CA-19 / CA-20: checkbox obligatorio — borde terracota */}
        <label
          className="flex items-start gap-3 cursor-pointer rounded-xl p-3 mb-5 select-none border"
          style={{
            backgroundColor: "#C26E5A15",
            borderColor: "#C26E5A55",
          }}
        >
          <input
            type="checkbox"
            checked={checkboxMarcado}
            onChange={(e) => setCheckboxMarcado(e.target.checked)}
            disabled={isLoading}
            className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer rounded"
            style={{ accentColor: "#C26E5A" }}
          />
          <span className="text-sm font-medium" style={{ color: "#2E2E2E" }}>
            Entiendo que{" "}
            <strong style={{ color: "#C26E5A" }}>no podré iniciar sesión</strong>{" "}
            hasta que mi cuenta sea reactivada por soporte técnico.
          </span>
        </label>

        {/* Botones */}
        <div className="flex gap-3">
          {/* CA-7: Cancelar — estilo outline igual que el resto del proyecto */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-lg border font-bold text-sm transition-colors disabled:opacity-40"
            style={{
              borderColor: "#1F3A4D55",
              backgroundColor: "transparent",
              color: "#1F3A4D",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1F3A4D15";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            Cancelar
          </button>

          {/* CA-16 / CA-19 / CA-20 / CA-21: Sí, Desactivar — terracota #C26E5A (destructivo) */}
          <button
            onClick={onConfirm}
            disabled={!checkboxMarcado || isLoading}
            className="flex-1 h-10 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#C26E5A" }}
            onMouseEnter={(e) => {
              if (!(!checkboxMarcado || isLoading))
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#a85a49";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C26E5A";
            }}
          >
            {isLoading ? (
              <>
                {/* CA-16: spinner */}
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Procesando...
              </>
            ) : (
              "Sí, Desactivar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
