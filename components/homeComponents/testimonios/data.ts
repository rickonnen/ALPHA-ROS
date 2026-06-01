// src/components/Home/Testimonios/data.ts

export interface Testimonio {
  id: number;
  nombre: string;
  ciudad: string;
  comentario: string;
  estrellas: number;
  solucion: string; // Lo que el sitio resolvió
}

export const testimoniosData: Testimonio[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    ciudad: "COCHABAMBA",
    comentario: "Logré encontrar un anticrético seguro en menos de 48 horas. La verificación de dueños me dio la confianza que necesitaba.",
    estrellas: 5,
    solucion: "Seguridad y Rapidez"
  },
  {
    id: 2,
    nombre: "Maria Rojas",
    ciudad: "SANTA CRUZ",
    comentario: "Vender mi departamento era un dolor de cabeza hasta que usé los filtros premium del sitio.",
    estrellas: 5,
    solucion: "Venta Efectiva"
  },
  {
    id: 3,
    nombre: "Luis Arce",
    ciudad: "LA PAZ",
    comentario: "La mejor interfaz para comparar precios reales en la zona sur. Me ahorró semanas de visitas en vano.",
    estrellas: 4,
    solucion: "Ahorro de Tiempo"
  },
  {
    id: 4,
    nombre: "Carla Mamani",
    ciudad: "POTOSÍ",
    comentario: "Buscaba un alquiler económico cerca del centro y los filtros por precio y zona me ayudaron a encontrar la opción perfecta el mismo día.",
    estrellas: 5,
    solucion: "Búsqueda de Alquiler"
  },
  {
    id: 5,
    nombre: "Diego Torrez",
    ciudad: "TARIJA",
    comentario: "Quería comprar un lote para inversión. El mapa interactivo me permitió ver claramente las opciones en las afueras de la ciudad.",
    estrellas: 5,
    solucion: "Inversión en Terrenos"
  },
  {
    id: 6,
    nombre: "Sofía Vargas",
    ciudad: "SUCRE",
    comentario: "Como estudiante de la universidad, necesitaba un cuarto rápido. Pude contactar directamente al propietario sin pagar comisiones extra.",
    estrellas: 4,
    solucion: "Vivienda Estudiantil"
  },
  {
    id: 7,
    nombre: "Marcelo Quiroga",
    ciudad: "ORURO",
    comentario: "Encontré el local comercial ideal para mi nuevo negocio. La información de los metros cuadrados y la ubicación exacta fue clave.",
    estrellas: 5,
    solucion: "Local Comercial"
  },
  {
    id: 8,
    nombre: "Elena Guzmán",
    ciudad: "COCHABAMBA",
    comentario: "La plataforma es súper fluida y el diseño es muy claro. Pude comparar varias opciones de casas en Tiquipaya desde mi celular.",
    estrellas: 5,
    solucion: "Experiencia Móvil"
  }
];