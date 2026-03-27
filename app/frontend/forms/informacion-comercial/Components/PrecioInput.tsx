"use client";

import styles from "../InformacionComercial.module.css";

interface PrecioInputProps {
  value:     string;
  hasError:  boolean;
  errorMsg?: string;
  onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur:    (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function PrecioInput({
  value, hasError, errorMsg, onChange, onBlur,
}: PrecioInputProps) {
  return (
    <div className={`${styles.icField} ${styles.icFieldPrecio}`} style={{ marginBottom: 0 }}>
      <label className={styles.icLabel} htmlFor="precio">Precio</label>
      <div className={styles.icPrecioWrap}>
        <input
          id="precio"
          name="precio"
          type="text"
          inputMode="decimal"
          className={`${styles.icInput}${hasError ? ` ${styles.icInputErr}` : ""}`}
          placeholder="0.00 Bs."
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="off"
        />
      </div>
      {hasError && errorMsg && (
        <span className={styles.icErr}>{errorMsg}</span>
      )}
    </div>
  );
}