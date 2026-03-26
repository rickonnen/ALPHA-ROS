"use client";

import { useState, useRef, useEffect } from "react";
import {
  DESCRIPCION_MAXIMA,
  DESCRIPCION_MINIMA,
  PRECIO_MAXIMO,
  TIPOS_OPERACION_UI,
  TIPOS_PROPIEDAD_VALIDOS,
  TITULO_MAXIMO,
  TITULO_MINIMO,
  toTipoOperacionBackend,
} from "@/app/backend/publicacion/informacion-comercial/publicacion.constants";

interface FormData {
  titulo: string;
  precio: string;
  tipoPropiedad: string;
  tipoOperacion: string;
  descripcion: string;
}


interface FormErrors {
  titulo?: string;
  precio?: string;
  tipoPropiedad?: string;
  tipoOperacion?: string;
  descripcion?: string;
}

const TIPOS_PROPIEDAD = TIPOS_PROPIEDAD_VALIDOS;
const TIPOS_OPERACION = TIPOS_OPERACION_UI;
interface BackendErrorResponse {
  ok?: boolean;
  mensaje?: string;
  errores?: Partial<Record<keyof FormData, string>>;
}

export default function InformacionComercial() {
  const [form, setForm] = useState<FormData>({
    titulo: "",
    precio: "",
    tipoPropiedad: "",
    tipoOperacion: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [openDropdown, setOpenDropdown] = useState<"propiedad" | "operacion" | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propiedadRef = useRef<HTMLDivElement>(null);
  const operacionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (!propiedadRef.current?.contains(t) && !operacionRef.current?.contains(t)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function validateField(name: keyof FormData, value: string): string | undefined {
    switch (name) {
      case "titulo":
        if (!value.trim()) return "El título es obligatorio.";
        if (value.trim().length < TITULO_MINIMO) return `Mínimo ${TITULO_MINIMO} caracteres.`;
        if (value.length > TITULO_MAXIMO) return `Máximo ${TITULO_MAXIMO} caracteres.`;
        return undefined;
      case "precio": {
        if (!value) return "El precio es obligatorio.";
        const num = parseFloat(value);
        if (isNaN(num) || !/^\d+(\.\d{1,2})?$/.test(value))
          return "Ingrese un valor válido (ej: 1000.50).";
        if (num <= 0) return "El precio debe ser mayor a 0.";
        if (num > PRECIO_MAXIMO)
          return `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`;
        return undefined;
      }
      case "tipoPropiedad":
        return value ? undefined : "Seleccione un tipo de propiedad.";
      case "tipoOperacion":
        return value ? undefined : "Seleccione un tipo de operación.";
      case "descripcion":
        if (!value.trim()) return "La descripción es obligatoria.";
        if (value.trim().length < DESCRIPCION_MINIMA) return `Mínimo ${DESCRIPCION_MINIMA} caracteres.`;
        if (value.length > DESCRIPCION_MAXIMA) return `Máximo ${DESCRIPCION_MAXIMA} caracteres.`;
        return undefined;
    }
  }

  function validateAll(): FormErrors {
    const e: FormErrors = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) e[k] = err;
    });
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
    }
  }

  // Solo permite digitos y un punto decimal
  function handlePrecioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    const clean = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
    setForm((prev) => ({ ...prev, precio: clean }));
    if (touched.precio) {
      setErrors((prev) => ({ ...prev, precio: validateField("precio", clean) }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
  }

  function handleSelectPropiedad(opt: string) {
    setForm((prev) => ({ ...prev, tipoPropiedad: opt }));
    setErrors((prev) => ({ ...prev, tipoPropiedad: undefined }));
    setTouched((prev) => ({ ...prev, tipoPropiedad: true }));
    setOpenDropdown(null);
  }

  function handleSelectOperacion(opt: string) {
    setForm((prev) => ({ ...prev, tipoOperacion: opt }));
    setErrors((prev) => ({ ...prev, tipoOperacion: undefined }));
    setTouched((prev) => ({ ...prev, tipoOperacion: true }));
    setOpenDropdown(null);
  }

  function handleCancelar() {
    const hasData = Object.values(form).some((v) => v.trim() !== "");
    if (hasData) {
      if (!window.confirm("Los datos ingresados se eliminarán. ¿Deseas salir del formulario?")) return;
    }
    setForm({ titulo: "", precio: "", tipoPropiedad: "", tipoOperacion: "", descripcion: "" });
    setErrors({});
    setTouched({});
  }

  async function handleSiguiente() {
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    const newErrors = validateAll();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      ...form,
      tipoOperacion: toTipoOperacionBackend(form.tipoOperacion),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/backend/publicacion/informacion-comercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json().catch(() => null)) as BackendErrorResponse | null;

      if (!response.ok) {
        const backendErrors = responseBody?.errores ?? {};
        const mappedErrors: FormErrors = {};
        const fields: (keyof FormData)[] = [
          "titulo",
          "precio",
          "tipoPropiedad",
          "tipoOperacion",
          "descripcion",
        ];

        fields.forEach((field) => {
          const message = backendErrors[field];
          if (typeof message === "string" && message.trim().length > 0) {
            mappedErrors[field] = message;
          }
        });

        setErrors(mappedErrors);
        return;
      }

      setErrors({});
      window.alert("Información comercial guardada correctamente.");
    } catch {
      window.alert("No se pudo enviar la información. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasErr = (n: keyof FormData) => touched[n] && !!errors[n];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body { height: 100%; }

        .ic-root {
          font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column; 
        }

        /* â•â•â•â•â•â•â•â•â•â•â•â• NAVBAR â•â•â•â•â•â•â•â•â•â•â•â• */
        .ic-nav {
          width: 100%;
          height: 44px;
          background: #3D3830;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 10px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .ic-nav-x {
          width: 28px; height: 28px;
          border: 1.5px solid #6B6560;
          border-radius: 4px;
          background: transparent;
          color: #C4BEB8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .ic-nav-x svg { width: 13px; height: 13px; }

        .ic-nav-planes {
          background: #524D48;
          color: #C4BEB8;
          font-size: 0.67rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ic-nav-spacer { flex: 1; }

        .ic-nav-links {
          display: flex; align-items: center; gap: 20px;
          margin-right: 4px;
        }
        .ic-nav-link {
          font-size: 0.64rem; font-weight: 600;
          letter-spacing: 0.09em; color: #C4BEB8;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none;
        }
        .ic-nav-link:hover { color: #fff; }

        .ic-nav-publicar {
          background: #524D48; color: #C4BEB8;
          font-size: 0.64rem; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 4px;
          border: none; cursor: pointer; white-space: nowrap;
          margin-right: 6px; flex-shrink: 0;
        }
        .ic-nav-publicar:hover { background: #6B6560; }

        .ic-nav-right {
          display: flex; align-items: center;
          gap: 9px; flex-shrink: 0;
        }
        .ic-nav-icon { width: 18px; height: 18px; color: #C4BEB8; cursor: pointer; }

        .ic-nav-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: #524D48; border: 1.5px solid #6B6560;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .ic-nav-avatar svg { width: 14px; height: 14px; color: #C4BEB8; }

        .ic-nav-perfil {
          display: flex; align-items: center; gap: 4px;
          color: #C4BEB8; font-size: 0.64rem; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap;
        }
        .ic-nav-perfil svg { width: 13px; height: 13px; }

        /* â•â•â•â•â•â•â•â•â•â•â•â• BODY: 2 zonas mitad y mitad â•â•â•â•â•â•â•â•â•â•â•â•
           La pagina (sin navbar) se divide en 50% beige / 50% gris.
           La card flota encima del corte con position absolute/sticky.
        */
        .ic-body {
          flex: 1;
          position: relative;
          /* Fondo dividido exactamente al 50% */
          background: linear-gradient(
            to bottom,
            #EAE4D8 50%,
            #CFC9BB 50%
          );
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ic-heading-wrap {
          width: 100%;
          max-width: 620px;
          padding: 34px 0 22px;
          /* Se alinea con la card porque ambos tienen el mismo max-width
             y el ic-body usa align-items: center */
        }

        .ic-heading {
          font-size: 2.6rem;
          font-weight: 700;
          color: #1A1714;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        /* â•â•â•â•â•â•â•â•â•â•â•â• CARD â•â•â•â•â•â•â•â•â•â•â•â• */
        .ic-card {
          background: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.11);
          width: 100%;
          max-width: 620px;
          padding: 28px 30px 24px;
          /* La card cruza el corte de los 2 colores */
          position: relative;
          z-index: 1;
          margin-bottom: 48px;
        }

        .ic-card-title {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #1A1714;
          margin-bottom: 20px;
        }

        /* â”€â”€ Fila titulo + precio â”€â”€ */
        .ic-row {
          display: flex; gap: 14px;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .ic-field-titulo { flex: 1; }
        .ic-field-precio { width: 110px; flex-shrink: 0; }

        /* â”€â”€ Field â”€â”€ */
        .ic-field {
          display: flex; flex-direction: column; gap: 5px;
          margin-bottom: 14px;
        }

        .ic-label {
          font-size: 0.82rem; font-weight: 500;
          color: #1A1714; letter-spacing: -0.01em;
        }

        /* â”€â”€ Input â”€â”€ */
        .ic-input {
          width: 100%; height: 40px;
          padding: 0 12px;
          font-family: inherit; font-size: 0.88rem;
          color: #1A1714; background: #fff;
          border: 1px solid #D4CFC6; border-radius: 6px;
          outline: none; transition: border-color 0.15s;
        }
        .ic-input::placeholder { color: #B8B2AC; }
        .ic-input:focus { border-color: #8A8480; }
        .ic-input.err { border-color: #C0503A; }

        .ic-precio-wrap { position: relative; }
        .ic-precio-wrap .ic-input { padding-right: 32px; }
        .ic-precio-sfx {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem; color: #8A8480;
          font-weight: 500; pointer-events: none;
        }

        /* â”€â”€ Textarea â”€â”€ */
        .ic-textarea {
          width: 100%; min-height: 100px;
          padding: 10px 12px;
          font-family: inherit; font-size: 0.88rem;
          color: #1A1714; background: #fff;
          border: 1px solid #D4CFC6; border-radius: 6px;
          outline: none; resize: vertical;
          transition: border-color 0.15s; line-height: 1.5;
        }
        .ic-textarea::placeholder { color: #B8B2AC; }
        .ic-textarea:focus { border-color: #8A8480; }
        .ic-textarea.err { border-color: #C0503A; }

        /* â”€â”€ Dropdown â”€â”€ */
        .ic-dd-wrap { position: relative; }

        .ic-dd-btn {
          width: 100%; height: 40px; padding: 0 12px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: inherit; font-size: 0.88rem;
          color: #1A1714; background: #fff;
          border: 1px solid #D4CFC6; border-radius: 6px;
          cursor: pointer; user-select: none;
          transition: border-color 0.15s;
        }
        .ic-dd-btn.ph { color: #B8B2AC; }
        .ic-dd-btn:focus { outline: none; border-color: #8A8480; }
        .ic-dd-btn.open {
          border-color: #8A8480;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .ic-dd-btn.err { border-color: #C0503A; }

        .ic-chevron {
          width: 14px; height: 14px; color: #8A8480;
          flex-shrink: 0; transition: transform 0.18s;
        }
        .ic-chevron.open { transform: rotate(180deg); }

        .ic-dd-menu {
          position: absolute; top: 100%; left: 0; right: 0;
          background: #fff;
          border: 1px solid #8A8480; border-top: none;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          z-index: 50; overflow: hidden;
          box-shadow: 0 6px 14px rgba(0,0,0,0.11);
        }
        .ic-dd-hdr {
          padding: 7px 12px 4px;
          font-size: 0.74rem; font-weight: 700;
          color: #1A1714; letter-spacing: 0.02em;
        }
        .ic-dd-opt {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px;
          font-size: 0.88rem; color: #1A1714;
          cursor: pointer; transition: background 0.1s;
        }
        .ic-dd-opt:hover { background: #F5F1EC; }
        .ic-dd-opt.sel { font-weight: 500; }
        .ic-chk { width: 13px; height: 13px; color: #C0503A; flex-shrink: 0; }
        .ic-chk-gap { width: 13px; flex-shrink: 0; }

        /* â”€â”€ Error / count â”€â”€ */
        .ic-err { font-size: 0.74rem; color: #C0503A; line-height: 1.4; }
        .ic-cnt { font-size: 0.70rem; color: #8A8480; text-align: right; }
        .ic-cnt.over { color: #C0503A; }

        /* â”€â”€ Buttons â”€â”€ */
        .ic-actions {
          display: flex; justify-content: flex-end; gap: 10px;
          margin-top: 20px;
        }
        .ic-btn {
          height: 38px; padding: 0 24px;
          border-radius: 6px; font-family: inherit;
          font-size: 0.88rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          letter-spacing: -0.01em;
        }
        .ic-btn-cancel {
          background: transparent;
          border: 1.5px solid #C0503A; color: #C0503A;
        }
        .ic-btn-cancel:hover { background: rgba(192,80,58,0.07); }
        .ic-btn-next {
          background: #C0503A; border: 1.5px solid #C0503A; color: #fff;
        }
        .ic-btn-next:hover { background: #A8432F; border-color: #A8432F; }
        .ic-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* â”€â”€ Responsive â”€â”€ */
        @media (max-width: 680px) {
          .ic-heading-wrap { padding: 22px 0 16px; }
          .ic-card { border-radius: 8px 8px 0 0; max-width: 100%; margin: 0; padding: 22px 18px 20px; }
          .ic-heading { font-size: 1.8rem; }
          .ic-field-precio { width: 90px; }
          .ic-nav-links { display: none; }
          .ic-body { padding: 0 20px; }
        }
      `}</style>

      <div className="ic-root">

        {/* NAVBAR */}
        <nav className="ic-nav">
          <button className="ic-nav-x" aria-label="Cerrar">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12"/>
              <line x1="12" y1="2" x2="2" y2="12"/>
            </svg>
          </button>

          <span className="ic-nav-planes">Planes de Publicación</span>
          <div className="ic-nav-spacer" />

          <div className="ic-nav-links">
            <span className="ic-nav-link">Compra</span>
            <span className="ic-nav-link">Alquiler</span>
            <span className="ic-nav-link">Anticrético</span>
          </div>

          <button className="ic-nav-publicar">Publicar</button>

          <div className="ic-nav-right">
            <svg className="ic-nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2a6 6 0 0 0-6 6c0 3.5-2 4.5-2 5h16s-2-1.5-2-5a6 6 0 0 0-6-6z"/>
              <path d="M11.73 17a2 2 0 0 1-3.46 0"/>
            </svg>
            <div className="ic-nav-avatar">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3.5"/>
                <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
              </svg>
            </div>
            <div className="ic-nav-perfil">
              <span>MI PERFIL</span>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="7" x2="12" y2="7"/>
                <polyline points="8 3 12 7 8 11"/>
              </svg>
            </div>
          </div>
        </nav>

        {/* BODY con fondo 50% beige / 50% gris */}
        <div className="ic-body">

          {/* Titulo en zona beige */}
          <div className="ic-heading-wrap">
            <h1 className="ic-heading">Crear publicación</h1>
          </div>

          {/* Card cruza el corte de colores */}
          <div className="ic-card">
            <p className="ic-card-title">Información Comercial</p>

            {/* Titulo + Precio */}
            <div className="ic-row">
              <div className="ic-field ic-field-titulo" style={{ marginBottom: 0 }}>
                <label className="ic-label" htmlFor="titulo">Título del Aviso</label>
                <input
                  id="titulo" name="titulo" type="text"
                  className={`ic-input${hasErr("titulo") ? " err" : ""}`}
                  placeholder="Escribe un título"
                  value={form.titulo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={TITULO_MAXIMO}
                  autoComplete="off"
                />
                {hasErr("titulo")
                  ? <span className="ic-err">{errors.titulo}</span>
                  : form.titulo.length > 0
                    ? <span className="ic-cnt">{form.titulo.length}/{TITULO_MAXIMO}</span>
                    : null}
              </div>

              <div className="ic-field ic-field-precio" style={{ marginBottom: 0 }}>
                <label className="ic-label" htmlFor="precio">Precio</label>
                <div className="ic-precio-wrap">
                  <input
                    id="precio" name="precio"
                    type="text" inputMode="decimal"
                    className={`ic-input${hasErr("precio") ? " err" : ""}`}
                    placeholder="0.00"
                    value={form.precio}
                    onChange={handlePrecioChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                  <span className="ic-precio-sfx">Bs.</span>
                </div>
                {hasErr("precio") && <span className="ic-err">{errors.precio}</span>}
              </div>
            </div>

            {/* Tipo de Propiedad */}
            <div className="ic-field">
              <label className="ic-label">Tipo de Propiedad</label>
              <div className="ic-dd-wrap" ref={propiedadRef}>
                <button type="button"
                  className={`ic-dd-btn${!form.tipoPropiedad ? " ph" : ""}${openDropdown === "propiedad" ? " open" : ""}${hasErr("tipoPropiedad") ? " err" : ""}`}
                  onClick={() => setOpenDropdown((p) => p === "propiedad" ? null : "propiedad")}
                  aria-haspopup="listbox"
                  aria-expanded={openDropdown === "propiedad"}
                >
                  <span>{form.tipoPropiedad || "Seleccione una opción"}</span>
                  <svg className={`ic-chevron${openDropdown === "propiedad" ? " open" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 6 8 10 12 6"/>
                  </svg>
                </button>
                {openDropdown === "propiedad" && (
                  <div className="ic-dd-menu" role="listbox">
                    <div className="ic-dd-hdr">Opciones</div>
                    {TIPOS_PROPIEDAD.map((opt) => (
                      <div key={opt}
                        className={`ic-dd-opt${form.tipoPropiedad === opt ? " sel" : ""}`}
                        role="option" aria-selected={form.tipoPropiedad === opt}
                        onClick={() => handleSelectPropiedad(opt)}
                      >
                        {form.tipoPropiedad === opt
                          ? <svg className="ic-chk" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 7 5.5 10.5 12 4"/></svg>
                          : <span className="ic-chk-gap"/>}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {hasErr("tipoPropiedad") && <span className="ic-err">{errors.tipoPropiedad}</span>}
            </div>

            {/* Tipo de Operacion */}
            <div className="ic-field">
              <label className="ic-label">Tipo de Operación</label>
              <div className="ic-dd-wrap" ref={operacionRef}>
                <button type="button"
                  className={`ic-dd-btn${!form.tipoOperacion ? " ph" : ""}${openDropdown === "operacion" ? " open" : ""}${hasErr("tipoOperacion") ? " err" : ""}`}
                  onClick={() => setOpenDropdown((p) => p === "operacion" ? null : "operacion")}
                  aria-haspopup="listbox"
                  aria-expanded={openDropdown === "operacion"}
                >
                  <span>{form.tipoOperacion || "Seleccione una opción"}</span>
                  <svg className={`ic-chevron${openDropdown === "operacion" ? " open" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 6 8 10 12 6"/>
                  </svg>
                </button>
                {openDropdown === "operacion" && (
                  <div className="ic-dd-menu" role="listbox">
                    <div className="ic-dd-hdr">Opciones</div>
                    {TIPOS_OPERACION.map((opt) => (
                      <div key={opt}
                        className={`ic-dd-opt${form.tipoOperacion === opt ? " sel" : ""}`}
                        role="option" aria-selected={form.tipoOperacion === opt}
                        onClick={() => handleSelectOperacion(opt)}
                      >
                        {form.tipoOperacion === opt
                          ? <svg className="ic-chk" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 7 5.5 10.5 12 4"/></svg>
                          : <span className="ic-chk-gap"/>}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {hasErr("tipoOperacion") && <span className="ic-err">{errors.tipoOperacion}</span>}
            </div>

            {/* Descripcion */}
            <div className="ic-field">
              <label className="ic-label" htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion" name="descripcion"
                className={`ic-textarea${hasErr("descripcion") ? " err" : ""}`}
                placeholder="Escribe una descripción"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={DESCRIPCION_MAXIMA}
              />
              {hasErr("descripcion")
                ? <span className="ic-err">{errors.descripcion}</span>
                : <span className={`ic-cnt${form.descripcion.length > DESCRIPCION_MAXIMA ? " over" : ""}`}>
                    {form.descripcion.length}/{DESCRIPCION_MAXIMA}
                  </span>}
            </div>

            {/* Acciones */}
            <div className="ic-actions">
              <button type="button" className="ic-btn ic-btn-cancel" onClick={handleCancelar}>
                Cancelar
              </button>
              <button
                type="button"
                className="ic-btn ic-btn-next"
                onClick={handleSiguiente}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Siguiente"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
