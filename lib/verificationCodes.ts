import fs from "fs";
import path from "path";

interface VerificationData {
  code: string;
  expiresAt: number;
  email: string;
}

// Ruta del archivo donde se guardan los códigos (no toca BD)
const CODES_FILE = path.join(process.cwd(), ".next", "verification-codes.json");

/**
 * Lee los códigos del archivo JSON
 */
function loadCodesFromFile(): Map<string, VerificationData> {
  try {
    // Crear carpeta si no existe
    const dir = path.dirname(CODES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Si el archivo no existe, retornar mapa vacío
    if (!fs.existsSync(CODES_FILE)) {
      return new Map();
    }

    const data = fs.readFileSync(CODES_FILE, "utf-8");
    const parsed = JSON.parse(data);

    // Convertir array a Map
    const codeMap = new Map<string, VerificationData>();
    if (Array.isArray(parsed)) {
      parsed.forEach((item: [string, VerificationData]) => {
        codeMap.set(item[0], item[1]);
      });
    }

    return codeMap;
  } catch (error) {
    console.log("[VERIFICATION] Archivo de códigos no encontrado, iniciando con vacío");
    return new Map();
  }
}

/**
 * Guarda los códigos en archivo JSON
 */
function saveCodesToDisk(codes: Map<string, VerificationData>): void {
  try {
    const dir = path.dirname(CODES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Convertir Map a array para guardar en JSON
    const data = Array.from(codes.entries());
    fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[VERIFICATION] Error guardando códigos:", error);
  }
}

// Cargar códigos al iniciar
let verificationCodes = loadCodesFromFile();

/**
 * Genera un código de 6 dígitos aleatorio
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Guarda un código en archivo y retorna el tiempo de expiración
 */
export function saveVerificationCode(email: string): {code: string; expiresAt: number} {
  const code = generateVerificationCode();
  const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutos
  
  verificationCodes.set(email, {
    code,
    expiresAt,
    email,
  });

  // Guardar en disco
  saveCodesToDisk(verificationCodes);

  console.log(`[VERIFICATION] Código generado para ${email}: ${code} (Expira en 2 min)`);
  
  return { code, expiresAt };
}

/**
 * Valida un código de verificación
 */
export function verifyCode(email: string, code: string): { valid: boolean; error?: string } {
  // Recargar códigos del archivo (pueden haber cambiado)
  verificationCodes = loadCodesFromFile();

  const data = verificationCodes.get(email);

  if (!data) {
    return { valid: false, error: "No hay código de verificación pendiente para este email" };
  }

  if (Date.now() > data.expiresAt) {
    verificationCodes.delete(email);
    saveCodesToDisk(verificationCodes);
    return { valid: false, error: "El código ha expirado. Solicita uno nuevo." };
  }

  if (data.code !== code) {
    return { valid: false, error: "El código es incorrecto" };
  }

  // Código válido, eliminarlo para evitar reutilización
  verificationCodes.delete(email);
  saveCodesToDisk(verificationCodes);
  return { valid: true };
}

/**
 * Limpia códigos expirados
 */
export function cleanupExpiredCodes(): number {
  verificationCodes = loadCodesFromFile();
  let cleaned = 0;
  const now = Date.now();

  verificationCodes.forEach((data, email) => {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    saveCodesToDisk(verificationCodes);
    console.log(`[CLEANUP] Se eliminaron ${cleaned} códigos expirados`);
  }

  return cleaned;
}

