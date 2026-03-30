"use client";

import styles from "./InformacionComercial.module.css";
import { useInformacionComercialForm } from "./Hooks/useInformacionComercialForm";
import DropdownSelect from "./Components/Dropdown.Select";
import PrecioInput from "./Components/PrecioInput";
import {
  TIPOS_PROPIEDAD,
  TIPOS_OPERACION,
  TITULO_MAX,
  DESC_MAX,
} from "./InformacionComercial.types";

export default function InformacionComercial() {
  const {
    form,
    errors,
    hasErr,
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
    <div className={styles.icRoot}>

      {/* NAVBAR */}
      <nav className={styles.icNav}>
        <button className={styles.icNavX} aria-label="Cerrar">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="2" y1="2" x2="12" y2="12"/>
            <line x1="12" y1="2" x2="2" y2="12"/>
          </svg>
        </button>

        <span className={styles.icNavPlanes}>Planes de Publicación</span>
        <div className={styles.icNavSpacer} />

        <div className={styles.icNavLinks}>
          {["Compra", "Alquiler", "Anticrético"].map((l) => (
            <span key={l} className={styles.icNavLink}>{l}</span>
          ))}
        </div>

        <button className={styles.icNavPublicar}>Publicar</button>

        <div className={styles.icNavRight}>
          <svg className={styles.icNavIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a6 6 0 0 0-6 6c0 3.5-2 4.5-2 5h16s-2-1.5-2-5a6 6 0 0 0-6-6z"/>
            <path d="M11.73 17a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className={styles.icNavAvatar}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="7" r="3.5"/>
              <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
            </svg>
          </div>
          <div className={styles.icNavPerfil}>
            <span>MI PERFIL</span>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="7" x2="12" y2="7"/>
              <polyline points="8 3 12 7 8 11"/>
            </svg>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className={styles.icBody}>

        <div className={styles.icHeadingWrap}>
          <h1 className={styles.icHeading}>Crear publicación</h1>
        </div>

        <div className={styles.icCard}>
          <p className={styles.icCardTitle}>Información Comercial</p>

          {/* Título + Precio */}
          <div className={styles.icRow}>
            <div className={`${styles.icField} ${styles.icFieldTitulo}`} style={{ marginBottom: 0 }}>
              <label className={styles.icLabel} htmlFor="titulo">Título del Aviso</label>
              <input
                id="titulo" name="titulo" type="text"
                className={`${styles.icInput}${hasErr("titulo") ? ` ${styles.icInputErr}` : ""}`}
                placeholder="Escribe un título"
                value={form.titulo}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={TITULO_MAX}
                autoComplete="off"
              />
              {hasErr("titulo")
                ? <span className={styles.icErr}>{errors.titulo}</span>
                : form.titulo.length > 0
                  ? <span className={styles.icCnt}>{form.titulo.length}/{TITULO_MAX}</span>
                  : null}
            </div>

            <PrecioInput
              value={form.precio}
              hasError={!!hasErr("precio")}
              errorMsg={errors.precio}
              onChange={handlePrecioChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Tipo de Propiedad */}
          <DropdownSelect
            id="tipoPropiedad"
            label="Tipo de Propiedad"
            options={TIPOS_PROPIEDAD}
            value={form.tipoPropiedad}
            hasError={!!hasErr("tipoPropiedad")}
            errorMsg={errors.tipoPropiedad}
            onSelect={(opt) => handleSelectPropiedad(opt)}
            onClose={() => handleDropdownBlur("tipoPropiedad")}
            />

          {/* Tipo de Operación */}
          <DropdownSelect
            id="tipoOperacion"
            label="Tipo de Operación"
            options={TIPOS_OPERACION}
            value={form.tipoOperacion}
            hasError={!!hasErr("tipoOperacion")}
            errorMsg={errors.tipoOperacion}
            onSelect={(opt) => handleSelectOperacion(opt)}
            onClose={() => handleDropdownBlur("tipoOperacion")}
          />

          {/* Descripción */}
          <div className={styles.icField}>
            <label className={styles.icLabel} htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion" name="descripcion"
              className={`${styles.icTextarea}${hasErr("descripcion") ? ` ${styles.icTextareaErr}` : ""}`}
              placeholder="Escribe una descripción"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={DESC_MAX}
            />
            {hasErr("descripcion")
              ? <span className={styles.icErr}>{errors.descripcion}</span>
              : <span className={`${styles.icCnt}${form.descripcion.length > DESC_MAX ? ` ${styles.icCntOver}` : ""}`}>
                  {form.descripcion.length}/{DESC_MAX}
                </span>}
          </div>

          {/* Acciones */}
          <div className={styles.icActions}>
            <button
              type="button"
              className={`${styles.icBtn} ${styles.icBtnCancel}`}
              onClick={handleCancelar}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${styles.icBtn} ${styles.icBtnNext}`}
              onClick={handleSiguiente}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Siguiente"}
            </button>
          </div>
          {(submitMessage || errors.general) && (
            <span
              className={submitStatus === "success" ? styles.icCnt : styles.icErr}
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
