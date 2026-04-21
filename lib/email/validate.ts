/**
 * CRITERIO 5: Validar formato email antes de enviar
 * CRITERIO 6: Rechazar si no hay destinatario
 * CRITERIO 13: NO incluir datos sensibles
 * TAREA 10: Validación robusta de email
 */

// RFC 5322 - Validación más estricta de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Detectar dominios sospechosos
const SUSPICIOUS_DOMAINS = /(test|fake|example|invalid|localhost)/i;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmailFormat(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email es requerido" };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { valid: false, error: "Email no puede estar vacío" };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: "Email demasiado largo" };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: "Formato de email inválido" };
  }

  return { valid: true };
}

export function validateRecipient(recipient?: string): ValidationResult {
  if (!recipient) {
    return { valid: false, error: "No se especificó destinatario" };
  }
  
  const formatValidation = validateEmailFormat(recipient);
  if (!formatValidation.valid) {
    return formatValidation;
  }
  
  // Validar que no sea un dominio sospechoso
  if (SUSPICIOUS_DOMAINS.test(recipient)) {
    return { valid: false, error: "Dominio de email sospechoso o inválido" };
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
