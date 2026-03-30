"use client";

/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Página principal del formulario de Información Comercial para
 * la publicación de inmuebles. Renderiza el navbar, el formulario con sus campos
 * y los botones de acción Cancelar y Siguiente.
 * @return {JSX.Element} Página completa del formulario de Información Comercial
 */

import { useInformacionComercialForm } from "./Hooks/useInformacionComercialForm";
import DropdownSelect from "./Components/Dropdown.Select";
import PrecioInput from "./Components/PrecioInput";
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
    <div className="min-h-screen flex flex-col bg-[#EAE4D8] font-[family-name:var(--font-geist-sans)]">

      

      {/* ── Área principal con fondo degradado de 2 colores ── */}
      <div
        className="flex-1 flex flex-col items-center px-6"
        style={{ background: "linear-gradient(to bottom, #EAE4D8 35%, #CFC9BB 35%)" }}
      >
        {/* Título de la página */}
        <div className="w-full max-w-[55%] px-12 pt-8 pb-6 max-sm:max-w-full max-sm:px-0 max-sm:pt-5 max-sm:pb-4">
          <h1 className="text-[2.6rem] font-bold text-[#1A1714] tracking-tight leading-tight max-sm:text-[1.45rem]">
            Crear publicación
          </h1>
        </div>

        {/* Card principal del formulario */}
        <div className="bg-white rounded-lg shadow-md w-full max-w-[620px] px-8 py-7 relative z-[1] mt-12 mb-12 max-sm:max-w-full max-sm:px-3.5 max-sm:py-4 max-sm:mt-4 max-sm:mb-5">
          <p className="text-center text-[0.85rem] font-bold tracking-[0.13em] uppercase text-[#1A1714] mb-5">
            Información Comercial
          </p>

          {/* ── Fila: Título del Aviso + Precio ── */}
          {/* En mobile se apilan vertical, en desktop van lado a lado */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3.5 w-full mb-1">

            {/* Campo Título del Aviso */}
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
                  // Mensaje de error inline
                  <span className="text-[0.74rem] text-[#C0503A] leading-snug">{errors.titulo}</span>
                ) : bolMounted && form.titulo.length > 0 ? (
                  // Contador de caracteres — solo visible tras el montaje en cliente
                  <span className="ml-auto text-[0.70rem] text-[#8A8480]">{form.titulo.length}/{TITULO_MAX}</span>
                ) : null}
              </div>
            </div>

            {/* Campo Precio — ancho fijo en desktop, completo en mobile */}
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

          {/* Campo Tipo de Propiedad */}
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

          {/* Campo Tipo de Operación */}
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

          {/* Campo Descripción */}
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
                </span>}
          </div>

          {/* ── Botones de acción ── */}
          <div className="flex justify-end gap-2.5 mt-5 max-sm:flex-row max-sm:gap-2">
            {/* Botón Cancelar — limpia el formulario con confirmación */}
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isSubmitting}
              className="h-[38px] px-6 rounded-md text-[0.88rem] font-medium cursor-pointer bg-transparent border-[1.5px] border-[#C0503A] text-[#C0503A] hover:bg-[rgba(192,80,58,0.07)] transition-colors max-sm:flex-1"
            >
              Cancelar
            </button>
            {/* Botón Siguiente — valida y guarda en sessionStorage */}
            <button
              type="button"
              onClick={handleSiguiente}
              disabled={isSubmitting}
              className="h-[38px] px-6 rounded-md text-[0.88rem] font-medium cursor-pointer bg-[#C0503A] border-[1.5px] border-[#C0503A] text-white hover:bg-[#A8432F] hover:border-[#A8432F] transition-colors max-sm:flex-1"
            >
              {isSubmitting ? "Guardando..." : "Siguiente"}
            </button>
          </div>

          {/* Mensaje de estado del submit (éxito o error general) */}
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