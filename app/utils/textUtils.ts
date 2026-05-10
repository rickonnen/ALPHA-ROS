/**
 * Función para dividir palabras excesivamente largas y evitar desbordamientos de diseño.
 * @param text El texto completo a evaluar.
 * @param maxLength La cantidad máxima de caracteres permitidos por palabra antes de cortarla. Por defecto es 24.
 * @returns El texto formateado con saltos de línea invisibles en las palabras largas.
 */
export const FnFormatLongWords = (text: string, maxLength: number = 24): string => {
  if (!text) return "";
  
  return text.split(" ").map(word => {
    if (word.length > maxLength) {
      const regex = new RegExp(`.{1,${maxLength}}`, 'g');
      return word.match(regex)?.join(" \u200B") || word;
    }
    return word;
  }).join(" ");
};