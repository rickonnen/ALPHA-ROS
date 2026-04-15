export const PRICE_FORMAT_REGEX = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/;

export function formatPriceInput(inputValue: string): string {
  const sanitized = inputValue.replace(/[^\d,]/g, "");
  if (!sanitized) return "";
  const [rawInteger = "", ...rest] = sanitized.split(",");
  const hasComma = sanitized.includes(",");
  const integerDigits = rawInteger.replace(/^0+(?=\d)/, "");
  const normalizedInteger = integerDigits === "" ? (hasComma ? "0" : "") : integerDigits;
  const integerWithThousands = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalDigits = rest.join("").slice(0, 2);
  if (!hasComma) return integerWithThousands;
  return `${integerWithThousands},${decimalDigits}`;
}

export function parseFormattedPrice(priceValue: string): number | null {
  if (!priceValue) return null;
  const normalized = priceValue.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toBackendPrice(priceValue: string): string {
  return priceValue.replace(/\./g, "").replace(",", ".");
}