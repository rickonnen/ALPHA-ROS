/**
 * Lib: paises
 * Author: Miguel Angel Condori
 * Date: 2026-04-17
 * Description: Lista de países de América Latina y América del Norte
 * disponibles para la selección de código de país en el registro
 * y gestión de números de teléfono.
 *
 * Cada entrada contiene:
 *  - iso: string (código ISO 3166-1 alpha-2 del país, usado para mostrar la bandera)
 *  - nombre: string (nombre del país en español)
 *  - codigo: string (código de llamada internacional, ej: "+591")
 *
 * Uso:
 *  Importado en TelefonosView para poblar el selector de país y en
 *  parsearPaises para identificar el país de un número almacenado.
 */

export const PAISES = [
  { iso: "ar", nombre: "Argentina", codigo: "+54" },
  { iso: "bo", nombre: "Bolivia", codigo: "+591" },
  { iso: "br", nombre: "Brasil", codigo: "+55" },
  { iso: "ca", nombre: "Canadá", codigo: "+1" },
  { iso: "cl", nombre: "Chile", codigo: "+56" },
  { iso: "co", nombre: "Colombia", codigo: "+57" },
  { iso: "cr", nombre: "Costa Rica", codigo: "+506" },
  { iso: "cu", nombre: "Cuba", codigo: "+53" },
  { iso: "ec", nombre: "Ecuador", codigo: "+593" },
  { iso: "sv", nombre: "El Salvador", codigo: "+503" },
  { iso: "us", nombre: "Estados Unidos", codigo: "+1" },
  { iso: "gt", nombre: "Guatemala", codigo: "+502" },
  { iso: "ht", nombre: "Haití", codigo: "+509" },
  { iso: "hn", nombre: "Honduras", codigo: "+504" },
  { iso: "jm", nombre: "Jamaica", codigo: "+1" },
  { iso: "mx", nombre: "México", codigo: "+52" },
  { iso: "ni", nombre: "Nicaragua", codigo: "+505" },
  { iso: "pa", nombre: "Panamá", codigo: "+507" },
  { iso: "py", nombre: "Paraguay", codigo: "+595" },
  { iso: "pe", nombre: "Perú", codigo: "+51" },
  { iso: "pr", nombre: "Puerto Rico", codigo: "+1" },
  { iso: "do", nombre: "República Dominicana", codigo: "+1" },
  { iso: "tt", nombre: "Trinidad y Tobago", codigo: "+1" },
  { iso: "uy", nombre: "Uruguay", codigo: "+598" },
  { iso: "ve", nombre: "Venezuela", codigo: "+58" },
];