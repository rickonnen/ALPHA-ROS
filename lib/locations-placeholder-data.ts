// PLACEHOLDER - Este archivo es temporal para desarrollo y pruebas
// TODO: INTEGRACIÓN - Eliminar este archivo cuando el equipo de filtros
// entregue los datos reales desde la base de datos via Prisma
// Estructura que debe respetar la consulta real:
// {
//   id: number        ← id_publicacion
//   lat: number       ← Ubicacion.latitud
//   lng: number       ← Ubicacion.longitud
//   direccion: string ← Ubicacion.direccion
//   zona: string      ← Ubicacion.zona
//   precio: string    ← Publicacion.precio (formateado como "$89K")
// }

export type Location = {
  id: number;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  precio: string;
}

export const locations: Location[] = [
  {
    id: 1,
    direccion: "Av. América E-0234",
    zona: "Queru Queru",
    lat: -17.372393,
    lng: -66.162574,
    precio: "$89K",
  },
  {
    id: 2,
    direccion: "Calle Baptista N-0456",
    zona: "Centro",
    lat: -17.3935,
    lng: -66.1571,
    precio: "$212K",
  },
  {
    id: 3,
    direccion: "Av. Blanco Galindo Km 5",
    zona: "Hipódromo",
    lat: -17.3701,
    lng: -66.2103,
    precio: "$246K",
  },
  {
    id: 4,
    direccion: "Calle Colombia O-0891",
    zona: "Cala Cala",
    lat: -17.3763,
    lng: -66.1689,
    precio: "$150K",
  },
  {
    id: 5,
    direccion: "Av. Pando N-0123",
    zona: "Sarco",
    lat: -17.3654,
    lng: -66.1423,
    precio: "$178K",
  },
  {
    id: 6,
    direccion: "Calle Sucre S-0345",
    zona: "Sud",
    lat: -17.4102,
    lng: -66.1534,
    precio: "$95K",
  },
  {
    id: 7,
    direccion: "Av. Villazón E-0567",
    zona: "Tupuraya",
    lat: -17.3723,
    lng: -66.1756,
    precio: "$320K",
  },
  {
    id: 8,
    direccion: "Calle Nataniel Aguirre",
    zona: "Centro",
    lat: -17.3941,
    lng: -66.1558,
    precio: "$267K",
  },
  {
    id: 9,
    direccion: "Av. Circunvalación S-0789",
    zona: "Mayorazgo",
    lat: -17.4034,
    lng: -66.1712,
    precio: "$134K",
  },
  {
    id: 10,
    direccion: "Calle Hamiraya N-0234",
    zona: "Temporal",
    lat: -17.3589,
    lng: -66.1489,
    precio: "$198K",
  },
  {
    id: 11,
    direccion: "Av. Petrolera Km 3",
    zona: "Valle Hermoso",
    lat: -17.4156,
    lng: -66.1623,
    precio: "$112K",
  },
  {
    id: 12,
    direccion: "Calle Ladislao Cabrera",
    zona: "Cala Cala",
    lat: -17.3789,
    lng: -66.1701,
    precio: "$445K",
  },
  {
    id: 13,
    direccion: "Av. Uyuni E-0456",
    zona: "Muyurina",
    lat: -17.3678,
    lng: -66.1534,
    precio: "$167K",
  },
  {
    id: 14,
    direccion: "Calle Lanza S-0123",
    zona: "Sud",
    lat: -17.4089,
    lng: -66.1489,
    precio: "$78K",
  },
  {
    id: 15,
    direccion: "Av. República E-0678",
    zona: "Queru Queru",
    lat: -17.3845,
    lng: -66.1645,
    precio: "$389K",
  },
];