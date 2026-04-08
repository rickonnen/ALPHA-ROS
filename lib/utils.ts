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


// Lista de TLDs válidos y comunes (extensiones de dominio)
const VALID_TLDS = new Set<string>([
  // Los más comunes
  "com", "org", "net", "edu", "gov", "mil", "int",
  // Códigos de país más comunes
  "es", "mx", "ar", "co", "pe", "cl", "br", "uk", "us", "de", "fr", "it", "pt", "nl", "be", "se", "ch", "au", "nz", "jp", "cn", "in", "ru", "kr", "th", "id", "ph", "sg", "my", "vn", "ie", "gr", "pl", "cz", "tr", "ua", "kz", "ng", "za", "eg", "ae", "il", "th", "br", "ca", "mx",
  // Extensiones genéricas más nuevas
  "info", "biz", "name", "pro", "mobi", "asia", "tel", "travel", "xxx", "cat", "jobs", "post", "geo", "aero", "coop", "museum",
  // Nuevos TLDs (gTLD)
  "app", "blog", "cloud", "dev", "io", "online", "shop", "site", "me", "tv", "cc", "ws", "ai", "work", "tech", "xyz", "top", "win", "download", "stream", "webcam", "wiki", "link", "email", "support",
  // País genéricos populares
  "com.ar", "com.br", "com.mx", "com.es", "co.uk", "co.za", "com.au", "com.cn", "com.my", "com.ph", "com.th", "com.vn", "co.nz", "ie", "fr", "de", "it", "nl", "be", "pt", "gr",
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
  
  // 5. Validar que cada etiqueta del dominio sea válido
  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return false;
  }
  
  for (const part of domainParts) {
    if (part.length === 0 || part.length > 63) {
      return false;
    }
    // Cada parte solo puede contener caracteres alfanuméricos y guiones
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return false;
    }
    // No puede empezar o terminar con guión
    if (part.startsWith("-") || part.endsWith("-")) {
      return false;
    }
  }
  
  // 6. Validar el TLD (extensión)
  // Detectar si el TLD es válido conocido, o si es un formato válido (para extensiones nuevas)
  const tld = domainParts[domainParts.length - 1];
  
  // Verificar en lista de TLDs válidos conocidos
  if (!VALID_TLDS.has(tld)) {
    // Si no está en la lista, validar formato básico pero ser más restrictivo
    // Solo aceptar TLDs alfabéticos de al menos 2 caracteres
    if (!/^[a-z]{2,6}$/.test(tld)) {
      return false;
    }
  }
  
  // 7. Última validación: verificar si el dominio está en lista de sospechosos
  if (SUSPICIOUS_DOMAINS[domain]) {
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
