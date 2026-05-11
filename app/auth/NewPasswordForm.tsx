"use client";
import { useState } from "react";
import { ArrowLeft, Lock, Eye, EyeOff, Check } from "lucide-react";

interface NewPasswordFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "Entre 8 y 15 caracteres", met: password.length >= 8 && password.length <= 15 },
    { label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
    { label: "Al menos un número", met: /[0-9]/.test(password) },
    { label: "Al menos un carácter especial (@, !, #...)", met: /[^a-zA-Z0-9]/.test(password) },
    { label: "Sin espacios en blanco", met: password.length > 0 && !/\s/.test(password) },
  ];

  const metCount = reqs.filter(r => r.met).length;
  const strength = metCount <= 1 ? "Débil" : metCount <= 3 ? "Media" : "Fuerte";
  const barColor = metCount <= 1 ? "#ef4444" : metCount <= 3 ? "#f59e0b" : "#22c55e";
  const barWidth = `${(metCount / reqs.length) * 100}%`;

  if (password.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
      <div style={{ height: "6px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: barWidth, backgroundColor: barColor, borderRadius: "4px", transition: "all 0.3s" }} />
      </div>
      <p style={{ fontSize: "12px", fontWeight: "600", color: barColor, margin: 0 }}>Contraseña {strength}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {reqs.map((req, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Check size={13} style={{ color: req.met ? "#22c55e" : "#d1d5db", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: req.met ? "#22c55e" : "#6b7280" }}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewPasswordForm({ email, onBack, onSuccess }: NewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!password) e.password = "Este campo es obligatorio";
    else if (password.length < 8 || password.length > 15) e.password = "Entre 8 y 15 caracteres";
    else if (!/[A-Z]/.test(password)) e.password = "Debe incluir al menos una mayúscula";
    else if (!/[0-9]/.test(password)) e.password = "Debe incluir al menos un número";
     else if (/\s/.test(password)) e.password = "La contraseña no puede contener espacios en blanco"; 
    if (!confirm) e.confirm = "Este campo es obligatorio";
    else if (confirm !== password) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setGeneralError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setGeneralError(data.error || "Error al actualizar la contraseña"); return; }
      onSuccess();
    } catch {
      setGeneralError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B47B65", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>Nueva contraseña</h2>
      </div>

      {generalError && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", margin: 0 }}>{generalError}</p>}

      {/* Campo nueva contraseña */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Nueva contraseña</label>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
          borderRadius: "6px", padding: "10px 12px", gap: "10px",
          backgroundColor: errors.password ? "#fee2e2" : "white",
        }}>
          <Lock size={18} style={{ color: "#9ca3af" }} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder=""
            value={password}
            maxLength={15}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
            style={{ flex: 1, fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent", color: "#1f2937" }}
          />
          <span style={{ fontSize: "12px", color: password.length === 15 ? "#ef4444" : "#9ca3af" }}>{password.length}/15</span>
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.password}</p>}
        <PasswordRequirements password={password} />
      </div>

      {/* Campo confirmar contraseña */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Confirmar contraseña</label>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1px solid ${errors.confirm ? "#ef4444" : "#d1d5db"}`,
          borderRadius: "6px", padding: "10px 12px", gap: "10px",
          backgroundColor: errors.confirm ? "#fee2e2" : "white",
        }}>
          <Lock size={18} style={{ color: "#9ca3af" }} />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder=""
            value={confirm}
            maxLength={15}
            onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
            style={{ flex: 1, fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent", color: "#1f2937" }}
          />
          <span style={{ fontSize: "12px", color: confirm.length === 15 ? "#ef4444" : "#9ca3af" }}>{confirm.length}/15</span>
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirm && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{errors.confirm}</p>}
      </div>

      <button onClick={handleSave} disabled={loading} style={{
        width: "100%", backgroundColor: loading ? "#e5a89f" : "#C85A4F",
        color: "white", fontWeight: "bold", padding: "12px",
        borderRadius: "6px", border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1, fontSize: "14px",
      }}>
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </div>
  );
}