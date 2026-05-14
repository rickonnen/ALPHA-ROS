import L from "leaflet"

type PoiVisualOptions = {
  icon?: string | null
  color?: string | null
  tipoNombre?: string | null
  size?: number
}

const DEFAULT_POI_COLOR = "#C26E5A"
const PROPERTY_COLOR = "#1F3A4D"

function normalizeIconKey(icon?: string | null, tipoNombre?: string | null) {
  const base = (icon ?? tipoNombre ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  if (base.includes("hospital") || base.includes("cross")) return "hospital"
  if (base.includes("fuel") || base.includes("surtidor")) return "fuel"
  if (base.includes("school") || base.includes("colegio")) return "school"
  if (base.includes("farmacia")) return "pharmacy"
  if (base.includes("shopping") || base.includes("supermercado")) return "market"
  if (base.includes("tree") || base.includes("parque")) return "park"
  if (base.includes("bus") || base.includes("transporte")) return "transport"
  if (base.includes("bank") || base.includes("banco")) return "bank"
  if (base.includes("restaurant") || base.includes("restaurante")) return "restaurant"
  return "pin"
}

function buildInnerIcon(iconKey: string, size: number) {
  const strokeWidth = Math.max(1.8, size * 0.08)
  const common = `stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"`
  const filledCommon = `fill="white" stroke="white" stroke-width="${strokeWidth * 0.5}" stroke-linejoin="round"`

  switch (iconKey) {
    case "hospital":
    case "pharmacy":
      return `<path d="M${size * 0.5} ${size * 0.24}v${size * 0.52}" ${common} />
        <path d="M${size * 0.24} ${size * 0.5}h${size * 0.52}" ${common} />`
    case "fuel":
      return `<path d="M${size * 0.33} ${size * 0.26}h${size * 0.22}v${size * 0.46}h-${size * 0.22}z" ${common} />
        <path d="M${size * 0.55} ${size * 0.34}h${size * 0.08}v${size * 0.18}c0 ${size * 0.08} ${size * 0.05} ${size * 0.12} ${size * 0.11} ${size * 0.12}" ${common} />`
    case "school":
      return `<path d="M${size * 0.22} ${size * 0.42} ${size * 0.5} ${size * 0.28} ${size * 0.78} ${size * 0.42} ${size * 0.5} ${size * 0.56}Z" ${filledCommon} />
        <path d="M${size * 0.3} ${size * 0.46}v${size * 0.2}h${size * 0.4}v-${size * 0.2}" ${common} />`
    case "market":
      return `<path d="M${size * 0.26} ${size * 0.38}h${size * 0.42}l-${size * 0.04} ${size * 0.2}h-${size * 0.32}z" ${common} />
        <circle cx="${size * 0.38}" cy="${size * 0.68}" r="${size * 0.04}" fill="white" />
        <circle cx="${size * 0.6}" cy="${size * 0.68}" r="${size * 0.04}" fill="white" />`
    case "park":
      return `<circle cx="${size * 0.5}" cy="${size * 0.38}" r="${size * 0.14}" ${filledCommon} />
        <path d="M${size * 0.5} ${size * 0.5}v${size * 0.18}" ${common} />
        <path d="M${size * 0.4} ${size * 0.68}h${size * 0.2}" ${common} />`
    case "transport":
      return `<rect x="${size * 0.28}" y="${size * 0.3}" width="${size * 0.44}" height="${size * 0.28}" rx="${size * 0.05}" ${common} />
        <path d="M${size * 0.34} ${size * 0.58}v${size * 0.1}M${size * 0.66} ${size * 0.58}v${size * 0.1}" ${common} />
        <circle cx="${size * 0.38}" cy="${size * 0.7}" r="${size * 0.04}" fill="white" />
        <circle cx="${size * 0.62}" cy="${size * 0.7}" r="${size * 0.04}" fill="white" />`
    case "bank":
      return `<path d="M${size * 0.22} ${size * 0.4} ${size * 0.5} ${size * 0.26} ${size * 0.78} ${size * 0.4}Z" ${filledCommon} />
        <path d="M${size * 0.3} ${size * 0.44}v${size * 0.18}M${size * 0.5} ${size * 0.44}v${size * 0.18}M${size * 0.7} ${size * 0.44}v${size * 0.18}M${size * 0.24} ${size * 0.64}h${size * 0.52}" ${common} />`
    case "restaurant":
      return `<path d="M${size * 0.38} ${size * 0.24}v${size * 0.22}M${size * 0.33} ${size * 0.24}v${size * 0.16}M${size * 0.43} ${size * 0.24}v${size * 0.16}" ${common} />
        <path d="M${size * 0.62} ${size * 0.24}v${size * 0.46}" ${common} />
        <path d="M${size * 0.3} ${size * 0.46}v${size * 0.24}M${size * 0.62} ${size * 0.46}l${size * 0.08} ${size * 0.08}" ${common} />`
    case "pin":
    default:
      return `<circle cx="${size * 0.5}" cy="${size * 0.46}" r="${size * 0.1}" fill="white" />
        <path d="M${size * 0.5} ${size * 0.18}c-${size * 0.16} 0-${size * 0.26} ${size * 0.12}-${size * 0.26} ${size * 0.26} 0 ${size * 0.18} ${size * 0.26} ${size * 0.38} ${size * 0.26} ${size * 0.38}s${size * 0.26}-${size * 0.2} ${size * 0.26}-${size * 0.38}c0-${size * 0.14}-${size * 0.1}-${size * 0.26}-${size * 0.26}-${size * 0.26}z" ${common} />`
  }
}

function buildPoiSvg({
  icon,
  color,
  tipoNombre,
  size = 34,
}: PoiVisualOptions) {
  const iconKey = normalizeIconKey(icon, tipoNombre)
  const fill = color || DEFAULT_POI_COLOR
  const inner = buildInnerIcon(iconKey, size)

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="${fill}" />
      ${inner}
    </svg>
  `
}

export function createPoiLeafletIcon(options: PoiVisualOptions = {}) {
  const size = options.size ?? 34
  return L.divIcon({
    className: "poi-map-icon",
    html: buildPoiSvg({ ...options, size }),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

export function createPropertyLeafletIcon(size = 38) {
  return L.divIcon({
    className: "property-map-icon",
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.42}" fill="${PROPERTY_COLOR}" />
        <path d="M${size * 0.28} ${size * 0.5} ${size * 0.5} ${size * 0.3} ${size * 0.72} ${size * 0.5}v${size * 0.18}h-${size * 0.14}v-${size * 0.1}h-${size * 0.16}v${size * 0.1}h-${size * 0.14}z" fill="white" />
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}
