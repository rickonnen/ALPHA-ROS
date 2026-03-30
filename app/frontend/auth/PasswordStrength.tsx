"use client";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): {
  level: "debil" | "media" | "fuerte" | "";
  label: string;
  color: string;
  width: string;
} {
  if (!password) return { level: "", label: "", color: "", width: "0%" };

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "debil",  label: "Débil",  color: "bg-red-500",    width: "33%"  };
  if (score <= 3) return { level: "media",  label: "Media",  color: "bg-yellow-500", width: "66%"  };
  return             { level: "fuerte", label: "Fuerte", color: "bg-green-500",  width: "100%" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { label, color, width } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1 mb-2">
      {/* Barra de progreso */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          //className={h-full rounded-full transition-all duration-300 ${color}}
          //style={{ width }}
        />
      </div>

      {/* Etiqueta */}
      <p className={`text-xs mt-1 font-medium
        ${color === "bg-red-500"    ? "text-red-500"    : ""}
        ${color === "bg-yellow-500" ? "text-yellow-500" : ""}
        ${color === "bg-green-500"  ? "text-green-600"  : ""}
      `}>
        Contraseña {label}
      </p>
    </div>
  );
}