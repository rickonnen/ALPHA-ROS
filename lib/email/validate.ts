/**
 * CRITERIO 5: Validar formato email antes de enviar
 * CRITERIO 6: Rechazar si no hay destinatario
 * CRITERIO 13: NO incluir datos sensibles
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  return validateEmailFormat(recipient);
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
