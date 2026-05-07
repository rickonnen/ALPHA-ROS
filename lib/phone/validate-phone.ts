import { parsePhoneNumberFromString } from "libphonenumber-js";

export function validatePhoneE164(rawPhone: string) {
  const phone = parsePhoneNumberFromString(rawPhone);

  if (!phone || !phone.isValid()) {
    return {
      valid: false,
      phoneE164: null,
      error: "Número inválido. Usa formato internacional, ejemplo: +59170000000.",
    };
  }

  return {
    valid: true,
    phoneE164: phone.number,
    error: null,
  };
}

export function maskPhone(phone: string) {
  return phone.replace(/(\+\d{3})\d+(\d{3})$/, "$1****$2");
}