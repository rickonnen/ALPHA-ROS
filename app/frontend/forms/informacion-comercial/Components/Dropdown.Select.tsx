"use client";

import { useRef, useEffect } from "react";
import styles from "../InformacionComercial.module.css";

interface DropdownSelectProps {
  id:        string;
  label:     string;
  options:   readonly string[];
  value:     string;
  hasError:  boolean;
  errorMsg?: string;
  isOpen:    boolean;
  onToggle:  () => void;
  onSelect:  (opt: string) => void;
  onClose:   () => void;
}

export default function DropdownSelect({
  id, label, options, value,
  hasError, errorMsg, isOpen,
  onToggle, onSelect, onClose,
}: DropdownSelectProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && !wrapRef.current?.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const btnClass = [
    styles.icDdBtn,
    !value   ? styles.icDdBtnPh   : "",
    isOpen   ? styles.icDdBtnOpen : "",
    hasError ? styles.icDdBtnErr  : "",
  ].filter(Boolean).join(" ");

  const chevronClass = [
    styles.icChevron,
    isOpen ? styles.icChevronOpen : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.icField}>
      <label className={styles.icLabel} htmlFor={id}>{label}</label>
      <div className={styles.icDdWrap} ref={wrapRef}>
        <button
          id={id}
          type="button"
          className={btnClass}
          onClick={onToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{value || "Seleccione una opción"}</span>
          <svg
            className={chevronClass}
            viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="4 6 8 10 12 6"/>
          </svg>
        </button>

        {isOpen && (
          <div className={styles.icDdMenu} role="listbox">
            <div className={styles.icDdHdr}>Opciones</div>
            {options.map((opt) => (
              <div
                key={opt}
                role="option"
                aria-selected={value === opt}
                className={`${styles.icDdOpt}${value === opt ? ` ${styles.icDdOptSel}` : ""}`}
                onClick={() => onSelect(opt)}
              >
                {value === opt ? (
                  <svg className={styles.icChk} viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 7 5.5 10.5 12 4"/>
                  </svg>
                ) : (
                  <span className={styles.icChkGap}/>
                )}
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      {hasError && errorMsg && (
        <span className={styles.icErr}>{errorMsg}</span>
      )}
    </div>
  );
}