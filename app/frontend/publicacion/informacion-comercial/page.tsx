"use client";

import { useInformacionComercialForm } from "./Hooks/useInformacionComercialForm";
import DropdownSelect    from "./Components/Dropdown.Select";
import PrecioInput       from "./Components/PrecioInput";
import {
  TIPOS_PROPIEDAD,
  TIPOS_OPERACION,
  TITULO_MAX,
  DESC_MAX,
} from "./InformacionComercial.types";

export default function Page() {
  const {
    form,
    errors,
    hasErr,
    bolMounted,
    handleChange,
    handlePrecioChange,
    handleBlur,
    handleSelectPropiedad,
    handleSelectOperacion,
    handleDropdownBlur,
    handleCancelar,
    handleSiguiente,
    isSubmitting,
    submitStatus,
    submitMessage,
  } = useInformacionComercialForm();

  return (
    <div
      className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]"
      style={{ background: "linear-gradient(to bottom, #F4EFE6 35%, #E7E1D7 35%)" }}
    >
      <div className="flex-1 flex flex-col px-4 py-6 sm:px-6 sm:py-8">

        <div className="w-full max-w-2xl">
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-[#1F3A4D] pl-0 sm:pl-6 lg:pl-40">
            Crear publicación
          </h1>
        </div>

        {/* Card principal del formulario */}
        <div className="w-full max-w-2xl mx-auto bg-white rounded-xl px-4 py-6 sm:p-8 mt-4 mb-8 shadow-md">
          <p className="text-center font-semibold text-base sm:text-lg tracking-wide mb-4 sm:mb-6 uppercase text-black">
            Información Comercial
          </p>

          {/* ── Fila: Título del Aviso + Precio ── */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3.5 w-full mb-1">

            <div className="flex flex-col gap-1.5 w-full min-w-0 flex-1">
              <label className="text-[0.82rem] font-medium text-[#1A1714]" htmlFor="titulo">
                Título del Aviso
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                className={`w-full h-10 px-3 text-[0.88rem] text-[#1A1714] bg-white border rounded-[6px] outline-none transition-colors placeholder:text-[#B8B2AC] ${
                  hasErr("titulo")
                    ? "border-[#C0503A]"
                    : "border-[#D4CFC6] focus:border-[#8A8480]"
                }`}
                placeholder="Escribe un título"
                value={form.titulo}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={TITULO_MAX}
                autoComplete="off"
              />
              <div className="flex justify-between items-start">
                {hasErr("titulo") ? (
                  <span className="text-[0.74rem] text-[#C0503A] leading-snug">{errors.titulo}</span>
                ) : bolMounted && form.titulo.length > 0 ? (
                  <span className="ml-auto text-[0.70rem] text-[#8A8480]">{form.titulo.length}/{TITULO_MAX}</span>
                ) : null}
              </div>
            </div>

            <div className="w-full sm:w-[130px] sm:flex-shrink-0">
              <PrecioInput
                value={form.precio}
                hasError={!!hasErr("precio")}
                errorMsg={errors.precio}
                onChange={handlePrecioChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          <DropdownSelect
            id="tipoPropiedad"
            label="Tipo de Propiedad"
            options={TIPOS_PROPIEDAD}
            value={form.tipoPropiedad}
            hasError={!!hasErr("tipoPropiedad")}
            errorMsg={errors.tipoPropiedad}
            onSelect={(strOpt) => handleSelectPropiedad(strOpt)}
            onClose={() => handleDropdownBlur("tipoPropiedad")}
          />

          <DropdownSelect
            id="tipoOperacion"
            label="Tipo de Operación"
            options={TIPOS_OPERACION}
            value={form.tipoOperacion}
            hasError={!!hasErr("tipoOperacion")}
            errorMsg={errors.tipoOperacion}
            onSelect={(strOpt) => handleSelectOperacion(strOpt)}
            onClose={() => handleDropdownBlur("tipoOperacion")}
          />

          <div className="flex flex-col gap-1.5 mb-3.5">
            <label className="text-[0.82rem] font-medium text-[#1A1714]" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className={`w-full min-h-[100px] px-3 py-2.5 text-[0.88rem] text-[#1A1714] bg-white rounded-md outline-none resize-y transition-colors leading-relaxed placeholder:text-[#B8B2AC] max-sm:min-h-[85px] max-sm:text-[0.84rem] ${
                hasErr("descripcion")
                  ? "border border-[#C0503A]"
                  : "border border-[#D4CFC6] focus:border-[#8A8480]"
              }`}
              placeholder="Escribe una descripción"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={DESC_MAX}
            />
            {hasErr("descripcion")
              ? <span className="text-[0.74rem] text-[#C0503A] leading-snug">{errors.descripcion}</span>
              : <span className={`text-[0.70rem] text-right ${bolMounted && form.descripcion.length > DESC_MAX ? "text-[#C0503A]" : "text-[#8A8480]"}`}>
                  {bolMounted ? form.descripcion.length : 0}/{DESC_MAX}
                </span>
            }
          </div>

          {/* ── Botones de acción ── */}
          <div className="flex justify-end gap-2.5 mt-5 max-sm:flex-row max-sm:gap-2">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isSubmitting}
              className="h-[38px] px-6 rounded-md text-[0.88rem] font-medium cursor-pointer bg-transparent border-[1.5px] border-[#C0503A] text-[#C0503A] hover:bg-[rgba(192,80,58,0.07)] transition-colors max-sm:flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSiguiente()}
              disabled={isSubmitting}
              className="h-[38px] px-6 rounded-md text-[0.88rem] font-medium cursor-pointer bg-[#C0503A] border-[1.5px] border-[#C0503A] text-white hover:bg-[#A8432F] hover:border-[#A8432F] transition-colors max-sm:flex-1"
            >
              {isSubmitting ? "Guardando..." : "Siguiente"}
            </button>
          </div>

          {(submitMessage || errors.general) && (
            <span
              className={`text-[0.74rem] leading-snug mt-2 block ${submitStatus === "success" ? "text-[#8A8480]" : "text-[#C0503A]"}`}
              role="status"
            >
              {submitMessage || errors.general}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}