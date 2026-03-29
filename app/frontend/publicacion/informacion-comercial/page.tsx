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

      {/* ── Barra de navegación superior ── */}
      <nav className="w-full h-11 bg-[#3D3830] flex items-center px-4 gap-2.5 flex-shrink-0 sticky top-0 z-[100]">
        <button
          className="w-7 h-7 border border-[#6B6560] rounded bg-transparent text-[#C4BEB8] flex items-center justify-center cursor-pointer flex-shrink-0"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-3 h-3">
            <line x1="2" y1="2" x2="12" y2="12"/>
            <line x1="12" y1="2" x2="2" y2="12"/>
          </svg>
        </button>

        {/* Oculto en mobile */}
        <span className="hidden sm:inline bg-[#524D48] text-[#C4BEB8] text-[0.67rem] font-medium px-2.5 py-1 rounded whitespace-nowrap flex-shrink-0">
          Planes de Publicación
        </span>

        <div className="flex-1" />

        {/* Links de navegación ocultos en mobile */}
        <div className="hidden md:flex items-center gap-5 mr-1">
          {["Compra", "Alquiler", "Anticrético"].map((strLink) => (
            <span key={strLink} className="text-[0.64rem] font-semibold tracking-widest text-[#C4BEB8] uppercase cursor-pointer hover:text-white">
              {strLink}
            </span>
          ))}
        </div>

        {/* Botón publicar oculto en mobile */}
        <button className="hidden md:block bg-[#524D48] text-[#C4BEB8] text-[0.64rem] font-semibold tracking-widest uppercase px-3 py-1 rounded border-none cursor-pointer mr-1.5 whitespace-nowrap hover:bg-[#6B6560]">
          Publicar
        </button>

        {/* Iconos de notificación, avatar y perfil */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-[18px] h-[18px] text-[#C4BEB8] cursor-pointer" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a6 6 0 0 0-6 6c0 3.5-2 4.5-2 5h16s-2-1.5-2-5a6 6 0 0 0-6-6z"/>
            <path d="M11.73 17a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="w-6 h-6 rounded-full bg-[#524D48] border border-[#6B6560] flex items-center justify-center cursor-pointer flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#C4BEB8]">
              <circle cx="10" cy="7" r="3.5"/>
              <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
            </svg>
          </div>
          <div className="flex items-center gap-1 text-[#C4BEB8] text-[0.64rem] font-semibold tracking-wider uppercase cursor-pointer whitespace-nowrap">
            <span className="hidden sm:inline">MI PERFIL</span>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="2" y1="7" x2="12" y2="7"/>
              <polyline points="8 3 12 7 8 11"/>
            </svg>
          </div>
        </div>
      </nav>

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