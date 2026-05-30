

/**
 * REQUISITO: Validar destinatario de email
 */

// RFC 5322 - Validación más estricta de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Detectar dominios sospechosos o inválidos
const SUSPICIOUS_DOMAINS = /(test|fake|example|invalid|localhost|noreply|donotreply)/i;

// Extensiones de dominio válidas mínimas
const VALID_TLDS = /\.(com|org|net|edu|gov|co|uk|de|fr|es|mx|ar|br|cl|pe|co\.ve|bo|es|info|biz|io|app|dev)$/i;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida el formato de un email
 * Retorna error si:
 * - No se proporciona email
 * - Email está vacío
 * - Email excede 254 caracteres
 * - Formato no es válido (usuario@dominio.ext)
 * - Contiene caracteres inválidos
 */
export function validateEmailFormat(email: string): ValidationResult {
  // Verificar que sea string y exista
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email es requerido" };
  }

  const trimmedEmail = email.trim();

  // Verificar que no esté vacío
  if (trimmedEmail.length === 0) {
    return { valid: false, error: "Email no puede estar vacío" };
  }

  // Verificar longitud máxima (RFC 5321)
  if (trimmedEmail.length > 254) {
    return { valid: false, error: "Email es demasiado largo (máximo 254 caracteres)" };
  }

  // Verificar que no tenga espacios
  if (/\s/.test(trimmedEmail)) {
    return { valid: false, error: "Email no puede contener espacios" };
  }

  // Verificar que tenga exactamente un @
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { valid: false, error: "Email debe contener exactamente un símbolo @" };
  }

  // Verificar formato básico (usuario@dominio.ext)
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: "Formato de email inválido (ejemplo: usuario@dominio.com)" };
  }

  const [localPart, domain] = trimmedEmail.split("@");

  // Verificar parte local (antes del @)
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: "Nombre de usuario inválido" };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { valid: false, error: "Nombre de usuario no puede comenzar o terminar con punto" };
  }

  if (localPart.includes("..")) {
    return { valid: false, error: "Nombre de usuario contiene puntos consecutivos" };
  }

  // Verificar dominio
  if (domain.length === 0 || domain.length > 255) {
    return { valid: false, error: "Dominio inválido" };
  }

  if (domain.startsWith(".") || domain.endsWith(".")) {
    return { valid: false, error: "Dominio no puede comenzar o terminar con punto" };
  }

  if (domain.includes("..")) {
    return { valid: false, error: "Dominio contiene puntos consecutivos" };
  }

  // Verificar que tenga una extensión válida
  if (!VALID_TLDS.test(domain)) {
    return { valid: false, error: "Dominio debe tener una extensión válida (.com, .org, etc.)" };
  }

  return { valid: true };
}

/**
 * Valida el destinatario completo
 */
export function validateRecipient(recipient?: string): ValidationResult {
  // Tarea 2: Rechazar cuando no se especifica destinatario
  if (!recipient) {
    return { valid: false, error: "No se especificó destinatario. El sistema no permite el envío sin destinatario." };
  }

  // Tarea 1: Rechazar formato inválido
  const formatValidation = validateEmailFormat(recipient);
  if (!formatValidation.valid) {
    return formatValidation;
  }

  const trimmedRecipient = recipient.trim();

  // Validación adicional: dominio sospechoso
  if (SUSPICIOUS_DOMAINS.test(trimmedRecipient)) {
    return { valid: false, error: "Dominio de email sospechoso o inválido. No se puede enviar a este destinatario." };
  }

  return { valid: true };
}

/**
 * Valida múltiples emails a la vez (para futuros envíos en lote)
 */
export function validateRecipients(recipients: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!recipients || recipients.length === 0) {
    return { valid: false, errors: ["Lista de destinatarios vacía"] };
  }
  
  recipients.forEach((recipient, index) => {
    const validation = validateRecipient(recipient);
    if (!validation.valid) {
      errors.push(`Email ${index + 1}: ${validation.error}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateContentSafety(content: string): ValidationResult {
  if (!content) {
    return { valid: false, error: "Contenido del correo está vacío" };
  }

  const forbiddenPatterns = [
    /password\s*[:=]/i,
    /contraseña\s*[:=]/i,
    /pwd\s*[:=]/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      return { valid: false, error: "El contenido contiene datos sensibles" };
    }
  }

  return { valid: true };
}
