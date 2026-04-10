import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Lista de dominios comunes sospechosos (typos frecuentes)
const SUSPICIOUS_DOMAINS: Record<string, string> = {
  // Gmail typos
  "gmil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gaml.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.co.uk": "gmail.com",
  // Yahoo typos
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.es": "yahoo.com",
  "yaho.com": "yahoo.com",
  // Hotmail typos
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.es": "hotmail.com",
  "hotmai.com": "hotmail.com",
  // Outlook typos
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  // Otros proveedores comunes
  "icloud.co": "icloud.com",
  "icloud.es": "icloud.com",
  "protonmail.co": "protonmail.com",
};

// Dominios específicos permitidos (whitelist)
const ALLOWED_DOMAINS = new Set([
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'office365.com',
  'yahoo.com'
]);

/**
 * Valida un correo electrónico con criterios estrictos
 * @param email - Correo electrónico a validar
 * @returns true si es válido, false si no lo es
 */
export function isValidEmail(email: string): boolean {
  const trimmedEmail = email.trim().toLowerCase();
  
  // 1. Validación básica de formato
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }
  
  // 2. Dividir en partes
  const [localPart, domain] = trimmedEmail.split("@");
  
  // 3. Validaciones de la parte local (antes del @)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // No puede empezar o terminar con punto
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false;
  }
  
  // No puede tener puntos consecutivos
  if (localPart.includes("..")) {
    return false;
  }
  
  // 4. Validaciones del dominio
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }
  
  // El dominio no puede empezar o terminar con punto o guión
  if (domain.startsWith(".") || domain.startsWith("-") || 
      domain.endsWith(".") || domain.endsWith("-")) {
    return false;
  }
  
  // No puede tener puntos consecutivos
  if (domain.includes("..")) {
    return false;
  }
  
  // 5. VERIFICACIÓN CLAVE: Solo aceptar dominios en la whitelist o .edu
  if (!ALLOWED_DOMAINS.has(domain) && !domain.endsWith('.edu')) {
    return false;
  }
  
  return true;
}

/**
 * Intenta detectar si hay un typo común en el dominio del correo
 * @param email - Correo electrónico a validar
 * @returns El dominio correcto sugerido, o null si no hay sugerencia
 */
export function getSuspiciousDomainSuggestion(email: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const [, domain] = trimmedEmail.split("@");
  
  if (!domain) {
    return null;
  }
  
  // Buscar si el dominio está en la lista de sospechosos
  return SUSPICIOUS_DOMAINS[domain] || null;
}


