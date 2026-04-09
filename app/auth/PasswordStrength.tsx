"use client";

interface PasswordStrengthProps {
  password: string;
}

// Cada requisito que debe cumplir la contraseña
const requirements = [
  { id: 'length',   label: 'Entre 8 y 15 caracteres', test: (p: string) => p.length >= 8 && p.length <= 15 },
  { id: 'upper',    label: 'Al menos una mayúscula',   test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',   label: 'Al menos un número',       test: (p: string) => /[0-9]/.test(p) },
  { id: 'special',  label: 'Al menos un carácter especial (@, !, #...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { id: 'nospaces', label: 'Sin espacios en blanco',   test: (p: string) => !/\s/.test(p) },
];

function getStrength(password: string): { level: 'debil' | 'media' | 'fuerte' | ''; label: string; color: string; width: string } {
  if (!password) return { level: '', label: '', color: '', width: '0%' };

  const passed = requirements.filter(r => r.test(password)).length;

  if (passed <= 2) return { level: 'debil',  label: 'Débil',  color: '#ef4444', width: '33%' };
  if (passed <= 4) return { level: 'media',  label: 'Media',  color: '#eab308', width: '66%' };
  return              { level: 'fuerte', label: 'Fuerte', color: '#22c55e', width: '100%' };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { label, color, width } = getStrength(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: '6px', marginBottom: '8px' }}>

      {/* Barra de progreso */}
      <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.3s ease, background-color 0.3s ease',
            width,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Etiqueta de nivel */}
      <p style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600', color }}>
        Contraseña {label}
      </p>

      {/* Lista de requisitos en tiempo real */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {requirements.map(req => {
          const ok = req.test(password);
          return (
            <li key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: ok ? '#16a34a' : '#9ca3af' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{ok ? '✓' : '○'}</span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}